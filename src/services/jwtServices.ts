import jwt from "jsonwebtoken";
import { Response, Request } from "express";

export const signJwt = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "no refresh token" });
  }
  try {
    const correctCheck = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET!
    ) as { id: string; email: string };
    const newAccessToken = jwt.sign(
      { id: correctCheck.id, email: correctCheck.email },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    return res.status(200).json({ success: true, newAccessToken });
  } catch (err) {}
};
