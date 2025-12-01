import { Request, Response } from "express";
import dataModel from "../../model/dataModel";

export const peakHours = async (req: Request, res: Response) => {
  try {
    // Fetch ALL uploads (no date filter)
    const logs = await dataModel.find().select("createdAt");

    if (logs.length === 0) {
      return res.json([]);
    }

    // Count uploads for each hour (0–23)
    const hourCounts = {} as Record<number, number>;

    logs.forEach((log) => {
      const hour = new Date(log.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Format hours into AM/PM labels
    const formattedData = Object.entries(hourCounts).map(
      ([hourStr, value]) => {
        const hour = Number(hourStr);
        let label = "";

        if (hour === 0) label = "12 AM";
        else if (hour === 12) label = "12 PM";
        else if (hour > 12) label = `${hour - 12} PM`;
        else label = `${hour} AM`;

        return {
          time: label,
          value: value as number,
        };
      }
    );

    // Sort the results in chronological order
    const parseLabelTo24 = (label: string) => {
      const [num, mer] = label.split(" ");
      let h = Number(num);

      if (mer === "AM") return h === 12 ? 0 : h;
      else return h === 12 ? 12 : h + 12;
    };

    formattedData.sort(
      (a, b) => parseLabelTo24(a.time) - parseLabelTo24(b.time)
    );

    return res.json(formattedData);

  } catch (err) {
    console.log("Peak hour stats error:", err);
    return res.status(500).json([]);
  }
};
