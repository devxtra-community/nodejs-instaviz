import { Request, Response } from "express";
import Jwt from "jsonwebtoken";
import refreshModel from "../model/refreshtoken";
import { hashToken } from "../utils/hashTokens";
import userModel from "../model/user";

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const userFromReq = req.user as any;

    const user = await userModel.findById(userFromReq._id);

    if (!user) {
      const frontendURL = process.env.CLIENT_URL!;
      const errorMessage = encodeURIComponent("User not found.");
      return res.redirect(`${frontendURL}/auth/error?message=${errorMessage}`);
    }

    if (user.isDeleted) {
      const frontendURL = process.env.CLIENT_URL!;
      const errorMessage = encodeURIComponent("This account has been deleted.");
      return res.redirect(`${frontendURL}/auth/error?message=${errorMessage}`);
    }

    if (user.status === "disabled") {
      const frontendURL = process.env.CLIENT_URL!;
      const errorMessage = encodeURIComponent(
        "Your account has been deactivated by admin. Please contact support.",
      );
      return res.redirect(`${frontendURL}/auth/error?message=${errorMessage}`);
    }

    if (user.isSuspended) {
      const now = new Date();

      if (user.suspensionEnd && user.suspensionEnd <= now) {
        user.isSuspended = false;
        user.suspensionEnd = null;
        await user.save();
      } else {
        const frontendURL = process.env.CLIENT_URL!;
        const suspensionEndFormatted = user.suspensionEnd
          ? new Date(user.suspensionEnd).toLocaleString()
          : "indefinitely";
        const errorMessage = encodeURIComponent(
          `Your account is suspended until ${suspensionEndFormatted}. Please contact support.`,
        );
        return res.redirect(`${frontendURL}/auth/error?message=${errorMessage}`);
      }
    }

    const redirect = typeof req.query.state === "string" ? req.query.state : "/home";

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
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const frontendURL = process.env.CLIENT_URL!;
    res.redirect(
      `${frontendURL}/auth/callback?token=${accessToken}&sessionId=${session._id}&redirect=${redirect}`,
    );
  } catch (err) {
    console.error("Google OAuth error:", err);
    const frontendURL = process.env.CLIENT_URL!;
    res.redirect(`${frontendURL}/auth/error?message=Google%20auth%20failed`);
  }
};
