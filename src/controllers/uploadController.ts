// controllers/fileParsing.ts
import type { Request, Response } from "express";
import fs from "fs";
import csv from "csv-parser";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2Client";
import dataModel from "../model/dataModel";
import {
  initStreamingAgg,
  updateStreamingAgg,
  finalizeStreamingAgg,
} from "../utils/streamAggregations";
import { generateAiPromt } from "../utils/aiPrompt";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateChartData } from "../utils/chartHelpers";
import { generateChartsFromData } from "../utils/fallbackCharts"; 

interface UserPayload {
  userId: string;
  isGuest?: boolean;
}

type AuthedRequest = Request & {
  user?: UserPayload;
};

// GLOBAL API KEY ROTATION
let apiKeyIndex = 0;
const apiKeys = process.env.GEMINI_API_KEY!.split(",").map(k => k.trim());

let currentApi = apiKeys[apiKeyIndex];

let genAI = new GoogleGenerativeAI(currentApi);
let model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const switchApi = () => {
  apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
  currentApi = apiKeys[apiKeyIndex];
  genAI = new GoogleGenerativeAI(currentApi);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  console.log("Switched to API key:", currentApi);
};


async function runAi(prompt: string) {
  let attempts = 0;

  while (attempts < apiKeys.length) {
    try {
      console.log(`Using Gemini Key #${apiKeyIndex + 1}`);

      const res = await model.generateContent(prompt);
      let raw = res.response.text().replace(/```json|```/g, "").trim();

      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("Invalid JSON");

      return JSON.parse(raw.substring(start, end + 1));
    } catch (err: any) {
      const msg = String(err?.message || "");
      console.log("Gemini Error:", msg);

      // QUOTA / LIMIT errors → rotate key
      if (
        msg.includes("quota") ||
        msg.includes("429") ||
        msg.includes("exceeded") ||
        err.status === 503
      ) {
        console.log(" AI limit hit → switching key...");
        switchApi();
        attempts++;
        continue;
      }

      // OTHER ERRORS → stop trying AI
      console.log("Non-limit AI failure. Stopping AI.");
      return null;
    }
  }

  console.log("All AI keys failed");
  return null;
}


// FILE PARSING (MAIN CONTROLLER)
export const fileParsing = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File not uploaded" });

    const file = req.file;
    const filepath = file.path;

    const streamAgg = initStreamingAgg();
    const sampleRows: any[] = [];

    let headers: string[] = [];
    const readStream = fs.createReadStream(filepath).pipe(csv());

    readStream.on("headers", (hdr) => (headers = hdr));

    readStream.on("data", (row) => {
      if (sampleRows.length < 10) sampleRows.push(row);
      updateStreamingAgg(streamAgg, row);
    });

    readStream.on("end", async () => {
      const aggregations = finalizeStreamingAgg(streamAgg);

      const metrics = {
        total_rows: aggregations.meta.total_rows,
        total_columns: aggregations.meta.total_columns,
        missing_values: calculateTotalMissing(aggregations),
      };

      // Upload CSV
      const fileBuffer = fs.readFileSync(filepath);
      const fileName = `${Date.now()}_${file.originalname}`;

      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: fileName,
          Body: fileBuffer,
          ContentType: "text/csv",
        })
      );

      const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
      fs.unlinkSync(filepath);
            //  Get user id from middleware 
      const authedReq = req as AuthedRequest;
      const userId = authedReq.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not identified',
        });
      }

      // Save sample rows
      const dataset = await dataModel.create({
        user_id: req.body.user_id || null,
        r2_url: fileUrl,
        data: sampleRows,
        aggregations: aggregations,   
      });


      // AI ATTEMPT
      const prompt = generateAiPromt(metrics, aggregations, sampleRows);
      let ai = await runAi(prompt);

      // FALLBACK
      if (!ai) {
        console.log("AI failed — Using fallback chart generator");

        const fallback = generateChartsFromData(sampleRows);

        ai = {
          best_columns: {},
          charts: [
            {
              type: "bar",
              title: `${fallback.columns.barChartNumeric} by ${fallback.columns.barChartCategory}`,
              x: fallback.columns.barChartCategory,
              y: fallback.columns.barChartNumeric,
              data: fallback.barData,
            },
            {
              type: "pie",
              title: `Distribution of ${fallback.columns.pieChartCategory}`,
              x: fallback.columns.pieChartCategory,
              value: "count",
              data: fallback.pieData,
            },
          ],
          insights: [
            `Dataset has ${metrics.total_rows} rows and ${metrics.total_columns} columns.`,
            `${metrics.missing_values} missing values detected.`,
            `Top bar category: ${fallback.barData[0]?.xValue || "N/A"}`,
          ],
          key_fields: Object.keys(sampleRows[0] || {}).slice(0, 4),
        };
      }

      // Generate REAL chart-ready data
      const finalCharts = generateChartData(ai.charts || [], aggregations);

      return res.json({
        success: true,
        datasetId: dataset._id,
        r2Url: fileUrl,
        data: {
          metrics: { ...metrics, charts_generated: finalCharts.length },
          charts: finalCharts,
          summary: ai.insights || [],
          best_columns: ai.best_columns || {},
          key_fields: ai.key_fields || [],
        },
        aggregations,
      });
    });

    readStream.on("error", (err) => {
      return res.status(500).json({ success: false, message: "CSV parse error", error: err });
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err });
  }
};


// Calculate missing
function calculateTotalMissing(aggregations: any): number {
  let total = 0;
  for (const col in aggregations.numeric) total += aggregations.numeric[col].missing;
  for (const col in aggregations.categorical) total += aggregations.categorical[col].missing;
  return total;
}


