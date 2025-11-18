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

      const computedMetrics = {
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

      // Save sample rows only in DB
      const dataset = await dataModel.create({
        user_id: req.body.user_id || null,
        r2_url: fileUrl,
        data: sampleRows,
      });

      // AI Chart Selection
      const prompt = generateAiPromt(computedMetrics, aggregations, sampleRows);
      const aiResult = await runAi(prompt);

      //  **Generate REAL chart data**
      const finalCharts = generateChartData(aiResult?.charts || [], aggregations);

      // Return response
      return res.json({
        success: true,
        datasetId: dataset._id,
        r2Url: fileUrl,
        data: {
          metrics: {
            ...computedMetrics,
            charts_generated: finalCharts.length,
          },
          charts: finalCharts,
          summary: aiResult?.insights || [],
          best_columns: aiResult?.best_columns || {},
          key_fields: aiResult?.key_fields || [],
        },
        aggregations, // optional
      });
    });

    readStream.on("error", (err) => {
      return res.status(500).json({ success: false, message: "CSV parse error", error: err });
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// Count missing data
function calculateTotalMissing(aggregations: any): number {
  let total = 0;
  for (const col in aggregations.numeric) total += aggregations.numeric[col].missing;
  for (const col in aggregations.categorical) total += aggregations.categorical[col].missing;
  return total;
}

// GLOBAL API KEY ROTATION (your requested style)
let apiKeyIndex = 0;
const apiKeys = process.env.GEMINI_API_KEY!.split(",").map((k) => k.trim());

let currentApi = apiKeys[apiKeyIndex];
let genAI = new GoogleGenerativeAI(currentApi);
let model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const switchApi = () => {
  apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
  currentApi = apiKeys[apiKeyIndex];

  genAI = new GoogleGenerativeAI(currentApi);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  console.log(" API Key switched to:", currentApi);
};

// RUN AI WITH SINGLE-KEY + ROTATION ON FAILURE
async function runAi(prompt: string) {
  let attempts = 0;

  while (attempts < apiKeys.length) {
    try {
      console.log(` Using Gemini API key #${apiKeyIndex + 1}`);

      const response = await model.generateContent(prompt);

      let raw = response.response.text().replace(/```json|```/g, "").trim();
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) {
        throw new Error("AI returned no JSON block");
      }

      return JSON.parse(raw.substring(start, end + 1));
    } catch (err: any) {
      const msg = String(err?.message || "");

      console.error(` Gemini Error (key ${apiKeyIndex + 1}):`, msg);

      // QUOTA / LIMIT ERRORS → ROTATE
      if (
        err.status === 503 ||
        msg.includes("quota") ||
        msg.includes("429") ||
        msg.includes("exceeded")
      ) {
        console.log(" Limit reached. Switching API key...");
        switchApi();
        attempts++;
        continue; // try with next key
      }

      // OTHER ERRORS → DO NOT ROTATE, JUST RETURN
      console.error(" Non-quota error. Stopping.");
      return null;
    }
  }

  console.error(" All API keys exhausted.");
  return null;
}

