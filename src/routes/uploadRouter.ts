import { Router } from "express";
import upload from "../utils/multerUpload";
import { fileParsing } from "../controllers/uploadController";
import { tokenCheck } from "../middlewares/tokenCheck";

const uploadRouter = Router();
/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload and parsing
 */

/**
 * @swagger
 * /upload/fileupload:
 *   post:
 *     summary: Upload a file and parse it
 *     description: Uploads a file using Multer and parses its content.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []      # JWT required
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       200:
 *         description: File uploaded and parsed successfully
 *       400:
 *         description: Invalid or missing file
 *       401:
 *         description: Unauthorized — JWT missing or invalid
 *       500:
 *         description: Server error
 */
uploadRouter.post("/fileupload",tokenCheck, upload.single("file"), fileParsing);

export default uploadRouter;
