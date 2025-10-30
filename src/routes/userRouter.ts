import { Router } from "express";
import { loginCheck } from "../controller/UserController.ts";

const userRouter = Router();
userRouter.get('/login', loginCheck);

export default userRouter;