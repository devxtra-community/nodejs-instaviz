
import express from "express";
import { startSession, heartbeat } from "../adminController/sessionController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.post("/start", verifyToken, startSession);
router.post("/heartbeat", verifyToken, heartbeat);

export default router;