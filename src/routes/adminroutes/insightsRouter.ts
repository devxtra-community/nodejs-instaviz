import express from "express";
import { getUserDevices } from "../../admincontroller/insightsController";
import { verifyToken } from "../../middleware/verifytoken";

export  const insightsRouter = express.Router()

insightsRouter.get('/device' , verifyToken , getUserDevices)