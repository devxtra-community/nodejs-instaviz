import passport from "passport";
import { Router } from "express";
import { googleCallback, logoutUser } from "../controller/auth/auth.ts";

const authRouter = Router();

authRouter.get('/google', passport.authenticate("google", { scope: ["Profile", "email"] }));
authRouter.get('/google/callback', passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5000/auth/google" }), googleCallback);

authRouter.post('/logout',logoutUser)
export default authRouter;