import passport from "passport";
import { Router } from "express";

import { googleCallback } from "../auth/googleAuth.ts";
import { register, loginCheck } from "../auth/auth.ts";
import { verifyOtp, resendOtp } from "../auth/otp.ts";
import { refreshAccessToken } from "../services/jwtServices.ts";
import { deviceLogger } from "../utils/deviceLogger.ts";
import { verifyToken } from "../middlewares/verifyToken.ts";
import { forgotPassword } from "../auth/password.ts";
import { verifyForgotOtp } from "../auth/otp.ts";
import { resetPassword } from "../auth/password.ts";
import { getAllSessions } from "../auth/auth.ts";
import { logoutDevice } from "../auth/logoutAuth.ts";
import { logoutAllDevices } from "../auth/logoutAuth.ts";
import { cookieCheck } from "../middlewares/cookieCheck.ts";

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication, registration, OTP, password reset, sessions & OAuth
 */

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
authRouter.post("/login", cookieCheck, loginCheck, deviceLogger);

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
 */
authRouter.post("/register", register);

/**
 * @swagger
 * /auth/verifyOtp:
 *   post:
 *     summary: Verify OTP during registration
 *     tags: [Auth]
 */
authRouter.post("/verifyOtp", verifyOtp);

/**
 * @swagger
 * /auth/resendOtp:
 *   post:
 *     summary: Resend OTP to email
 *     tags: [Auth]
 */
authRouter.post("/resendOtp", resendOtp);

/**
 * @swagger
 * /auth/newRefreshToken:
 *   post:
 *     summary: Generate new access token using refresh token
 *     tags: [Auth]
 */
authRouter.post("/newRefreshToken", refreshAccessToken);

/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: Request OTP for forgotten password
 *     tags: [Auth]
 */
authRouter.post("/forgotPassword", forgotPassword);

/**
 * @swagger
 * /auth/verifyForgotOtp:
 *   post:
 *     summary: Verify OTP sent for password reset
 *     tags: [Auth]
 */
authRouter.post("/verifyForgotOtp", verifyForgotOtp);

/**
 * @swagger
 * /auth/resetPassword:
 *   post:
 *     summary: Reset password after OTP verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 */
authRouter.post("/resetPassword", resetPassword);

/**
 * @swagger
 * /auth/getAllSessions:
 *   get:
 *     summary: Get all login sessions for the user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
authRouter.get("/getAllSessions", verifyToken, getAllSessions);

/**
 * @swagger
 * /auth/logoutDevice:
 *   post:
 *     summary: Logout from a single device
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
authRouter.post("/logoutDevice", verifyToken, logoutDevice);

/**
 * @swagger
 * /auth/logoutAllDevices:
 *   post:
 *     summary: Logout user from all active devices
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
authRouter.post("/logoutAllDevices", verifyToken, logoutAllDevices);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Login with Google OAuth
 *     tags: [Auth]
 */
authRouter.get("/google", cookieCheck, (req, res, next) => {
  const redirect = typeof req.query.redirect === "string" ? req.query.redirect : "/home";
  const authenticator = passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect,
  });

  authenticator(req, res, next);
});

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
