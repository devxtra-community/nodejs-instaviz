import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { startSession, heartbeat, endSession } from "../adminController/sessionController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UserSession
 *   description: User session tracking (start, heartbeat, end)
 */

/**
 * @swagger
 * /session/start:
 *   post:
 *     summary: Start a user session
 *     description: Marks the beginning of a user's active session.
 *     tags: [UserSession]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session started successfully
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Server error
 */
router.post("/start", verifyToken, startSession);

/**
 * @swagger
 * /session/heartbeat:
 *   post:
 *     summary: User session heartbeat
 *     description: Keeps the user's session active with a periodic ping.
 *     tags: [UserSession]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Heartbeat received
 *       401:
 *         description: Unauthorized
 */
router.post("/heartbeat", verifyToken, heartbeat);

/**
 * @swagger
 * /session/end:
 *   post:
 *     summary: End a user session
 *     description: Ends the user's active session (logout or close app).
 *     tags: [UserSession]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session ended successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/end", verifyToken, endSession);


export default router;
