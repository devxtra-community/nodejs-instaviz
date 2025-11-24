import express from "express";
import { getTotalDeviceSplit } from "../../adminController/insightController/device";
import { verifyAdmin } from "../../middlewares/verifyAdmin";
import { getWeeklyUser } from "../../adminController/insightController/userWeekly";

export const insightsRouter = express.Router();

insightsRouter.get("/device", verifyAdmin, getTotalDeviceSplit);

insightsRouter.get("/weeklyuser", getWeeklyUser);
