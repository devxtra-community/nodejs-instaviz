import { Request, Response, NextFunction } from "express";

export const deviceLogger = (req: Request, res: Response, next: NextFunction) => {
  try {
    const ua = req.headers["user-agent"]?.toLowerCase() || "";

    const device =
      ua.includes("mobile") ||
      ua.includes("iphone") ||
      ua.includes("android")
        ? "mobile"
        : "desktop";

    (req as any).device = device; 
    next();
  } catch (err) {
    console.log("Device detection error:", err);
    next();
  }
};
