import type { Request, Response } from "express";
import fs from "fs";
import csv from "csv-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Dataset from "../model/dataModel";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const fileupload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded", success: false });
    }

    const file = req.file as Express.Multer.File;
    const filepath = file.path;
    const results: any[] = [];
    let headers: string[] = [];
    let totalRows = 0;
    let responded = false;

    //  Stream CSV file efficiently

    console.time("parsing")
    const stream = fs.createReadStream(filepath, { encoding: "utf-8" }).pipe(csv());

    stream
      .on("headers", (hdrs: string[]) => (headers = hdrs))
      .on("data", (data: any) => {
        totalRows++;
        if (results.length < 10) results.push(data);
      })
      .on("end", async () => {
        if (responded) return;
        responded = true;
        console.timeEnd("parsing")
        //  Delete temp file
        fs.unlink(filepath, () => {});

        //  Compute accurate metrics locally
        const totalColumns = headers.length;
        let missingValues = 0;
        for (const row of results) {
          for (const val of Object.values(row)) {
            if (val === "" || val === null || val === undefined) {
              missingValues++;
            }
          }
        }
        

        const computedMetrics = {
          total_rows: totalRows,
          total_columns: totalColumns,
          missing_values: missingValues,
        };

        //  Save dataset metadata for later chat/analysis
        const dataset = await Dataset.create({
          name: file.originalname,
          headers,
          rows: results,
          metrics: computedMetrics,
        });

        //  Optimized AI Prompt — with enforced chart diversity
        const prompt = `
You are an expert AI data analyst for a web app called InstaviZ.

You are given a dataset summary in JSON:
{
  "headers": [...],
  "rows": [sample of 10 rows],
  "metrics": ${JSON.stringify(computedMetrics)}
}

Your task:
1 Return ONLY a valid JSON object (no markdown or text).
2 Use the provided metrics directly — do not recompute them.
3 Generate **exactly 2 charts**:
   - One "bar" chart for numeric comparison (choose the most meaningful numeric field).
   - One "pie" chart for category distribution (choose a categorical field).
4 Return strictly in this format:
{
  "metrics": {
    "total_rows": number,
    "total_columns": number,
    "missing_values": number,
    "charts_generated": 2
  },
  "charts": [
    { "type": "bar", "x": "column", "y": "column or count", "title": "string" },
    { "type": "pie", "x": "column", "y": "count", "title": "string" }
  ],
  "summary": ["short bullet insight 1", "insight 2", "insight 3"]
}

Dataset sample:
${JSON.stringify({ headers, rows: results })}
`;

        try {
          console.time("AI Response");
          const result = await Promise.race([
            model.generateContent(prompt),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("AI timeout (30s)")), 30000)
            ),
          ]);
          console.timeEnd("AI Response");

          let responsetext = (result as any).response.text().trim();
          responsetext = responsetext.replace(/```json|```/g, "").trim();

          const jsonStart = responsetext.indexOf("{");
          const jsonEnd = responsetext.lastIndexOf("}");
          if (jsonStart !== -1 && jsonEnd !== -1)
            responsetext = responsetext.slice(jsonStart, jsonEnd + 1);

          let parsed;
          try {
            parsed = JSON.parse(responsetext);
          } catch (err) {
            console.error("AI returned invalid JSON:", responsetext);
            return res.status(500).json({
              message: "Invalid AI response",
              success: false,
            });
          }

          //  Add guaranteed metrics count (for safety)
          parsed.metrics = {
            ...computedMetrics,
            charts_generated: 2,
          };

          res.status(200).json({
            success: true,
            message: "File processed successfully",
            datasetId: dataset._id,
            data: parsed,
          });
        } catch (err) {
          console.error("Gemini error:", err);
          res.status(500).json({ message: "AI processing failed", success: false });
        }
      })
      .on("error", (err) => {
        if (responded) return;
        responded = true;
        console.error("CSV parse error:", err);
        res.status(500).json({ message: "Error parsing CSV", success: false, error: err });
      });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ message: "Internal server error", success: false, error: err });
  }
};
