import { Router } from "express";
import { register, loginCheck, verifyOtp, getAllUser } from "../controller/auth/auth.ts";


const userRouter = Router();
userRouter.post('/login', loginCheck);
userRouter.post("/register", register);
userRouter.post("/verifyOtp", verifyOtp);

// dummy route dont take it serious
userRouter.get('/alluser', getAllUser)

export default userRouter;