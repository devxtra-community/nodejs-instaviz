import { Router } from "express";
import { loginCheck,register } from "../controller/UserController.ts";


const userRouter = Router();
userRouter.post('/login', loginCheck);
userRouter.post("/register",register)

export default userRouter;