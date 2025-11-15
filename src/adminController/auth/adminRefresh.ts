import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import adminModel from "../../model/admin/adminModel";
import bcrypt from "bcrypt";

export const adminRefresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.adminRefreshToken; 

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No admin refresh token" });
    }

    
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET!) as any;

   
    const admin = await adminModel.findById(decoded.id);
    if (!admin || !admin.refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token not found" });
    }

    const isMatch = await bcrypt.compare(token, admin.refreshToken);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

  
    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        role: "admin",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        role: "admin",
      },
      process.env.REFRESH_SECRET!,
      { expiresIn: "30d" }
    );

    const hashedNewRefresh = await bcrypt.hash(newRefreshToken, 10);


    admin.refreshToken = hashedNewRefresh;
    await admin.save();

 
    res.cookie("adminAccessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("adminRefreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, newAccessToken });

  } catch (err) {
    console.log("Admin refresh failed:", err);
    return res
      .status(401)
      .json({ success: false, message: "Invalid refresh token" });
  }
};
