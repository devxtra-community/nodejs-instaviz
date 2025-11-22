import { Request, Response } from "express";
import dataModel from "../../model/dataModel";

export const getWeeklyUploads = async (req: Request, res: Response) => {
  try {
    const today = new Date();

    // Compute Monday (local week structure but using UTC)
    const day = today.getUTCDay(); // Sun=0
    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setUTCDate(today.getUTCDate() + diff);
    monday.setUTCHours(0, 0, 0, 0);

    const result: { day: string; uploads: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setUTCDate(monday.getUTCDate() + i);

      const start = new Date(current);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(current);
      end.setUTCHours(23, 59, 59, 999);

      const count = await dataModel.countDocuments({
        createdAt: { $gte: start, $lte: end },
        status: "success",
      });

      result.push({
        day: current.toLocaleString("en-US", { weekday: "short" }),
        uploads: count,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error("Weekly upload error:", err);
    return res.status(500).json([]);
  }
};

