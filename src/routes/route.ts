import { Router } from 'express'
import { fileupload } from '../controller/UserController.js'

const uploadRouter = Router()
uploadRouter.post("/", fileupload);

export default uploadRouter;