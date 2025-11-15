import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import adminModel from "../../model/admin/adminModel";

import { signJwt } from "../../services/jwtServices";

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

  
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not Found", success: false });
    }

  
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

  
    const accessToken = signJwt({
      id: admin._id,
      email: admin.email,
      role: "admin",
    });

    const refreshToken = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: "admin",
      },
      process.env.REFRESH_SECRET!,
      { expiresIn: "30d" }
    );

    const hashedRefresh  = await bcrypt.hash(refreshToken,10)
    admin.refreshToken = hashedRefresh
    await admin.save()

    res.cookie("adminRefreshToken", refreshToken, {
  httpOnly: true,
  secure: false,     
  sameSite: "lax",  
  path: "/", 
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      accessToken,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });

  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
