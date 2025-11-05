import { Router } from 'express'
import { fileupload } from '../controllers/uploadController.js'

const uploadRouter = Router()
uploadRouter.get("/fileupload", fileupload);

export default uploadRouter;