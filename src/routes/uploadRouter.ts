import { Router } from 'express';
import upload from '../utils/multerUpload.ts';
import { fileParsing } from '../controllers/uploadController.ts';
import { tokenCheck } from '../middlewares/tokenCheck.ts';
import { verifyToken } from '../middlewares/verifyToken.ts';

const uploadRouter = Router();
uploadRouter.use('/fileupload',verifyToken,tokenCheck)
uploadRouter.post('/fileupload', upload.single('file'), fileParsing);

export default uploadRouter;
