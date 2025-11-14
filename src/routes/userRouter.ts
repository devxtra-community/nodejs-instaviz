import { Router } from "express";
import { userImageUpdate } from "../controllers/userController.ts";
import { getUserProfile } from "../auth/auth.ts";

const userRouter = Router();

// dummy route for single user
userRouter.get("/:userId", getUserProfile);

// user image uploader router
userRouter.put("/upload", userImageUpdate);

export default userRouter;

