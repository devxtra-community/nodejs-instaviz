import { Request, Response } from "express";
import { UploadLog } from "../../model/admin/activity/upload";

export const uploadStats = async (req: Request, res: Response) => {
  try {
    const logs = await UploadLog.find();
    if (logs.length === 0) {
      return res.json({
        total: 0,
        success: 0,
        failed: 0,
        peakHour: null,
      });
    }
    const total = logs.length;
    const success = logs.filter((l) => l.status === "success").length;
    const failed = logs.filter((l) => l.status === "failed").length;
    const hourCounts: any = {};

    logs.forEach((log) => {
      // count how many uploads in each hour of the day
      const hour = new Date(log.createdAt).getHours(); // get hour from date
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).reduce((a: any, b: any) =>
      b[1] > a[1] ? b : a
    )[0];
    const peakHourNumber = Number(peakHour);
    let formattedHour = "";

    if (peakHourNumber == 0) {
      formattedHour = "12 AM";
    } else if (peakHourNumber === 12) {
      formattedHour = "12 PM";
    } else if (peakHourNumber > 12) {
      formattedHour = `${peakHourNumber - 12} PM`;
    } else {
      formattedHour = `${peakHourNumber} AM`;
    }

    res.json({
      total,
      success,
      failed,
      peakHour: formattedHour
    });
  } catch (err) {
    console.log("Stats error:", err);
    res.status(500).json({});
  }
};
