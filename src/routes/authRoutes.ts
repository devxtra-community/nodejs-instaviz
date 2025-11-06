import passport from "passport";
import { Router } from "express";
import { googleCallback } from "../controller/auth/auth.ts";

const router = Router();

router.get('/google', passport.authenticate("google", { scope: ["Profile", "email"] }));
router.get('/google/callback', passport.authenticate("google", { session: false }), googleCallback);

export default router;