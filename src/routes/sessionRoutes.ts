import express from "express";
import { heartbeat } from "../adminController/sessionController"

const router = express.Router();

router.post("/heartbeat", heartbeat);

export default router;
