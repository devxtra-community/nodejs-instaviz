import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import otpModel from "../model/otpModel.ts";
import userModel from "../model/user.ts";
import { sendOtp } from "../utils/sendEmail.ts";
import { generateOtp } from "../utils/otpGenerate.ts";
import { resetPasswordSchema, theValidation } from "../services/validation.ts";


export const forgotPassword = async (req: Request, res: Response) => {
  console.log("reached here at forgot password");
  console.log(req.body);

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = generateOtp();
    console.log("otp sentt for forgott", otp);

    await otpModel.findOneAndUpdate({ email }, { otp }, { upsert: true });

    await sendOtp(email, otp);

    return res.json({
      success: true,
      message: "OTP has been sent to your email",
    });
  } catch (err) {
    console.error("Forgot Password Error", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    const { error } = resetPasswordSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map(err => err.message);
      return res.status(400).json({ success: false, message: details });
    }

    const otpData = await otpModel.findOne({ email });

    const hashed = await bcrypt.hash(newPassword, 10);

    await userModel.findOneAndUpdate({ email }, { password: hashed });

    await otpModel.deleteOne({ email });

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (err) {
    console.error("Reset Password Error", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};