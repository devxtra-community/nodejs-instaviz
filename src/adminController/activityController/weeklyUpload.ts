import { Request, Response } from "express";
import dataModel from "../../model/dataModel";

export const getWeeklyUploads = async (req: Request, res: Response) => {
  try {
    const now = new Date(); // get current utc time
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // convert utc to ist

    const day = istNow.getDay(); // get today
    const diff = day === 0 ? -6 : 1 - day; // find how many days to go back to monday

    const mondayIST = new Date(istNow); // Create new date instance to safely modify week start value.
    mondayIST.setDate(istNow.getDate() + diff); // move the date front or back by diff
    mondayIST.setHours(0, 0, 0, 0);

    const result: { day: string; uploads: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const currentIST = new Date(mondayIST); // Clone mondayIST to a new date for daily computation.
      currentIST.setDate(mondayIST.getDate() + i); // Adjust currentIST forward by i days to target each weekday

      const startIST = new Date(currentIST);
      startIST.setHours(0, 0, 0, 0);

      const endIST = new Date(currentIST);
      endIST.setHours(23, 59, 59, 999);

      const startUTC = new Date(startIST.getTime() - 5.5 * 60 * 60 * 1000); // convert to utc for 
      const endUTC = new Date(endIST.getTime() - 5.5 * 60 * 60 * 1000); // mongodb query operations

      const count = await dataModel.countDocuments({
        createdAt: { $gte: startUTC, $lte: endUTC },
        status: "success",
      });

      result.push({
        day: currentIST.toLocaleString("en-US", { weekday: "short" }),
        uploads: count,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error("Weekly upload error:", err);
    return res.status(500).json([]);
  }
};
