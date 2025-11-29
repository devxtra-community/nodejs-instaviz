import { Request, Response } from "express";
import refreshModel from '../model/refreshtoken'

export const logoutDevice = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    interface JwtUser {
      id: string;
      email: string;
    }
    const user = req.user as JwtUser;
    const userId = user.id;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID required" });
    }

    const session = await refreshModel.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    await refreshModel.deleteOne({ _id: sessionId });
    // DELETE refreshToken cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    res.clearCookie("userId", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res.json({
      success: true,
      message: "Device logged out successfully",
    });
  } catch (err) {
    console.error("Logout Device Error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logoutAllDevices = async (req: Request, res: Response) => {
  console.log("reached here at logout all devices");
  try {
    interface JwtUser {
      id: string;
      email: string;
    }

    const user = req.user as JwtUser;
    const userId = user.id;

    const { currentSessionId } = req.body;
    if (!currentSessionId) {
      return res.status(400).json({ success: false, message: "Current session ID required" });
    }

    await refreshModel.deleteMany({
      userId,
      _id: { $ne: currentSessionId },
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    res.clearCookie("userId", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res.json({
      success: true,
      message: "Logged out from all other devices",
    });
  } catch (err) {
    console.error("Logout All Devices Error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
