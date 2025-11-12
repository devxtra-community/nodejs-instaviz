import { Request, Response } from "express";
import { FeatureUsage } from "../../model/admin/insights/featureModel";

export const featureStats = async (req: Request, res: Response) => {
  try {
  const user = (req as any).user || { _id: "65af1e99623a77abb102abc1" }; // your dummy user ID

    const logs = await FeatureUsage.find({
      userId: user._id || user.id,
    });
    const total = logs.length;
    if (total === 0) return res.json([]);
    const counts: any = {};
    logs.forEach((log: any) => { // loop each log to get count of each feature 
      counts[log.feature] = (counts[log.feature] || 0) + 1; // if count exists increase by 1 or start from 1
    });

    const result = Object.entries(counts).map(([feature, value]: any) => ({ // maps each object to array and convert to percentage
      feature,
      percentage: Math.round((value / total) * 100),
    }));
    res.json({ result });
  } catch (err) {
    console.log('Feature stats error',err)
    res.status(500).json({message:"Server error"})
  }
};
