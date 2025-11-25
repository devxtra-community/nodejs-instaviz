import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import otpModel from "../model/otpModel.ts";
import userModel from "../model/user.ts";
import { sendOtp } from "../utils/sendEmail.ts";
import { generateOtp } from "../utils/otpGenerate.ts";
import Jwt from "jsonwebtoken";
import { loginSchema } from "../services/validation.ts";
import { signJwt } from "../services/jwtServices.ts";
import refreshModel from "../model/refreshtoken";
import { hashToken } from "../utils/hashTokens.ts";
import { theValidation } from "../services/validation.ts";

export const loginCheck = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message),
      });
    }

    // Fetch user
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was created using Google. Please login with Google.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const accessToken = signJwt({ id: user._id, email: user.email });
    const refreshToken = Jwt.sign(
      { id: user._id, email: user.email },
      process.env.REFRESH_SECRET!,

      { expiresIn: "30d" },
    );

    // Store refresh token hash
    const hashed = hashToken(refreshToken);
    const userAgent = req.headers["user-agent"] || "unknown";
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || "unknown";

    const session = await refreshModel.create({
      userId: user._id,
      tokenhash: hashed,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent,
      ip,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      isValid: true,
    });

    // Set refresh token cookie

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // ❗ IMPORTANT: Removed session creation here
    // Heartbeat /session/start will handle session documents

    // Send response
    return res.status(200).json({
      success: true,

      message: "Login successful",

      accessToken,
      sessionId: session._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    console.log("Here", req.body);

    const { error } = theValidation.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: details,
      });
    }
    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return res.status(400).json({ message: "user already exists" });
    }

    const otp = generateOtp();
    await otpModel.create({ name, password, email, otp });

    await sendOtp(email, otp);

    res.status(200).json({ message: "plz verify the otp to continue", otp: true });
  } catch (err) {
    console.error("Register Error", err);
    res.status(500).json({ message: "someting went wrong", success: false });
  }
};

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    interface JwtUser {
      id: string;
      email: string;
    }
    const user = req.user as JwtUser;
    const userId = user.id;

    const sessions = await refreshModel.find({ userId, isValid: true }).select("-tokenhash");

    return res.status(200).json({
      success: true,
      sessions,
    });
  } catch (err) {
    console.error("Get sessions error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

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
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.clearCookie("userId", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
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
