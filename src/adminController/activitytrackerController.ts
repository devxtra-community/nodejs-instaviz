import { Request, Response } from "express";
import UserSession from "../model/activeModel.ts.ts";
import UserModel from "../model/user.ts";

interface JwtUser {
  id: string;
  email: string;
}

export const startSession = async (req: Request, res: Response) => {
  try {
    const user = req.user as JwtUser | undefined;
    if (!user?.id) {
      return res.status(400).json({ success: false, message: "User ID missing" });
    }

    const userId = user.id;

    const fullUser = await UserModel.findById(userId).select("name email");
    if (!fullUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

 
    const existing = await UserSession.findOne({ userId, ended: false });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Active session already exists",
        session: existing,
      });
    }

    const now = new Date();
    const day = now.toISOString().substring(0, 10); // YYYY-MM-DD

    const session = await UserSession.create({
      userId,
      userName: fullUser.name,
      userEmail: fullUser.email,

      startTime: now,
      lastHeartbeat: now,
      ended: false,

      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      screenWidth: req.body.screenWidth,
      screenHeight: req.body.screenHeight,

      day,
    });

    return res.status(201).json({
      success: true,
      message: "New session started",
      session,
    });

  } catch (err) {
    console.error("startSession ERR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const heartbeat = async (req: Request, res: Response) => {
  try {
    const user = req.user as JwtUser | undefined;
    if (!user?.id) {
      return res.status(400).json({ success: false, message: "User ID missing" });
    }

    const session = await UserSession.findOne({
      userId: user.id,
      ended: false,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "No active session found" });
    }

    const now = new Date();
    const last = session.lastHeartbeat;

 
    let delta = Math.floor((now.getTime() - last.getTime()) / 1000);

    if (delta < 1) delta = 1;
    if (delta > 300) delta = 300; 

    session.duration += delta;
    session.lastHeartbeat = now;

    await session.save();

    return res.status(200).json({
      success: true,
      addedSeconds: delta,
      totalDuration: session.duration,
    });

  } catch (err) {
    console.error("heartbeat ERR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const endSession = async (req: Request, res: Response) => {
  try {
    const user = req.user as JwtUser | undefined;
    if (!user?.id) {
      return res.status(400).json({ success: false, message: "User ID missing" });
    }

    const session = await UserSession.findOne({
      userId: user.id,
      ended: false,
    });

    if (!session) {
      return res.json({ success: true, message: "No active session" });
    }

    const now = new Date();
    const last = session.lastHeartbeat;

    let delta = Math.floor((now.getTime() - last.getTime()) / 1000);

    if (delta < 1) delta = 1;
    if (delta > 300) delta = 300;


    session.duration += delta;
    session.lastHeartbeat = now;
    session.endTime = now;
    session.ended = true;

    await session.save();

    return res.json({
      success: true,
      message: "Session ended",
      totalDuration: session.duration,
    });

  } catch (err) {
    console.error("endSession ERR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};