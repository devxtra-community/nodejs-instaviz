import { Router } from 'express'
import { fileupload } from '../controller/uploadController.ts'

const uploadRouter = Router()
uploadRouter.get("/fileupload", fileupload);

export default uploadRouter;