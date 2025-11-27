import type { Request, Response } from "express";
import fs from "fs";
import { CustomError } from "../utils/CustomError";
import { parseCsvFile } from "../services/csvService";
import { uploadCsvToR2 } from "../services/r2Service";
import { createDatasetWithRows } from "../services/datasetService";
import { analyzeDatasetWithAiOrFallback } from "../services/aiAnalysisService";
import dataModel from "../model/dataModel";
import mongoose from "mongoose";
import { SessionModel } from "../model/session";


interface UserPayload {
  userId: mongoose.Types.ObjectId;
  isGuest?: boolean;
}
type AuthedRequest = Request & {
  user?: UserPayload;
};

export const fileParsing = async (req: Request, res: Response) => {
  let filepath: string | undefined;

  try {
    console.time("file-processing");

    if (!req.file) {
      return res.status(400).json({ message: "File Not Uploaded", success: false });
    }

    const file = req.file as Express.Multer.File;
    filepath = file.path;

    const { results, headers, totalRows } = await parseCsvFile(filepath);
    console.log(`CSV parsed: ${totalRows} rows, ${headers.length} columns`);
    console.timeEnd("file-processing");

    const fileUrl = await uploadCsvToR2(filepath, file.originalname);

    // Remove temp file
    fs.unlinkSync(filepath);
    filepath = undefined;

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
    const authedReq = req as AuthedRequest;
    const userId = authedReq.user?.userId;
    const dataset = await createDatasetWithRows(
      results,
      userId as mongoose.Types.ObjectId,
      fileUrl,
      file.originalname,
      totalColumns
    );

    const aiResponse = await analyzeDatasetWithAiOrFallback(computedMetrics, dataset, results);

    if (!aiResponse.metrics || !aiResponse.charts || !Array.isArray(aiResponse.charts)) {
      console.error(" Invalid AI response structure:", aiResponse);
      throw new Error("AI response missing required fields");
    }

    console.log(" Final response summary:", {
      totalRows: aiResponse.metrics.total_rows,
      charts: aiResponse.charts.length,
      barChartData: aiResponse.charts[0]?.data?.length || 0,
      pieChartData: aiResponse.charts[1]?.data?.length || 0,
    });
    //uploding datas to database
    const session = await SessionModel.create({
      user_id: userId ?? null,
      session_token: userId ? null : (req.headers["x-session-token"] as string) || null,
      data_id: dataset._id,
      title: req.body.title || file.originalname || "Uploaded dataset",
      messages: [],
      charts: aiResponse.charts || [],
      metrics: aiResponse.metrics || {},
    });

    const uploadSummary = async () => await dataModel.findByIdAndUpdate(dataset._id, { summary: aiResponse.summary })
    uploadSummary();

    //returning response
    return res.status(200).json({
      success: true,
      message: "Dataset processed successfully",
      datasetId: dataset._id,
      sessionId: session._id,
      r2Url: fileUrl,
      data: {
        metrics: {
          total_rows: aiResponse.metrics.total_rows,
          total_columns: aiResponse.metrics.total_columns,
          missing_values: aiResponse.metrics.missing_values,
          charts_generated: aiResponse.charts.length,
        },
        charts: aiResponse.charts,
        summary: aiResponse.summary || [],
        key_fields: aiResponse.key_fields || [],
      },
    });
  } catch (err) {
    console.error(" File parsing error:", err);

    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    const error = new CustomError({
      errorData: err instanceof Error ? err.message : String(err),
      statusCode: 500,
    });

    return res.status(error.statusCode).json({
      success: false,
      message: "Dataset processing failed",
      error: error.errorData,
    });
  }
};
