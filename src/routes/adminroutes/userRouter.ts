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
import { getsingleUserDailyActiveTime } from "../../adminController/userController";
import { verifyAdmin } from "../../middlewares/verifyAdmin";
import { suspendUser } from "../../adminController/userController";
import { unsuspendUser } from "../../adminController/userController";


export  const adminUserRouter = Router()

adminUserRouter.get('/loggedusers', loggedusers);
adminUserRouter.get('/guestusers', fetchAllgustusers);
adminUserRouter.get('/stats', getAllusers);
adminUserRouter.get('/newusers',  getNewUsersPerMonth);

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
adminUserRouter.get("/allusers", verifyAdmin, alluserspage);

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
adminUserRouter.get("/singletoken/:id", verifyAdmin, singleUsertoken);

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
adminUserRouter.post("/addguestuser", verifyAdmin, addGustuser);

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
adminUserRouter.get("/singleUsertime/:id", getsingleUserDailyActiveTime);
adminUserRouter.put("/suspend/:id", suspendUser);
adminUserRouter.put("/unsuspend/:id", unsuspendUser);




