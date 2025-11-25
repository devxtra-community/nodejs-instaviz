import { Router } from "express";
import { dashboardStats } from "../../adminController/dashboardController/cards";
import { getUserDeviceStats } from "../../adminController/dashboardController/userDevice";
import { getUploadDeviceStats } from "../../adminController/dashboardController/userUploads";
import { verifyAdmin } from "../../middlewares/verifyAdmin";

export const dashboardRouter = Router();

/**
 * @swagger
 * tags:
 *   name: AdminDashboard
 *   description: Admin dashboard analytics and statistics
 */

/**
 * @swagger
 * /admin/dashboard/userdevices:
 *   get:
 *     summary: Get user device statistics
 *     description: Returns device type analytics of all users (mobile, desktop, etc.)
 *     tags: [AdminDashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Device stats retrieved successfully
 *       401:
 *         description: Unauthorized — admin token missing or invalid
 *       500:
 *         description: Server error
 */
dashboardRouter.get("/dashboard/userdevices", verifyAdmin, getUserDeviceStats);

/**
 * @swagger
 * /admin/dashboard/useruploads:
 *   get:
 *     summary: Get user upload statistics
 *     description: Returns upload analytics such as total uploads and device breakdown.
 *     tags: [AdminDashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upload stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
dashboardRouter.get("/dashboard/useruploads", verifyAdmin, getUploadDeviceStats);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard overall statistics
 *     description: Returns cards such as total users, active users, uploads count, etc.
 *     tags: [AdminDashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
dashboardRouter.get("/dashboard", verifyAdmin, dashboardStats);
