import express from "express";
import { deviceUsage } from "../../admincontroller/insightsController";
import { verifyToken } from "../../middleware/verifytoken";

export  const insightsRouter = express.Router()

insightsRouter.get('/device' , deviceUsage)