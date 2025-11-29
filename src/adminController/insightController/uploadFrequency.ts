import userModel from "../../model/user";
import dataModel from "../../model/dataModel";
import { Request, Response } from "express";

export const getUploadFrequency = async (req: Request, res: Response) => {
  try {

    const totalUsers = await userModel.countDocuments({ isDeleted: false });

    const totalUploads = await dataModel.countDocuments({ status: "success" });

    const frequency =
      totalUsers === 0 ? 0 : Number((totalUploads / totalUsers).toFixed(2));

    return res.json({
      totalUsers,
      totalUploads,
      frequency,
    });

  } catch (err) {
    console.error("Upload frequency error:", err);
    return res.status(500).json({
      message: "Error calculating frequency",
      success: false,
    });
  }
};
