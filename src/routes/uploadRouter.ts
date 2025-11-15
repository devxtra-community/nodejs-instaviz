import { Router } from 'express'
import upload from '../utils/multerUpload.ts';
import { fileParsing } from '../controllers/uploadController.ts'


import { deviceLogger } from '../utils/deviceLogger.ts';

const uploadRouter = Router()
// uploadRouter.use('/fileupload',tokenCheck)
uploadRouter.post("/fileupload", upload.single('file'), fileParsing);
uploadRouter.post("/fileupload", upload.single('file'), deviceLogger , fileParsing);

export default uploadRouter;