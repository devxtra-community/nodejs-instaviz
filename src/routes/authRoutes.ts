import passport from "passport";
import { Router } from "express";
import { googleCallback } from "../controller/auth/auth.ts";

const googleRouter = Router();

googleRouter.get('/google', passport.authenticate("google", { scope: ["Profile", "email"] }));
googleRouter.get('/google/callback', passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5000/auth/google" }), googleCallback);

export default googleRouter;