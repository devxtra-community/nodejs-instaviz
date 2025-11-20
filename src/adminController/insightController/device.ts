import { Request, Response } from "express";
import dataModel from "../../model/dataModel";

export const getTotalDeviceSplit = async (req: Request, res: Response) => {
  try {

    const desktop = await dataModel.countDocuments({ device: "desktop" });
    const mobile = await dataModel.countDocuments({ device: "mobile" });

    const total = desktop + mobile;

    return res.json({
      desktop,
      mobile,
      desktopPercentage: total ? Math.round((desktop / total) * 100) : 0,
      mobilePercentage: total ? Math.round((mobile / total) * 100) : 0
    });

  } catch (err) {
    console.log("Device split error:", err);
    res.status(500).json({
      desktop: 0,
      mobile: 0,
      desktopPercentage: 0,
      mobilePercentage: 0
    });
  }
};
