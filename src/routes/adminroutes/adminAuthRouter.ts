import { adminLogin } from "../../adminController/auth/adminLogin";
import { Router } from "express";
import { adminLogout } from "../../adminController/auth/adminLogout";
import { refreshAdminAccessToken } from "../../adminController/auth/adminAuthController";

const adminAuthRouter = Router();

/**
 * @swagger
 * tags:
 *   name: AdminAuth
 *   description: Admin authentication (login, refresh, logout)
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     description: Logs in an admin and returns access + refresh token.
 *     tags: [AdminAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "AdminPass123"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
adminAuthRouter.post("/login", adminLogin);

/**
 * @swagger
 * /admin/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Refreshes admin access token using a valid refresh token.
 *     tags: [AdminAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
adminAuthRouter.post("/refresh", refreshAdminAccessToken);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Admin logout
 *     description: Logs out admin and invalidates refresh token.
 *     tags: [AdminAuth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
adminAuthRouter.post("/logout", adminLogout);

export default adminAuthRouter;
