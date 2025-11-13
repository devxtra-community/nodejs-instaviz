import { Router } from "express";
import { register, loginCheck, verifyOtp, getUserProfile } from "../controller/auth/auth.ts";
import { verifyToken } from "../middleware/verifytoken.ts";
import { testpro } from "../controller/auth/auth.ts";
import { refreshAccessToken } from "../services/jwtServices.ts";
import { userImageUpdate } from "../controllers/UserController.ts";
import { deviceLogger } from "../middleware/deviceLogger.ts";

const userRouter = Router();
userRouter.post('/login',loginCheck , deviceLogger);
userRouter.post("/register",register);
userRouter.post("/verifyOtp",verifyOtp);
userRouter.get("/test",verifyToken,testpro)
userRouter.post("/newRefreshToken",refreshAccessToken)


// dummy route dont take it serious
userRouter.get('/:userId', getUserProfile)

// user image uploader router
userRouter.put('/upload', userImageUpdate)

export default userRouter;