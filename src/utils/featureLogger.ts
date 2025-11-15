
import { FeatureUsage } from "../model/admin/insights/featureModel";

export const featureUsage = (featureName: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      if (!req.user) return next(); //  if not logged in user skip logging
      await FeatureUsage.create({
        userId: req.user._id || req.user.id, // userid from token / auth middleware
        feature: featureName, // feature used
      });
    } catch (err) {
      console.log("Feature logging failed", err);
    }

    next();
  };
};
