import type { Request, Response } from "express";
import bcrypt from "bcrypt"
import otpModel from "../../model/otpModel.ts";
import Joi, { number } from "../../../node_modules/joi/lib/index";
import userModel from "../../model/user.ts";
import { sendOtp } from "../../utils/sendEmail.ts";
import { theValidation } from "../../services/validation.ts";
import { generateOtp } from "../../utils/otpGenerate.ts";


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



// dummy bro

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const user = await userModel.find();
    res.status(200).json({ message: "All users", user })
  }
  catch (err) {
    res.status(500).json(err)
  }
} 

export const register = async (req: Request, res: Response) => {

  try {
    const { name, email, password, confirmPassword } = req.body;

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

    const otp = generateOtp();
    console.log(otp);



    const createOtpDoc = await otpModel.create({ name, password, email, otp });

    await sendOtp(email, otp);


    res.status(200).json({ message: "plz verify the otp to continue", otp: true });
  } catch (err) {
    console.error("Register Error", err);
    res.status(500).json({ message: "someting went wrong", success: false });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  console.log("reached here at verify otp");
  try {
    const { email } = req.query;
    const { otp } = req.body;
    console.log(`${email},${otp}`)
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

    const hashedPassword = await bcrypt.hash(otpData.password, 10)
    console.log("after hashed pass");

    const createUser = await userModel.create({ name: otpData.name, email: otpData.email, password: hashedPassword });
    console.log("after create user");

    console.log(createUser);

    console.log("after loging create logging");

    await otpModel.deleteOne({ email });



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
  const frontendURL = "http://localhost:3000";
  res.redirect(`${frontendURL}/auth/callback?token=${token}`);
};

