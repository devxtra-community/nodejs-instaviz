import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { startSession, heartbeat, endSession } from "../adminController/sessionController";

const router = express.Router();

router.post("/start", verifyToken, startSession);
router.post("/heartbeat", verifyToken, heartbeat);
router.post("/end", verifyToken, endSession);

export default router;
