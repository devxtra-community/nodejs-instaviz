import { Request, Response } from "express";

import userModel from "../../model/user";

export const getTotalDeviceSplit = async (req: Request, res: Response) => {
  try {

    const desktop = await userModel.countDocuments({ device: "desktop" });
    const mobile = await userModel.countDocuments({ device: "mobile" });

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
