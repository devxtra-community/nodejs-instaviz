import type { Request, Response } from "express";
import fs from "fs";
import { GoogleGenerativeAI } from '@google/generative-ai'
import csv from "csv-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
 

export const fileupload = async (req: Request, res: Response) => {
    try {
        console.time("checking");
        if (!req.file) {
            return res.status(404).json({ message: "File Not Uploaded" });
        }
        

        const filepath = req.file.path;
        const results: any[] = [];
        let headers: string[] = [];
        const stream = fs.createReadStream(filepath, { encoding: "utf-8" }).pipe(csv());
        stream
            .on("headers", (hdrs: string[]) => {
                headers = hdrs;
            })
            .on("data", (data: any) => {
                results.push(data);
            })
            .on("end", async () => {
                console.timeEnd("checking");
                const rowsneeded = results.slice(0, 10);

                const datamodel = {
                    headers,
                    rows: rowsneeded
                };

                const json = JSON.stringify(datamodel);
                const modelsize = Buffer.byteLength(json, "utf8");
                console.log((modelsize / (1024 * 1024)).toFixed(2) + " MB");
                fs.unlink(filepath, (err) => {
                    if (err) console.log("File removing Failed", err);
                });

                const prompt = `
I will provide a JSON object called \`datamodel\` with:
- headers: an array of column names
- rows: up to 10 sample row objects (each row is a mapping header->value)

Task:
1) Produce concise data insights (3–6 bullet points) about the dataset based only on the provided headers and sample rows.
2) Suggest 3–6 meaningful visualizations to answer high-level questions. For each visualization, specify:
   - type (bar, line, pie, histogram, scatter)
   - x field (column name)
   - y field (column name or aggregation)
   - any group/aggregation needed (e.g., count, sum, avg)
   - suggested chart title and short caption
3) Provide 10 likely questions a user would ask about this dataset (short, clear questions).
4) For each of those 10 questions, provide:
   a) A short natural-language answer based on the sample rows (if not determinable from sample, say "requires full dataset" and explain why).
   b) The exact aggregation code needed to compute the answer on the full dataset. Provide both:
      - JavaScript (in-memory) code snippet that takes an array \`rows\` and returns the result (use plain JS, no libraries), and
      - Equivalent MongoDB aggregation pipeline that assumes a collection \`documents\` where each document corresponds to one CSV row (fields follow the headers).
5) Provide a short note about any data quality issues you detect from the sample (missing values, numeric columns stored as strings, inconsistent formats).
6) If the datamodel is large or has columns likely to be high-cardinality, mention that you should not send all rows to the model and recommend strategies 
(sample rows, summary stats, or storing and analyzing remotely).

Return a JSON object with this exact top-level shape (so my code can parse it):
{
  "insights": [ "..." ],
  "visualizations": [
    { "type": "...", "x":"...", "y":"...", "aggregation":"count|sum|avg|none", "title":"...", "caption":"..." }
  ],
  "questions": [
    {
      "question": "string",
      "natural_answer": "string",
      "js_aggregation": "string (self-contained JS code snippet)",
      "mongodb_pipeline": [ /* array representing pipeline stages */ ],
      "requires_full_data": true|false
    }
  ],
  "data_quality": [ "..." ],
  "notes": "..."
}

Now I provide \`datamodel\`: ${JSON.stringify(datamodel)}

Only use the datamodel contents to create answers. If sample rows are too small to determine a statistic,
 explicitly say so.
`;
                try {
                    console.time("ai response")
                    const result = await model.generateContent(prompt);
                    const responsetext = await result.response.text()
                    console.timeEnd("ai response")
                    console.log(responsetext)
                }
                catch (err) {
                    console.log(err)
                }
            })
            .on("error", (err: any) => {
                console.log("error while parsing csv:", err);
                return res.status(500).json({ message: "error parsing csv", success: false, error: String(err) });
            });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "internal server error", success: false, error: String(err) });
    }
};
