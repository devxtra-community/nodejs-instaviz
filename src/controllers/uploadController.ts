// controllers/fileParsing.ts
import type { Request, Response } from "express";
import fs from "fs";
import csv from "csv-parser";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2Client";
import dataModel from "../model/dataModel";
import { initStreamingAgg, updateStreamingAgg, finalizeStreamingAgg } from "../utils/streamAggregations";
import { generateAiPromt } from "../utils/aiPrompt";
import { generateChartData } from "../utils/chartHelpers";
import { generateChartsFromData } from "../utils/fallbackCharts";
import { runAi } from "../services/switchingApi";

interface UserPayload {
  userId: string;
  isGuest?: boolean;
}
type AuthedRequest = Request & {
  user?: UserPayload;
};

// FILE PARSING (MAIN CONTROLLER)
export const fileParsing = async (req: Request, res: Response) => {
  try {
    console.log(req.user)
    if (!req.file) return res.status(400).json({ message: "File not uploaded" });
    const file = req.file;
    const filepath = file.path;
    const streamAgg = initStreamingAgg();
    const sampleRows: any[] = [];
    let headers: string[] = [];
    const readStream = fs.createReadStream(filepath).pipe(csv());
    const handleOnHeaders = (hdr: string[]) => { (headers = hdr) }
    const handleOnData = (row: any) => {
      if (sampleRows.length < 10) sampleRows.push(row);
      updateStreamingAgg(streamAgg, row);
    }
    const handleOnEnd = async () => {
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
        user_id: userId || null,
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
        console.log(sampleRows)
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
    }
    const handleOnError = (err: Error) => {
      return res.status(500).json({ success: false, message: "CSV parse error", error: err });
    }
    readStream.on("headers", handleOnHeaders);
    readStream.on("data", handleOnData);
    readStream.on("end", handleOnEnd);
    readStream.on("error", handleOnError);

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