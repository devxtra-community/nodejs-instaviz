import { Request, Response } from "express";
import dataModel from "../../model/dataModel";

export const getWeeklyUploads = async (req: Request, res: Response) => {
  try {
    const today = new Date();

    // Find Monday (local time)
    const day = today.getDay(); // Sun=0
    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const result: { day: string; uploads: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);

      const start = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate(),
        0, 0, 0, 0
      );

      const end = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate(),
        23, 59, 59, 999
      );

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
