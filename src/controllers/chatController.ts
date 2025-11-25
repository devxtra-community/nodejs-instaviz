import type { Request, Response } from "express";
import Dataset from "../model/dataModel";
import { userWantsChart } from "../utils/chatDetection";
import { createChatPrompt } from "../utils/chatPrompt";
import { runChartAnalysis } from "../services/chatAiService";
import { modelLight } from "../services/aiModels";
import chatModel from "../model/chat";
import mongoose from "mongoose";

export const chatController = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    // Ensure user is authenticated
    if (!req.cookies.userId) {
      return res.status(401).json({
        reply: "Please log in or continue as guest.",
        chart: null,
      });
    }

    console.log("req.cookies.userId  also in userId:", req.cookies.userId)
    const userId = req.cookies.userId;
    // latest dataset for user
    const dataset = await Dataset.findOne({ user_id: userId })
      .sort({ created_at: -1 });

    if (!dataset) {
      return res.json({
        reply: "Please upload a dataset first.",
        chart: null,
      });
    }

    // If chart requested use Heavy model
    if (userWantsChart(message)) {
      const result = await runChartAnalysis(message, dataset);
      return res.json({ message: "chart generated based on chat", result, success: true });
    }

    // Otherwise use Cheap model
    const prompt = createChatPrompt(message, dataset);
    const chat = modelLight.startChat({ history: [] });

    const reply = await chat.sendMessage(prompt);
    // console.log("reply for chat", reply.response.text())
    console.log("userid :", userId)
    const uploadChat = async () => {
      try {
        const user_id = new mongoose.Types.ObjectId(userId)
        await chatModel.updateOne(
          { user_id: user_id },
          { $push: { chat: { fromAi: reply.response.text(), fromUser: message } } }
        );

      }
      catch (err) {
        console.log("error while uploading the chat to mongodb:", err)
      }
    }
    uploadChat()
    return res.json({
      reply: reply.response.text(),
      chart: null,
    });

  } catch (err) {
    console.error("error occured in chat response with ai:", err);
    return res.json({
      reply: "Something went wrong. Try again.",
      chart: null,
    });
  }
};
