import express from "express";
import { chatController } from "../controllers/chatController";

const chatRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: AI chat / message handling
 */

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Send a message to the chat system
 *     description: Sends text or data to the chat controller and returns a generated response.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Hello, how are you?"
 *     responses:
 *       200:
 *         description: Chat response generated successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
chatRouter.post("/", chatController);

export default chatRouter;
