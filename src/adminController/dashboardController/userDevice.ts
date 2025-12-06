import { Request, Response } from "express";
import userModel from "../../model/user";

export const getUserDeviceStats = async (req: Request, res: Response) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const desktop = await userModel.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      device: "desktop",
      isDeleted: false
    });

    const mobile = await userModel.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      device: "mobile",
      isDeleted: false
    });

    return res.json({ desktop, mobile });

  } catch (err) {
    console.log("User device stats error:", err);
    return res.status(500).json({ message: "Error fetching stats" });
  }
};
