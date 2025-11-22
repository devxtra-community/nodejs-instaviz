import express from "express";
import { chatController } from "../controllers/chatController";
import { tokenCheck } from "../middlewares/tokenCheck";

const chatRouter = express.Router()

chatRouter.post("/",tokenCheck,chatController);

export default chatRouter;