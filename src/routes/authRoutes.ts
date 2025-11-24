import passport from "passport";
import { Router } from "express";
import { register, loginCheck,  } from "../auth/auth.ts";
import { verifyOtp,resendOtp } from "../auth/otp.ts";
import { refreshAccessToken } from "../services/jwtServices.ts";
import {deviceLogger} from '../utils/deviceLogger.ts'
import { verifyToken } from "../middlewares/verifyToken.ts";
import { forgotPassword } from "../auth/password.ts";
import { verifyForgotOtp } from "../auth/otp.ts";
import { resetPassword } from "../auth/password.ts";
import { getAllSessions } from "../auth/auth.ts";
import { logoutDevice } from "../auth/auth.ts";



const authRouter = Router();

// login authentication
authRouter.post('/login',loginCheck , deviceLogger);
authRouter.post("/register",register);
authRouter.post("/verifyOtp",verifyOtp);
authRouter.post("/resendOtp",resendOtp)
authRouter.post("/newRefreshToken",refreshAccessToken)
authRouter.post("/forgotPassword",forgotPassword)
authRouter.post("/verifyForgotOtp",verifyForgotOtp)
authRouter.post("/resetPassword",resetPassword)
authRouter.get("/getAllSessions",verifyToken,getAllSessions)
authRouter.post("/logoutDevice",verifyToken,logoutDevice)

// google authentication
authRouter.get('/google', passport.authenticate("google", { scope: ["Profile", "email"] }));


export default authRouter;