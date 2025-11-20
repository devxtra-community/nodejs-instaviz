import { Request, Response } from "express";
import UserSession from "../model/activeModel";

interface JwtUser {
  id: string;
  email: string;
}

export const startSession = async (req: Request, res: Response) => {
  try {
    console.log("startSession called");

    const user = req.user as JwtUser | undefined;

    if (!user?.id) {
      return res.status(400).json({
        success: false,
        message: "User ID missing",
      });
    }

    const userId = user.id;

    // Check existing active session
    const existing = await UserSession.findOne({ userId, ended: false });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Active session already exists",
        session: existing,
      });
    }

    const now = new Date();

    const session = await UserSession.create({
      userId,
      startTime: now,
      lastHeartbeat: now,
      ended: false,

      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      screenWidth: req.body.screenWidth,
      screenHeight: req.body.screenHeight,
    });

    return res.status(201).json({
      success: true,
      message: "New session started",
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
    console.log("api entering in heartbeat")
    const user = req.user as JwtUser | undefined;

    if (!user?.id) {
      return res.status(400).json({
        success: false,
        message: "User ID missing",
      });
    }

    const userId = user.id;

    const session = await UserSession.findOne({
      userId,
      ended: false,
    }).sort({ startTime: -1 });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No active session found",
      });
    }

    const now = new Date();
    const last = session.lastHeartbeat;

    let delta = Math.floor((now.getTime() - last.getTime()) / 1000);
    delta = Math.max(1, Math.min(delta, 60)); // Prevent huge jumps

    session.duration += delta;
    session.lastHeartbeat = now;

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Heartbeat updated",
      addedSeconds: delta,
      totalDuration: session.duration,
      sessionId: session._id,
    });

  } catch (err) {
    console.error("heartbeat ERR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const endSession = async (req: Request, res: Response) => {
  try {
    const user = req.user as JwtUser | undefined;

    if (!user?.id) {
      return res.status(400).json({
        success: false,
        message: "User ID missing",
      });
    }

    const userId = user.id;

    const session = await UserSession.findOne({
      userId,
      ended: false,
    });

    if (!session) {
      return res.json({
        success: true,
        message: "No active session",
      });
    }

    session.ended = true;
    session.endTime = new Date();

    await session.save();

    return res.json({
      success: true,
      message: "Session ended",
      session,
    });

  } catch (err) {
    console.error("endSession ERR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



 