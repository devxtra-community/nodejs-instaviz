import { Router } from 'express'
import { fileParsing } from '../controllers/uploadController.ts'
import { tokenCheck } from '../middlewares/tokenCheck.ts';

const uploadRouter = Router()
// uploadRouter.use('/fileupload',tokenCheck)
uploadRouter.post("/fileupload",tokenCheck, fileParsing);

export default uploadRouter;