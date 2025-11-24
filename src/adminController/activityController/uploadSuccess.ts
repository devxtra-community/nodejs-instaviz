import { Request, Response } from "express";
import dataModel from "../../model/dataModel";

export const uploadSuccess = async (req: Request, res: Response) => {
  try {
    const totalUploads = await dataModel.countDocuments();

    if (totalUploads === 0) {
      return res.json({ successRate: 0 });
    }

    const successUploads = totalUploads;

    const successRate = Math.round((successUploads / totalUploads) * 100);

    return res.json({ successRate });

  } catch (err) {
    console.log("Upload rate error:", err);
    return res.status(500).json({ successRate: 0 });
  }
};
