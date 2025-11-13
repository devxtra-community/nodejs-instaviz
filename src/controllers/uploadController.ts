import type { Request, Response } from "express";
import fs from "fs";
import csv from "csv-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2Client";
import dataModel from "../model/dataModel";

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

        console.time("Parsing CSV");
        const stream = fs.createReadStream(filepath, { encoding: "utf-8" }).pipe(csv());

        const handleHeaders = (hdrs: string[]) => (headers = hdrs);

        const handleData = (data: any) => {
            totalRows++;
            if (results.length < 10) results.push(data);
        };

        const handleEnd = async () => {
            if (responded) return;
            responded = true;
            console.timeEnd("Parsing CSV");

            // Upload to Cloudflare R2
            const fileBuffer = fs.readFileSync(filepath);
            const fileName = `${Date.now()}_${file.originalname}`;

            try {
                await r2.send(
                    new PutObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME!,
                        Key: fileName,
                        Body: fileBuffer,
                        ContentType: "text/csv",
                    })
                );
            } catch (err) {
                console.error("R2 upload error:", err);
                return res.status(500).json({ message: "R2 upload failed", success: false });
            }

            fs.unlink(filepath, () => { });

            // Public file URL
            const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

            // Compute metrics
            const totalColumns = headers.length;
            let missingValues = 0;
            for (const row of results) {
                for (const val of Object.values(row)) {
                    if (val === "" || val === null || val === undefined) missingValues++;
                }
            }

            const computedMetrics = {
                total_rows: totalRows,
                total_columns: totalColumns,
                missing_values: missingValues,
            };

            // Save sample data in MongoDB
            const dataset = await dataModel.create({
                data: results,
                user_id: req.body.user_id || null,
                chat_id: null,
                chart_id: null,
                r2_url: fileUrl
            });

            // AI insight
            const prompt = `You are an expert AI data analyst for a web app called InstaviZ.

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

            let parsed: any;
            try {
                const result = await model.generateContent(prompt);
                let responseText = result.response.text().trim().replace(/```json|```/g, "");
                parsed = JSON.parse(responseText);
            } catch (err) {
                console.error("Gemini error:", err);
                parsed = {
                    metrics: computedMetrics,
                    charts: [],
                    summary: ["AI summary unavailable due to timeout"],
                };
            }

            res.status(200).json({
                success: true,
                message: "Dataset processed successfully",
                datasetId: dataset._id,
                r2Url: fileUrl,
                data: parsed,
            });
        };

        const handleError = (err: any) => {
            if (responded) return;
            responded = true;
            console.error("CSV parse error:", err);
            res.status(500).json({ message: "Error parsing CSV", success: false, error: err });
        };

        stream
            .on("headers", handleHeaders)
            .on("data", handleData)
            .on("end", handleEnd)
            .on("error", handleError);

    } catch (err) {
        console.error("File upload error:", err);
        res.status(500).json({ message: "Internal server error", success: false, error: err });
    }
};
