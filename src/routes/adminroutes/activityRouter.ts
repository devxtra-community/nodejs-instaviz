import { Router } from "express";
import { uploadStats } from "../../adminController/activityController/uploadStats";
import { uploadSuccess } from "../../adminController/activityController/uploadSuccess";
import { peakHours } from "../../adminController/activityController/peakHour";
import { verifyAdmin } from "../../middlewares/verifyAdmin";
import { getWeeklyUploads } from "../../adminController/activityController/weeklyUpload";

export const activityRouter = Router();

/**
 * @swagger
 * tags:
 *   name: AdminActivity
 *   description: Admin analytics related to user uploads and activity patterns
 */

/**
 * @swagger
 * /admin/uploadstats:
 *   get:
 *     summary: Get upload statistics
 *     description: Returns total upload metrics such as count, size distribution, etc.
 *     tags: [AdminActivity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upload statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
activityRouter.get("/uploadstats", verifyAdmin, uploadStats);

/**
 * @swagger
 * /admin/uploadsuccess:
 *   get:
 *     summary: Get upload success ratio
 *     description: Returns stats about successful vs failed uploads.
 *     tags: [AdminActivity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upload success stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
activityRouter.get("/uploadsuccess", verifyAdmin, uploadSuccess);

/**
 * @swagger
 * /admin/peakhours:
 *   get:
 *     summary: Get peak upload hours
 *     description: Returns time-based upload activity showing peak hours.
 *     tags: [AdminActivity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Peak hour stats retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
activityRouter.get("/peakhours", verifyAdmin, peakHours);

/**
 * @swagger
 * /admin/weeklyuploads:
 *   get:
 *     summary: Get weekly upload count
 *     description: Returns total uploads for each day of the past week.
 *     tags: [AdminActivity]
 *     responses:
 *       200:
 *         description: Weekly upload stats retrieved
 *       500:
 *         description: Server error
 */
activityRouter.get("/weeklyuploads", getWeeklyUploads);
