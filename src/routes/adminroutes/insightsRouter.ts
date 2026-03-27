import express from "express";
import { getUserDevices } from "../../admincontroller/insightsController";
import { verifyToken } from "../../middlewares/verifyToken";

export  const insightsRouter = express.Router()

insightsRouter.get('/device' , getUserDevices)