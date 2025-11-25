import { Router } from "express";
import { loggedusers } from "../../adminController/userController";
import { fetchAllgustusers } from "../../adminController/userController";
import { getNewUsersPerMonth } from "../../adminController/userController";
import { getAllusers } from "../../adminController/userController";
import { alluserspage } from "../../adminController/userController";
import { GetSingleuser } from "../../adminController/userController";
import { singleUsertoken } from "../../adminController/userController";
import { addGustuser } from "../../adminController/userController";
import { updateUserstatus } from "../../adminController/userController";
import { hourlyActiveUserCount } from "../../adminController/userController";
import { getUserDailyActiveTime } from "../../adminController/userController";
import { getUserActiveTimeByDays } from "../../adminController/userController";
import { verifyAdmin } from "../../middlewares/verifyAdmin";

export const adminUserRouter = Router();

/**
 * @swagger
 * tags:
 *   name: AdminUsers
 *   description: Admin operations for user management, activity tracking, tokens, and analytics
 */

/**
 * @swagger
 * /admin/loggedusers:
 *   get:
 *     summary: Get currently logged-in active users
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns all active logged-in users
 *       401:
 *         description: Unauthorized
 */
adminUserRouter.get("/loggedusers", verifyAdmin, loggedusers);

/**
 * @swagger
 * /admin/gustusers:
 *   get:
 *     summary: Get all guest users
 *     tags: [AdminUsers]
 *     responses:
 *       200:
 *         description: Guest users fetched successfully
 */
adminUserRouter.get("/gustusers", fetchAllgustusers);

/**
 * @swagger
 * /admin/getallusers:
 *   get:
 *     summary: Get all registered users
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 */
adminUserRouter.get("/getallusers", verifyAdmin, getAllusers);

/**
 * @swagger
 * /admin/newuserpermonth:
 *   get:
 *     summary: Get new users added per month
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly new user stats
 *       401:
 *         description: Unauthorized
 */
adminUserRouter.get("/newuserpermonth", verifyAdmin, getNewUsersPerMonth);

/**
 * @swagger
 * /admin/alluserspage:
 *   get:
 *     summary: Paginated list of users (admin panel)
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pagination results fetched successfully
 *       401:
 *         description: Unauthorized
 */
adminUserRouter.get("/alluserspage", verifyAdmin, alluserspage);

/**
 * @swagger
 * /admin/singleuser/{id}:
 *   get:
 *     summary: Get details of a single user by ID
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
adminUserRouter.get("/singleuser/:id", verifyAdmin, GetSingleuser);

/**
 * @swagger
 * /admin/singltoken/{id}:
 *   get:
 *     summary: Get token details for a single user
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Token details retrieved
 *       404:
 *         description: Token data not found
 *       401:
 *         description: Unauthorized
 */
adminUserRouter.get("/singltoken/:id", verifyAdmin, singleUsertoken);

/**
 * @swagger
 * /admin/addgustuser:
 *   post:
 *     summary: Add a guest user manually
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Guest user added successfully
 *       401:
 *         description: Unauthorized
 */
adminUserRouter.post("/addgustuser", verifyAdmin, addGustuser);

/**
 * @swagger
 * /admin/status/{id}:
 *   put:
 *     summary: Update a user's active status (block/unblock)
 *     tags: [AdminUsers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: User not found
 */
adminUserRouter.put("/status/:id", updateUserstatus);

/**
 * @swagger
 * /admin/activetime:
 *   get:
 *     summary: Get hourly active user count
 *     description: Returns how many users were active in each hour of the day.
 *     tags: [AdminUsers]
 *     responses:
 *       200:
 *         description: Active hourly user data
 *       500:
 *         description: Server error
 */
adminUserRouter.get("/activetime", hourlyActiveUserCount);

/**
 * @swagger
 * /admin/user-daily-active/{id}:
 *   get:
 *     summary: Get daily active time stats for a user
 *     tags: [AdminUsers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Daily activity data returned
 *       404:
 *         description: User not found
 */
adminUserRouter.get("/user-daily-active/:id", getUserDailyActiveTime);

/**
 * @swagger
 * /admin/user-active-by-days/{id}:
 *   post:
 *     summary: Get active time of user based on day range
 *     tags: [AdminUsers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 example: "2025-01-01"
 *               endDate:
 *                 type: string
 *                 example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Active time by days retrieved
 *       404:
 *         description: User not found
 */
adminUserRouter.post("/user-active-by-days/:id", getUserActiveTimeByDays);
