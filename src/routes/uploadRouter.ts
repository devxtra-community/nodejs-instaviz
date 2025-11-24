import { Router } from "express";
import upload from "../utils/multerUpload";
import { fileParsing } from "../controllers/uploadController";
import { tokenCheck } from "../middlewares/tokenCheck";
import { deviceLogger } from "../utils/deviceLogger";

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
uploadRouter.use((req, res, next) => {
  req.uploadStatus = "success";
  next();
});

uploadRouter.post(
  "/fileupload",
  deviceLogger,
  tokenCheck,
  upload.single("file"),
  (req, res, next) => {
    res.locals.device = req.device;
    res.locals.uploadStatus = req.uploadStatus;
    next();
  },
  fileParsing,
);

export default uploadRouter;
