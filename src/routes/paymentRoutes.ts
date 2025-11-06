import express from "express";
import { createCheckoutSession, handleWebhook } from "../controllers/paymentController.js";

const router = express.Router();

// Create Checkout Session
router.post("/create-checkout-session", createCheckoutSession);

// Stripe Webhook
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

export default router;  
