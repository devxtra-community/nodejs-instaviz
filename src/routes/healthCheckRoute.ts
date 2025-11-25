import { Router } from "express";
import mongoose from "mongoose"

export const healthRouter = Router();
healthRouter.get("/", async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.json({
        status: "ok",
        db: dbStatus,
        uptime: process.uptime(),
        time: new Date().toISOString(),
    });
})
