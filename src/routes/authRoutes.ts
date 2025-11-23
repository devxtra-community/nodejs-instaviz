import passport from "passport";
import { Router } from "express";
import { googleCallback, logout } from "../auth/auth.ts";

import { register, loginCheck, verifyOtp } from "../auth/auth.ts";
import { testpro } from "../auth/auth.ts";
import { refreshAccessToken } from "../services/jwtServices.ts";
import { deviceLogger } from "../utils/deviceLogger.ts";
import { verifyToken } from "../middlewares/verifyToken.ts";
import { resendOtp } from "../auth/auth.ts";
import { forgotPassword } from "../auth/auth.ts";
import { verifyForgotOtp } from "../auth/auth.ts";
import { resetPassword } from "../auth/auth.ts";
import { getAllSessions } from "../auth/auth.ts";
import { logoutDevice } from "../auth/auth.ts";

const authRouter = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success + access token
 *       400:
 *         description: Invalid credentials
 */
authRouter.post("/login", loginCheck, deviceLogger);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 *       400:
 *         description: User already exists
 */
authRouter.post("/register", register);

/**
 * @swagger
 * /auth/verifyOtp:
 *   post:
 *     summary: Verify user OTP during registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
authRouter.post("/verifyOtp", verifyOtp);

/**
 * @swagger
 * /auth/resendOtp:
 *   post:
 *     summary: Resend OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent
 */
authRouter.post("/resendOtp", resendOtp);

/**
 * @swagger
 * /auth/test:
 *   get:
 *     summary: Protected test route
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valid
 *       401:
 *         description: Unauthorized
 */
authRouter.get("/test", verifyToken, testpro);

/**
 * @swagger
 * /auth/newRefreshToken:
 *   post:
 *     summary: Get a new access token using refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */
authRouter.post("/newRefreshToken", refreshAccessToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user (deletes refresh token)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
authRouter.post("/logout", logout);

/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: Request OTP for forgotten password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */
authRouter.post("/forgotPassword", forgotPassword);

/**
 * @swagger
 * /auth/verifyForgotOtp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 */
authRouter.post("/verifyForgotOtp", verifyForgotOtp);

/**
 * @swagger
 * /auth/resetPassword:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 */
authRouter.post("/resetPassword", resetPassword);

/**
 * @swagger
 * /auth/getAllSessions:
 *   get:
 *     summary: Get all user login sessions
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
authRouter.get("/getAllSessions", verifyToken, getAllSessions);

/**
 * @swagger
 * /auth/logoutDevice:
 *   post:
 *     summary: Logout from a single device session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
authRouter.post("/logoutDevice", verifyToken, logoutDevice);

// google authentication
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google OAuth login
 *     tags: [Auth]
 */
authRouter.get("/google", passport.authenticate("google", { scope: ["Profile", "email"] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 */
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/google" }),
  googleCallback,
);

export default authRouter;
