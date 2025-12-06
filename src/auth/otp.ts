import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import otpModel from "../model/otpModel";
import userModel from "../model/user";
import { sendOtp } from "../utils/sendEmail";
import { generateOtp } from "../utils/otpGenerate";
import Jwt from "jsonwebtoken";
import { signJwt } from "../services/jwtServices";
import guestModel from "../model/guest";


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
    console.log("checking user cookie :", req.cookies);
    if (req.cookies.userId && req.cookies.isGuest == 'true') {
      const guestUser = await guestModel.findById(req.cookies.userId);
      const existingUserToken = guestUser?.token;
      await guestModel.findByIdAndDelete(req.cookies.userId)
      const createUser = await userModel.create({
        _id: req.cookies.userId,
        token: existingUserToken,
        name: otpData.name,
        email: otpData.email,
        password: hashedPassword,
      });
      await otpModel.deleteOne({ email });
      res.clearCookie("isGuest", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({
        success: true,
        message: "Registration completed successfully"
      });
    }
    console.log("there is no guest:userId  on cookie", req.cookies);
    const createUser = await userModel.create({
      name: otpData.name,
      email: otpData.email,
      password: hashedPassword,
    });
    console.log("after create user");
    res.cookie("userId", createUser._id, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    // res.cookie("isGuest", false, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "strict",
    //   maxAge: 30 * 24 * 60 * 60 * 1000,
    // });
    await otpModel.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "Registration completed successfully"
    });
  } catch (err) {
    console.log("veryfyotp catch worked", err);
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