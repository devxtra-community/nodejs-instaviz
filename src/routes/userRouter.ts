import { Router } from "express";
import { getUserProfile } from "../controllers/userController.ts";
import { changePassword, userImageUpdate, tokenCount } from "../controllers/userController.ts";
import { verifyToken } from "../middlewares/verifyToken.ts";

const userRouter = Router();
userRouter.get("/token", tokenCount)

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and profile operations
 */

/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     summary: Get user profile
 *     description: Fetches the profile details of a user using userId.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to fetch
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       404:
 *         description: User not found
 */
userRouter.get("/:userId", verifyToken, getUserProfile);

/**
 * @swagger
 * /user/upload:
 *   put:
 *     summary: Update user profile image
 *     description: Allows a user to upload or update their profile picture.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Profile image updated successfully
 *       400:
 *         description: Invalid image
 *       500:
 *         description: Server error
 */
userRouter.put("/upload", verifyToken, userImageUpdate);

/**
 * @swagger
 * /user/newpassword:
 *   post:
 *     summary: Change user password
 *     description: Allows a user to change their password.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: string
 *                 format: objectId
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Incorrect old password
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
userRouter.post("/newpassword", verifyToken, changePassword);


export default userRouter;
