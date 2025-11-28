import jwt from "jsonwebtoken";
import { Response, Request } from "express";
import { hashToken } from "../utils/hashTokens";
import refreshModel from "../model/refreshtoken";

export const signJwt = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "10s" });
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "no refresh token" });
  }
  try {
    const correctCheck = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as {
      id: string;
      email: string;
    };
    const hashedToken = hashToken(refreshToken);
    const savedToken = await refreshModel.findOne({ tokenhash: hashedToken });
    if (!savedToken) {
      return res.status(401).json({ success: false, message: "invalid refreshtoken" });
    }

    const jwtPayload = { id: correctCheck.id, email: correctCheck.email };

    const newAccessToken = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });

    return res.status(200).json({ success: true, newAccessToken });
  } catch (err) {
    console.log("error in refresh token worked", err);
    return res.status(500).json({ success: false, message: "internal server error" });
  }
};
