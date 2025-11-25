import express from "express";
import { getTotalDeviceSplit } from "../../adminController/insightController/device";
import { verifyAdmin } from "../../middlewares/verifyAdmin";
import { getWeeklyUser } from "../../adminController/insightController/userWeekly";

export const insightsRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: AdminInsights
 *   description: Analytics and insights for admin dashboard
 */

/**
 * @swagger
 * /admin/device:
 *   get:
 *     summary: Get device distribution statistics
 *     description: Returns the percentage split of devices used by users (mobile, desktop, etc.)
 *     tags: [AdminInsights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Device insight data retrieved successfully
 *       401:
 *         description: Unauthorized — Admin token required
 *       500:
 *         description: Server error
 */
insightsRouter.get("/device", verifyAdmin, getTotalDeviceSplit);

/**
 * @swagger
 * /admin/weeklyuser:
 *   get:
 *     summary: Get weekly user growth data
 *     description: Returns the count of new users for the past weeks.
 *     tags: [AdminInsights]
 *     responses:
 *       200:
 *         description: Weekly user insight data retrieved successfully
 *       500:
 *         description: Server error
 */
insightsRouter.get("/weeklyuser", getWeeklyUser);



