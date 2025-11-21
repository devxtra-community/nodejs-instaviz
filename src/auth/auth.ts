import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import otpModel from '../model/otpModel.ts';
import userModel from '../model/user.ts';
import { sendOtp } from '../utils/sendEmail.ts';
import { theValidation } from '../services/validation.ts';
import { generateOtp } from '../utils/otpGenerate.ts';
import Jwt from 'jsonwebtoken';
import { loginSchema } from '../services/validation.ts';
import { signJwt } from '../services/jwtServices.ts';
import mongoose from 'mongoose';
import refreshModel from '../model/refreshtoken';
import { hashToken } from '../utils/hashTokens.ts';




export const loginCheck = async (req: Request, res: Response) => {
  console.log(' reached here login');
  console.log(req.body);

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map(err => err.message);
      return res.status(400).json({ success: false, message: details });
    }

    const user = await userModel.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.',
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was created using Google. Please login with Google.',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password!);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const accessToken = signJwt({ id: user._id, email: user.email });

    const refreshToken = Jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.REFRESH_SECRET!,
      { expiresIn: '30d' },
    );

    const hashed = hashToken(refreshToken);

    await refreshModel.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        tokenhash: hashed,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { upsert: true },
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log('catch in login worked');

    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};



// dummy 

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const user = await userModel.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined },
        { googleId: userId },
      ].filter(Boolean),
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      message: 'User fetched successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', err });
  }
};





export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    const { error } = theValidation.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: details,
      });
    }
    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return res.status(400).json({ message: 'user already exists' });
    }

    const otp = generateOtp();
    console.log(otp);

    await otpModel.create({ name, password, email, otp });

    await sendOtp(email, otp);

    res.status(200).json({ message: 'plz verify the otp to continue', otp: true });
  } catch (err) {
    console.error('Register Error', err);
    res.status(500).json({ message: 'someting went wrong', success: false });
  }
};





export const verifyOtp = async (req: Request, res: Response) => {
  console.log('reached here at verify otp');
  try {
    const { email } = req.query;
    const { otp } = req.body;
    console.log(`${email},${otp}`);
    const otpData = await otpModel.findOne({ email });
    console.log('before logging otp data');

    console.log(otpData);

    console.log('after loging otp data');

    if (!otpData) {
      console.log('no otp data');

      return res.status(400).json({ message: 'otp not found' });
    }
    if (otpData.otp.toString() !== otp.toString()) {
      console.log('otp mismatch');

      return res.status(400).json({ message: 'Invalid otp' });
    }

    const hashedPassword = await bcrypt.hash(otpData.password, 10);
    console.log('after hashed pass');

    const createUser = await userModel.create({
      name: otpData.name,
      email: otpData.email,
      password: hashedPassword,
    });
    console.log('after create user');

    console.log(createUser);

    console.log('after loging create logging');
    const accessToken = signJwt({ id: otpData._id, email: otpData.email });
    const refreshToken = Jwt.sign(
      { id: otpData._id, email: otpData.email },
      process.env.REFRESH_SECRET!,
      { expiresIn: '30d' },
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    await otpModel.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: 'Registration completed successfully',
      accessToken: accessToken,
    });
  } catch (err) {
    console.log('veryfyotp catch woerked', err);
    res.status(500).json({ message: 'Internal server errror', error: err });
  }
};




// google authentication
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    const accessToken = Jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        googleId: user.googleId?.toString() || null,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = Jwt.sign(
      { id: user._id.toString() },
      process.env.REFRESH_SECRET!,     
      { expiresIn: "30d" }             
    );

    await refreshModel.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        tokenhash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { upsert: true }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const frontendURL = process.env.CLIENT_URL!;
    res.redirect(`${frontendURL}/auth/callback?token=${accessToken}`);

  } catch (err) {
    console.log("Google OAuth error:", err);
    res.status(500).json({ message: "Google auth failed" });
  }
};




export const logout = async(req:Request,res:Response)=>{
  try{
     const refreToken  = req.cookies.refreshToken;
     if(!refreToken){
      return res.status(200).json({success:true,message :"Logged out"})
     }
     const hashed = hashToken(refreToken);
      await refreshModel.deleteOne({tokenhash:hashed})
       res.clearCookie("refreshToken",{
        httpOnly:true,
        secure:false,
        sameSite:"strict"
       })
       return res.status(200).json({sccess:true,message:"Logged out successfully"})


  }catch(err){
    console.log("error in logout");
    return res.status(500).json({success:false,message:"Internal server Error"})
    
  }
};

export const testpro = (req: Request, res: Response) => {
  try {
    return res.json({ message: 'reached protecteed routes' });
  } catch (err) {
    return res.json({ message: 'error', error: err });
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
        createdAt: new Date() 
      }
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

