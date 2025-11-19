import  express  from "express";
import {chatController }from "../controllers/chatController"

const chatRouter = express.Router();

chatRouter.post('/',chatController);

export default chatRouter