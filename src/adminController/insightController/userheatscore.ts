import userModel from "../../model/user";
import dataModel from "../../model/dataModel";
import { Request, Response } from "express";

export const getUserHeatScore = async (req: Request, res: Response) => {
  try {
 
    const totalUsers = await userModel.countDocuments({ isDeleted: false });

   // last 1 month range
    const  now = new Date();
    const past30 = new Date();
    past30.setDate(now.getDate() - 30);

    const activeUsers = await userModel.countDocuments({
      updatedAt: { $gte: past30 },
      isDeleted: false,
    });

   
    const totalUploads = await dataModel.countDocuments({ status: "success" });

    // formulas to get score and heatscore
    const score =
      (activeUsers / (totalUsers || 1)) * 40 +
      Math.min(totalUploads / 10, 60);

    const heatScore = Math.round(Math.min(score, 100));

    return res.json({
      totalUsers,
      activeUsers,
      totalUploads,
      heatScore,
    });

  } catch (err) {
    console.error("Heat score error:", err);
    return res.status(500).json({
      message: "Error calculating heat score",
      success: false,
    });
  }
};
