import express from "express";
import { deviceUsage } from "../../adminController/insightController/Device";
import { verifyToken } from "../../middleware/verifytoken";
import { featureStats } from "../../adminController/insightController/feature";
import { downloadReport } from "../../adminController/insightController/downloadreport";
import { featureUsage } from "../../middleware/featureLogger";
import { analyticsData } from "../../adminController/insightController/analytics";
import { adminVerify } from "../../middleware/adminVerify";

export const insightsRouter = express.Router();


insightsRouter.get("/device", adminVerify , deviceUsage);

insightsRouter.get("/downloads",adminVerify , featureUsage("download_report"),downloadReport);

insightsRouter.get("/analytics",adminVerify,featureUsage("user_analytics"),analyticsData)

insightsRouter.get( "/featurestats",adminVerify,featureStats);
