import type { Request, Response } from "express";
import bcrypt from "bcrypt"
import otpModel from "../../model/otpModel.ts";
import Joi from "joi";
import userModel from "../../model/user.ts";
import { sendOtp } from "../../utils/sendEmail.ts";

// google authentication
import { signJwt } from "../../services/jwtServices.ts";
import type { User } from "../../model/user.ts";

export const loginCheck = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
  } catch (err) {
    console.log(err);
    return;
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    const theValidation = Joi.object({
      firstName: Joi.string().min(3).max(20).required(),
      lastName: Joi.string().min(3).max(20).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(
          new RegExp(
            "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
          )
        )
        .min(8)
        .messages({
          "string.pattern.base":
            "Password must contain letters, numbers, and symbols",
          "string.min": "Password must be at least 8 characters",
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Password and Confirm Password must match",
          "any.required": "Confirm Password is required",
        }),
    });

    const { error } = theValidation.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map((err) => err.message);
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

    const otp = Math.floor(Math.random() * 900000);

    const createOtpDoc = await otpModel.create({ email, otp });

    await sendOtp(email, otp);

    res.status(200).json({ message: "plz verify the otp to continue" });
  } catch (err) {
    console.error("Register Error", err);
    res.status(500).json({ message: "someting went wrong", success: false });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, otp } = req.body;
    const optData = await otpModel.findOne({ email });
    if (!optData) {
      return res.status(400).json({ message: "otp not found" });
    }
    if (!optData.otp == otp) {
      return res.status(400).json({ message: "Invalid otp" });
    }
    const fullName = `${firstName} ${lastName}`
    const hashedPassword = await bcrypt.hash(password, 10)
    const createUser = await userModel.insertOne({ name: fullName, email, password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: "Registration completed successfully",
    });
  } catch (err) {
    console.log("veryfyotp catch woerked", err);
    res.status(500).json({ message: "Internal server errror" });
  }
};


// google authentication

export const googleCallback = (req: Request, res: Response) => {
  const user = req.user as User;

  const token = signJwt({
    id: user.googleId,
    email: user.email
  });
  res.json({ message: "Google login successfull", token, user })
};

