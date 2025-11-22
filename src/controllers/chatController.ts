import type { Request, Response } from "express";
import Dataset from "../model/dataModel";
import { userWantsChart } from "../utils/chatDetection";
import { createChatPrompt } from "../utils/chatPrompt";
import { runChartAnalysis } from "../services/chatAiService";
import { modelLight } from "../services/aiModels";

export const chatController = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    console.log("message:",message,"req.user:",req.user)
    // // Ensure user is authenticated
    // if (!req.user || !req.user) {
    //   return res.status(401).json({
    //     reply: "Please log in before chatting with InstaviZ AI.",
    //     chart: null,
    //   });
    // }
    // console.log("req.user is console loging",req.user)
    // const userId = req.user;

    // // latest dataset for user
    // const dataset = await Dataset.findOne({ user_id: userId })
    //   .sort({ created_at: -1 });

    // if (!dataset) {
    //   return res.json({
    //     reply: "Please upload a dataset first.",
    //     chart: null,
    //   });
    // }

    // // If chart requested → Heavy model
    // if (userWantsChart(message)) {
    //   const result = await runChartAnalysis(message, dataset);
    //   return res.json(result);
    // }

    // // Otherwise → Cheap model
    // const prompt = createChatPrompt(message, dataset);
    // const chat = modelLight.startChat({ history: [] });

    // const reply = await chat.sendMessage(prompt);

    // return res.json({
    //   reply: reply.response.text(),
    //   chart: null,
    // });

  } catch (err) {
    console.error(err);
    return res.json({
      reply: "Something went wrong. Try again.",
      chart: null,
    });
  }
};
