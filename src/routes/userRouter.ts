import { Router } from "express";
import { loginCheck } from "../controllers/UserController.js";

const userRouter = Router();
userRouter.get('/login', loginCheck);

export default userRouter;