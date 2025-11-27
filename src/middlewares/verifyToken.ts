import Jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import refreshModel from "../model/refreshtoken";

export const verifyToken = async(
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("inside verify token");
  
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "no token" });
  }

  const token = authHeader.split(" ")[1];
  console.log("TOKEN EXPIRY CHECK", Jwt.decode(token));

  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
  
    
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  const sessionId = req.headers["x-session-id"];
  console.log("session id:",sessionId);
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(401).json({ message: "Session ID missing" });
  }

  const session = await refreshModel.findOne({ _id: sessionId });

  if (!session) {
    return res.status(401).json({
      message: "Session expired or logged out",
    });
  }

 
  next();
};
