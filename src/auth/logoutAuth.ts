// src/auth/logoutAuth.ts
import { Request, Response } from "express";
import refreshModel from "../model/refreshtoken";

interface AuthedUser {
  userId: string;
  isGuest?: boolean;
}

type AuthedRequest = Request & {
  user?: AuthedUser;
};

export const logoutDevice = async (req: AuthedRequest, res: Response) => {
  console.log("reached logoutDevice");
  console.log(req.body);

  try {
    const { sessionId, currentSessionId } = req.body as {
      sessionId?: string;
      currentSessionId?: string;
    };

    const user = req.user;

    if (!user || !user.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: no user in request" });
    }

    const userId = user.userId;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Session ID required" });
    }

    const session = await refreshModel.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    await refreshModel.deleteOne({ _id: sessionId });

    console.log(
      "logging sessionId before logout :",
      currentSessionId,
      " : ",
      sessionId,
    );

    // If user is logging out the *current* device, clear cookies
    if (currentSessionId && sessionId === currentSessionId) {
      console.log("Clearing cookies because user logged out THIS device");

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      });

      res.clearCookie("userId", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      });
    }

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

export const logoutAllDevices = async (req: AuthedRequest, res: Response) => {
  console.log("reached here at logout all devices");

  try {
    const user = req.user;

    if (!user || !user.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: no user in request" });
    }

    const userId = user.userId;
    const { currentSessionId } = req.body as { currentSessionId?: string };

    if (!currentSessionId) {
      return res.status(400).json({
        success: false,
        message: "Current session ID required",
      });
    }

    await refreshModel.deleteMany({
      userId,
      _id: { $ne: currentSessionId }, // keep current session, remove others
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
