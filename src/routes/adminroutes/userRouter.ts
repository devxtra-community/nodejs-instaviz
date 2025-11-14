import { Router } from "express";
import { getAllusers } from "../../adminController/userController";

export const adminRouter = Router()
adminRouter.get("/usercount",getAllusers)