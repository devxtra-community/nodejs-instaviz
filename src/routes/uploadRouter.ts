import { Router } from "express";
import upload from "../utils/multerUpload.ts";
import { fileParsing } from "../controllers/uploadController.ts";
import { deviceLogger } from "../utils/deviceLogger.ts";
import { tokenCheck } from "../middlewares/tokenCheck.ts";

const uploadRouter = Router();

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
