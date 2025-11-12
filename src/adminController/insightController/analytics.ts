import { Request, Response } from "express";

export const analyticsData = async (req: Request, res: Response) => {
  try {
    return res.json({
      message: "Analytics loaded",
      data: {
        totalUsers: 120,
        activeUsers: 85,
        uploadsToday: 10
      }
    });
  } catch (err) {
    console.log("Analytics error:", err);
    res.status(500).json({ message: "Failed to get analytics" });
  }
};
