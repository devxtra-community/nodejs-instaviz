import Jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import refreshModel from "../model/refreshtoken";

interface AuthedUser {
  userId: string;
  isGuest?: boolean;
}

type AuthedRequest = Request & {
  user?: AuthedUser;
};

export const verifyToken = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) => {
  const publicRoutes = ["/auth/login", "/auth/newRefreshToken"];

  // Skip verification for public routes
  if (publicRoutes.some((route) => req.originalUrl.includes(route))) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = Jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    // Expecting payload like: { id: string, email: string, ... }
    if (!decoded || !decoded.id) {
      return res
        .status(401)
        .json({ message: "Invalid token payload (no id found)" });
    }

    // Set req.user in the shape used everywhere else in your app
    req.user = {
      userId: decoded.id as string,
    };
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const sessionId = req.headers["x-session-id"];

  if (!sessionId || typeof sessionId !== "string") {
    return res.status(401).json({ message: "Session ID missing" });
  }

  const session = await refreshModel.findById(sessionId);

  if (!session) {
    return res.status(401).json({
      message: "Session expired or logged out",
    });
  }

  session.lastActiveAt = new Date();
  await session.save();

  next();
};
