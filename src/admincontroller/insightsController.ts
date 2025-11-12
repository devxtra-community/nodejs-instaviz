import { Request, Response } from "express";
import { deviceModel } from "../model/admin/insights/deviceModel";

export const deviceUsage = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user || { _id: "65af1e99623a77abb102abc1" }; 

    const logs = await deviceModel.find({
      userId: user._id,
      action: "/fileupload"
    });

    let mobile = 0;
    let desktop = 0;

    logs.forEach((log) => {
      const ua = log.userAgent?.toLowerCase() || "";
      if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        mobile++;
      } else {
        desktop++;
      }
    });

    const total = mobile + desktop;

    res.json({
      mobile: total ? Math.round((mobile / total) * 100) : 0,
      desktop: total ? Math.round((desktop / total) * 100) : 0
    });

  } catch (err) {
    console.log(" Error device stats:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
};
