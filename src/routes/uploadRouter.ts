import { Router } from 'express'
import upload from '../utils/multerUpload.ts'
import { fileParsing } from '../controllers/uploadController.ts'


import { deviceLogger } from '../utils/deviceLogger.ts';

const uploadRouter = Router();

uploadRouter.post(
  "/fileupload",
  deviceLogger,
  upload.single("file"),
  fileParsing
);

export default uploadRouter
