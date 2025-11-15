import passport from "passport";
import { Router } from "express";
import { googleCallback, logout } from "../auth/auth.ts";

import { register, loginCheck, verifyOtp } from "../auth/auth.ts";
import { testpro } from "../auth/auth.ts";
import { refreshAccessToken } from "../services/jwtServices.ts";
import {deviceLogger} from '../utils/deviceLogger.ts'
import { verifyToken } from "../middlewares/verifyToken.ts";


const authRouter = Router();

// login authentication
authRouter.post('/login',loginCheck , deviceLogger);
authRouter.post("/register",register);
authRouter.post("/verifyOtp",verifyOtp);
authRouter.get("/test",verifyToken,testpro)
authRouter.post("/newRefreshToken",refreshAccessToken)
authRouter.post("/logout",logout)

// google authentication
authRouter.get('/google', passport.authenticate("google", { scope: ["Profile", "email"] }));
authRouter.get('/google/callback', passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5000/auth/google" }), googleCallback);

export default authRouter;