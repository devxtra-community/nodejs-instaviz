import { Router } from 'express';
import upload from '../utils/multerUpload';
import { fileParsing } from '../controllers/uploadController';
import { tokenCheck } from '../middlewares/tokenCheck';

const uploadRouter = Router()
uploadRouter.post("/fileupload", upload.single('file'),tokenCheck, fileParsing);

export default uploadRouter;
