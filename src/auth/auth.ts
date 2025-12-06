import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import otpModel from "../model/otpModel.ts";
import userModel from "../model/user.ts";
import { sendOtp } from "../utils/sendEmail.ts";
import { resetPasswordSchema } from '../services/validation.ts';
import mongoose from 'mongoose';
import userSession from '../model/activeModel.ts.ts';
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

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Validate with Joi schema
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

    // Check if account is deleted
    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "This account has been deleted.",
      });
    }

    // Check if password exists (for non-Google users)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account was created using Google. Please login with Google.",
      });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }



    // STATUS CHECK - Check if user is disabled by admin
    if (user.status === "disabled") {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated by admin. Please contact support.",
      });
    }

  
  // suspension check
// suspension check (your existing code is correct, just improved message)
if (user.isSuspended) {
  const now = new Date();

  // If suspension expired → auto unsuspend
  if (user.suspensionEnd && user.suspensionEnd <= now) {
    user.isSuspended = false;
    user.suspensionEnd = null;
    await user.save();
  } else {
    // Format the date properly for better UX
    const suspensionEndFormatted = user.suspensionEnd
      ? new Date(user.suspensionEnd).toLocaleString()
      : "an indefinite period";
    
    return res.status(403).json({
      success: false,
      message: `Your account is suspended until ${suspensionEndFormatted}. Please contact support.`
    });
  }
}    // All checks passed - Create tokens

    const accessToken = signJwt({ id: user._id, email: user.email });
    const refreshToken = Jwt.sign(
      { id: user._id, email: user.email },
      process.env.REFRESH_SECRET!,


      { expiresIn: "30d" },

     

    );

    // Store refresh token hash
    const hashed = hashToken(refreshToken);
    const userAgent = req.headers["user-agent"] || "unknown";
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.ip ||
      "unknown";

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

    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,

      message: "Login successful",
      accessToken,
      sessionId: session._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        status: user.status,
        token: user.token,
      },
    });
  } catch (err) {

    console.error("Login error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }


    const user = await userModel.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined },
        { googleId: userId },
      ].filter(Boolean),
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", err });
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
//comment