import { Router } from "express";
import { getUserProfile } from "../controllers/userController.ts";
import { changePassword, userImageUpdate } from "../controllers/userController.ts";
import { verifyToken } from "../middlewares/verifyToken.ts";
const userRouter = Router();

// dummy route for single user
userRouter.get("/:userId", verifyToken, getUserProfile);
// user image uploader router
userRouter.put("/upload",verifyToken, userImageUpdate);
// new password
userRouter.post("/newpassword",verifyToken, changePassword);

export default userRouter;
