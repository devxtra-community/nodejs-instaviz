import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { startSession, heartbeat, endSession } from "../adminController/activitytrackerController";

export const sessionRouter = express.Router();



sessionRouter.post("/start", verifyToken, startSession);
sessionRouter.post("/heartbeat", verifyToken, heartbeat);
sessionRouter.post("/end", verifyToken, endSession);

export default sessionRouter;
