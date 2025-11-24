import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import otpModel from "../model/otpModel.ts";
import userModel from "../model/user.ts";
import { sendOtp } from "../utils/sendEmail.ts";
import { generateOtp } from "../utils/otpGenerate.ts";
import Jwt from "jsonwebtoken";
import { signJwt } from "../services/jwtServices.ts";


export const verifyOtp = async (req: Request, res: Response) => {
  console.log("reached here at verify otp");
  try {
    const { email } = req.query;
    const { otp } = req.body;
    console.log(`${email},${otp}`);
    const otpData = await otpModel.findOne({ email });
    console.log("before logging otp data");

    console.log(otpData);

    console.log("after loging otp data");

    if (!otpData) {
      console.log("no otp data");

      return res.status(400).json({ message: "otp not found" });
    }
    if (otpData.otp.toString() !== otp.toString()) {
      console.log("otp mismatch");

      return res.status(400).json({ message: "Invalid otp" });
    }

    const hashedPassword = await bcrypt.hash(otpData.password, 10);
    console.log("after hashed pass");

    const createUser = await userModel.create({
      name: otpData.name,
      email: otpData.email,
      password: hashedPassword,
    });
    console.log("after create user");

    console.log(createUser);

    console.log("after loging create logging");
    const accessToken = signJwt({ id: otpData._id, email: otpData.email });
    const refreshToken = Jwt.sign(
      { id: otpData._id, email: otpData.email },
      process.env.REFRESH_SECRET!,
      { expiresIn: "30d" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    await otpModel.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "Registration completed successfully",
      accessToken: accessToken,
    });
  } catch (err) {
    console.log("veryfyotp catch woerked", err);
    res.status(500).json({ message: "Internal server errror", error: err });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const email = req.query.email?.toString();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otpData = await otpModel.findOne({ email });

    if (!otpData) {
      return res.status(400).json({ message: "No OTP found for this email" });
    }

    const otp = generateOtp();

    await sendOtp(email, otp);

    await otpModel.findOneAndUpdate(
      { email },
      {
        otp,
        createdAt: new Date(),
      },
    );

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyForgotOtp = async (req: Request, res: Response) => {
  console.log("reached here at verify otp");
  console.log(req.body);

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email & OTP required" });
    }

    const savedOtp = await otpModel.findOne({ email });

    if (!savedOtp) {
      return res.status(400).json({ success: false, message: "OTP not found" });
    }

    if (savedOtp.otp.toString() !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("OTP Verify Error", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};