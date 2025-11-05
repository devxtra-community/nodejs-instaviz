import { Router } from "express";
import { register,loginCheck } from "../controller/auth/auth.ts";


const userRouter = Router();
userRouter.post('/login', loginCheck);
userRouter.post("/register",register)

export default userRouter;