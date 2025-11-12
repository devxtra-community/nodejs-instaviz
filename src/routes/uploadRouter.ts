import { Router } from 'express'
import upload from '../middleware/multerUpload.ts';
import { fileupload } from '../controllers/uploadController.ts'
import { deviceLogger } from '../middleware/deviceLogger.ts';

const uploadRouter = Router()
uploadRouter.post("/fileupload", upload.single('file'), deviceLogger , fileupload);

export default uploadRouter;