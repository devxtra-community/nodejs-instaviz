import express from "express";
import { createCheckoutSession, handleWebhook } from "../controllers/paymentController.ts";

const router = express.Router();
router.post("/create-checkout-session", createCheckoutSession);

// Seems duplicated
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

// payment/webhook app.use

export default router;  
