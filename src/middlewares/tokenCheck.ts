import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import userModel from "../model/user";
import guestModel from "../model/guest";

interface JwtPayload {
  id: string;
  userId: string;
}

interface UserPayload {
  userId: string;
  isGuest?: boolean;
}

type AuthedRequest = Request & {
  user?: UserPayload;
};

export const tokenCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("tokenCheck middleware");

    const authedReq = req as AuthedRequest;

    const fullPath = req.baseUrl + req.path;
    const routeKey = `${req.method}:${fullPath}`;
    console.log("routeKey:", routeKey);

    let isSafe = false;

    if (
      routeKey.startsWith("GET:/session") ||     
      routeKey.startsWith("DELETE:/session") ||  
      routeKey.startsWith("PATCH:/session") ||   
      routeKey.startsWith("POST:/session") ||    
      routeKey.startsWith("POST:/session/") ||   
      routeKey.startsWith("GET:/user/token") ||
      routeKey.startsWith("GET:/user/")
    ) {
      isSafe = true;
    }



    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = Jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        authedReq.user = { userId: decoded.id, isGuest: false };

        const user = await userModel.findById(decoded.id);

        if (!user) {
          return res.status(401).json({ success: false, message: "Invalid user" });
        }

        if (!isSafe && user.token === 0) {
          return res.status(401).json({
            success: false,
            message: "Token finished",
          });
        }

        return next();
      } catch (err) {
        console.log("JWT decode failed");
        return res.status(401).json({ success: false, message: "Session expired" });
      }
    }

    const guestId = req.cookies?.userId;

    if (guestId) {
      authedReq.user = { userId: guestId, isGuest: true };

      const guest = await guestModel.findById(guestId);

      if (!guest) {
        res.clearCookie("userId");
        return res.status(401).json({
          success: false,
          message: "Guest expired, upload again.",
        });
      }

      if (!isSafe && guest.token === 0) {
        return res.status(401).json({
          success: false,
          message: "Token finished",
        });
      }

      return next();
    }

    const newGuest = await guestModel.create({});
    authedReq.user = { userId: newGuest._id.toString(), isGuest: true };

    res.cookie("userId", newGuest._id.toString(), {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    return next();
  } catch (err) {
    console.error("tokenCheck error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
