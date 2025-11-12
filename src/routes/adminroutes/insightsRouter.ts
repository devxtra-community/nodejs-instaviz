import express from "express";
import { deviceUsage } from "../../adminController/insightController/Device";
import { verifyToken } from "../../middleware/verifytoken";
import { featureStats } from "../../adminController/insightController/feature";
import { downloadReport } from "../../adminController/insightController/downloadreport";
import { featureUsage } from "../../middleware/featureLogger";
import { analyticsData } from "../../adminController/insightController/analytics";

export const insightsRouter = express.Router();


insightsRouter.get("/device",  deviceUsage);

insightsRouter.get("/downloads",featureUsage("download_report"),downloadReport);

insightsRouter.get("/analytics",featureUsage("user_analytics"),analyticsData)

insightsRouter.get( "/feature-stats",featureStats);
