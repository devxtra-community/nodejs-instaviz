import { Router } from "express";
import { register,loginCheck,verifyOtp } from "../controller/auth/auth.ts";
import { verifyToken } from "../middleware/verifytoken.ts";
import { testpro } from "../controller/auth/auth.ts";


const userRouter = Router();
userRouter.post('/login', loginCheck);
userRouter.post("/register",register);
userRouter.post("/verifyOtp",verifyOtp);
userRouter.get("/test",verifyToken,testpro)


export default userRouter;