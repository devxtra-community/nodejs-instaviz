// controllers/chatController.ts
import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadDatasetFromDB } from "../utils/loadDatasetFromDB";
import { buildChatPrompt } from "../utils/chartPrompt";
import {interpretChartRequest,fallbackChartGenerator} from "../utils/chartInterpreter";
import { runAi, switchApi } from "../services/switchingApi";

// MAIN CHAT CONTROLLER
export const chatController = async (req: Request, res: Response) => {
  try {
    const userMessage = req.body.message?.trim();

    if (!userMessage) {
      return res.status(400).json({
        reply: "Please type something.",
        chart: null,
      });
    }

    // Load saved CSV dataset
    const dataset = await loadDatasetFromDB();
    if (!dataset || !dataset.aggregations) {
      return res.json({
        reply: "Please upload a dataset first.",
        chart: null,
      });
    }

    const { sampleRows, aggregations } = dataset;

    // Build prompt
    const prompt = buildChatPrompt(aggregations, sampleRows, userMessage);

    // Run Gemini with safe wrapper
    const parsed = await runAi(prompt);
    if (!parsed) {
      return res.json({
        reply: "AI failed to understand. Try rephrasing!",
        chart: null,
      });
    }
    // NORMAL QUESTION
    if (parsed.type === "qa") {
      return res.json({
        reply: parsed.question_answer || "Here’s what I found.",
        chart: null,
      });
    }

    // USER REQUESTED A CHART
    const chartIntent = interpretChartRequest(parsed.chart, aggregations);

    if (!chartIntent.valid) {
      return res.json({
        reply: " I cannot generate a chart from those fields.",
        chart: null,
      });
    }

    // Always produces a valid chart
    const finalChart = fallbackChartGenerator(chartIntent, aggregations);

    return res.json({
      reply: "Chart added to dashboard!",
      chart: finalChart,
    });

  } catch (err: any) {
    console.error(" chatController fatal error:", err?.message);

    switchApi();

    return res.json({
      reply: " Something went wrong. Please try again.",
      chart: null,
    });
  }
};
