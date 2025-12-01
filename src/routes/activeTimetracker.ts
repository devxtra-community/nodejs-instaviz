import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  startSession,
  heartbeat,
  endSession
} from "../adminController/activitytrackerController";

export const activeTimetracker = express.Router();



activeTimetracker.post("/start", verifyToken, startSession);
activeTimetracker.post("/heartbeat", verifyToken, heartbeat);
activeTimetracker.post("/end", verifyToken, endSession);

export default activeTimetracker;