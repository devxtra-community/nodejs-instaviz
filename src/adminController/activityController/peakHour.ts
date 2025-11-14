import { Response, Request } from "express";
import { UploadLog } from "../../model/admin/activity/upload";

export const peakHours = async (req: Request ,res: Response, ) => {
  try {
    const logs = await UploadLog.find();
    if (logs.length === 0) {
      return res.json([]);
    }
    const hourCounts: any = {};
    logs.forEach((log) => {
      const hour = new Date(log.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const formattedData = Object.entries(hourCounts).map(([hourstr, value]) => {
      const hours = Number(hourstr);
      let label = "";
      if (hours === 0) label = "12 AM";
      else if (hours === 12) label = "12 PM";
      else if (hours > 12) label = `${hours - 12} PM`;
      else label = `${hours} AM`;

      return {
        time: label,
        value: value as number,
      };
    });
    const sortedTime = (label: string) => {
      const [num, mer] = label.split(" ");
      let hour = Number(num);

      if (mer === "AM") {
        if (hour === 12) hour = 0;
      } else {
        if (hour != 12) hour += 12;
      }
      return hour;
    };
    formattedData.sort((a, b) => sortedTime(a.time) - sortedTime(b.time));
    res.json(formattedData);
  } catch (err) {
    console.log("Peak hour stats error:", err);
    res.status(500).json([]);
  }
};
