import { Router } from "express";
import { getUserProfile } from "../auth/auth.ts";
import { changePassword, userImageUpdate } from "../controllers/userController.ts";
import { verifyToken } from "../middlewares/verifyToken.ts";
const userRouter = Router();

userRouter.get("/:userId", verifyToken, getUserProfile);
userRouter.put("/upload", userImageUpdate);
userRouter.post("/newpassword", changePassword);

export default userRouter;
