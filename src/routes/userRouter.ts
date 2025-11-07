import { Router } from "express";
import { register,loginCheck,verifyOtp } from "../controller/auth/auth.ts";


const userRouter = Router();
userRouter.post('/login', loginCheck);
userRouter.post("/register",register);
userRouter.post("/verifyOtp",verifyOtp);

export default userRouter;