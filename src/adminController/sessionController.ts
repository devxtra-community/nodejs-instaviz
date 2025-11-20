import { Request, Response } from "express";
import UserSession from "../model/activeModel";


export const startSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId missing",
      });
    }

    const now = new Date();

    const session = await UserSession.create({
      userId,
      startTime: now,
      lastHeartbeat: now,
      endTime: null,
      duration: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Session started",
      sessionId: session._id,
      session,
    });

  } catch (err) {
    console.error("startSession ERR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




export const heartbeat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId missing",
      });
    }

    const session = await UserSession.findOne({ userId }).sort({ startTime: -1 });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No active session found",
      });
    }

    const now = new Date();
    const last = session.lastHeartbeat;

    const delta = Math.max(
      0,
      Math.floor((now.getTime() - last.getTime()) / 1000)
    );

    // Update session fields
    session.lastHeartbeat = now;
    session.endTime = now;
    session.duration += delta;

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Heartbeat saved",
      deltaSeconds: delta,
      totalDurationSeconds: session.duration,
      sessionId: session._id,
    });

  } catch (err) {
    console.error("Heartbeat ERR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



 