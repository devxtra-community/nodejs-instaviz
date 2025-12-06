import express from "express";
import { createCheckoutSession } from "../controllers/paymentController";

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


export default router;
