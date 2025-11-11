import { Router } from 'express'
import upload from '../middleware/multerUpload.ts';
import { fileupload } from '../controllers/uploadController.ts'

const uploadRouter = Router()
uploadRouter.post("/fileupload", upload.single('file'), fileupload);

export default uploadRouter;