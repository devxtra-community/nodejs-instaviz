// controllers/sessionController.ts
import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { SessionModel } from "../model/session";
import { createChatPrompt } from "../utils/chatPrompt";
import { modelLight } from "../services/aiModels";
import { userWantsChart } from "../utils/chatDetection";
import { runChartAnalysis } from "../services/chatAiService";

import dataModel from "../model/dataModel";

function getUserId(req: Request): string | null {
    return (req as any).user?.userId ?? null;
}

export const createSession = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);

        let session_token: string | null = null;
        if (!userId) {
            session_token = (req.headers["x-session-token"] as string) || crypto.randomUUID();
        }

        const payload: any = {
            user_id: userId ? new mongoose.Types.ObjectId(userId) : null,
            session_token: userId ? null : session_token,
            data_id: req.body.data_id ? new mongoose.Types.ObjectId(req.body.data_id) : null,
            title: req.body.title || "New Session",
            messages: req.body.messages || [],
            charts: req.body.charts || [],
            metrics: req.body.metrics || {},
        };

        const session = await SessionModel.create(payload);

        // Return consistent envelope the frontend expects
        return res.status(201).json({
            session,
            // only send session_token when we generated/used one (guest)
            ...(session_token ? { session_token } : {}),
        });
    } catch (err) {
        console.error("createSession error", err);
        return res.status(500).json({ error: "Server error" });
    }
};


export const getSession = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id;
        console.log(id, userId)

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ error: "Invalid session id" });

        const session = await SessionModel.findOne({
            _id: id,
            user_id: userId,
        })
            .populate("data_id")
            .lean();
        // console.log(session);

        if (!session) return res.status(404).json({ error: "Not found" });

        return res.json(session);
    } catch (err) {
        console.error("getSession error", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const listSessions = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);

        const sessions = await SessionModel.find({ user_id: userId })
            .sort({ updatedAt: -1 })
            .select("title createdAt updatedAt data_id")
            .populate("data_id")
            .lean();

        return res.json({ sessions });
    } catch (err) {
        console.error("listSessions error", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const appendMessage = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id;
        const userMessage = req.body.user;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ error: "Invalid session id" });

        const session = await SessionModel.findOne({ _id: id, user_id: userId }).populate("data_id");
        if (!session) return res.status(404).json({ error: "Session not found" });

        const dataset = session.data_id;
        if (!dataset) {
            return res.json({
                reply: "Please upload a dataset first.",
                chart: null,
            });
        }

        let aiReply = "";
        let generatedChart = null;

        if (userWantsChart(userMessage)) {
            generatedChart = await runChartAnalysis(userMessage, dataset);

            aiReply = generatedChart
                ? "Here is the chart you requested."
                : "I could not generate a chart for that query.";
        } else {
            const prompt = createChatPrompt(userMessage, dataset);
            const chat = modelLight.startChat({ history: [] });
            const reply = await chat.sendMessage(prompt);
            aiReply = reply.response.text();
        }

        console.log("chart",generatedChart);

        session.messages.push({
            user: userMessage,
            ai: aiReply,
            createdAt: new Date(),
        });

        if (generatedChart) {
            console.log("inside generated chart")
            session.charts.push(generatedChart.chart);
        }

        session.updatedAt = new Date();
        await session.save();

        return res.json({
            reply: aiReply,
            chart: generatedChart,
        });

    } catch (err) {
        console.error("appendMessage error", err);
        return res.status(500).json({ error: "Server error" });
    }
};



export const appendChart = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: No userId found" });
        }

        const id = req.params.id;

        if (!req.body.chart)
            return res.status(400).json({ error: "Missing chart data" });

        let session = await SessionModel.findById(id);

        if (!session)
            return res.status(404).json({ error: "Session not found" });

        if (!session.user_id) {
            session.user_id = userId;
        }

        if (session.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Now push chart
        session.charts.push(req.body.chart);
        session.updatedAt = new Date();
        await session.save();

        return res.json(session);

    } catch (err) {
        console.error("appendChart error", err);
        return res.status(500).json({ error: "Server error" });
    }
};



export const updateSession = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id;

        const session = await SessionModel.findOneAndUpdate(
            { _id: id, user_id: userId },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );

        return res.json(session);
    } catch (err) {
        console.error("updateSession error", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const deleteSession = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id;

        await SessionModel.findOneAndDelete({ _id: id, user_id: userId });

        return res.json({ ok: true });
    } catch (err) {
        console.error("deleteSession error", err);
        return res.status(500).json({ error: "Server error" });
    }
};
