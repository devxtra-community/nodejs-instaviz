import express from "express";
import { createCheckoutSession, handleWebhook } from "../controllers/paymentController.ts";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment and Stripe operations
 */

/**
 * @swagger
 * /payment/create-checkout-session:
 *   post:
 *     summary: Create Stripe checkout session
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               planId: "basic"
 *               price: 299
 *     responses:
 *       200:
 *         description: Checkout session created
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post("/create-checkout-session", createCheckoutSession);

/**
 * @swagger
 * /payment/webhook:
 *   post:
 *     summary: Stripe webhook endpoint (RAW body)
 *     description: Stripe uses this to notify your server about events. **No auth is required.**
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received successfully
 *       400:
 *         description: Invalid signature or error
 */
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

export default router;
