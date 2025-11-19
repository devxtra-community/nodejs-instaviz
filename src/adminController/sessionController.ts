import { Request, Response } from "express";
import userSessionModel from "../model/activeModel";

export const heartbeat = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId required"
      });
    }

    const session = await userSessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    const now = new Date();

    // Update endTime
    session.endTime = now;

    // Calculate total session duration in seconds
    const durationMs = now.getTime() - session.startTime.getTime();
    const durationSeconds = Math.floor(durationMs / 1000);

    session.duration = durationSeconds;

    await session.save();

    return res.status(200).json({
      success: true,
      totalActiveSeconds: durationSeconds
    });

  } catch (err) {
    console.log("Heartbeat error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
