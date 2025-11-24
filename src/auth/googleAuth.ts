import { Request, Response } from "express";
import Jwt from "jsonwebtoken";
import refreshModel from "../model/refreshtoken";
import { hashToken } from "../utils/hashTokens";


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
      { expiresIn: "15m" },
    );

    const refreshToken = Jwt.sign({ id: user._id.toString() }, process.env.REFRESH_SECRET!, {
      expiresIn: "30d",
    });

    const userAgent = req.headers["user-agent"] || "unknown";
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || "unknown";
    const session = await refreshModel
      .findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          tokenhash: hashToken(refreshToken),
          userAgent,
          ip,
          createdAt: new Date(),
          lastActiveAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isValid: true,
        },
        { upsert: true, new: true },
      )
      .select("_id");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const frontendURL = process.env.CLIENT_URL!;
    res.redirect(`${frontendURL}/auth/callback?token=${accessToken}&sessionId=${session._id}`);
  } catch (err) {
    console.log("Google OAuth error:", err);
    res.status(500).json({ message: "Google auth failed" });
  }
};
