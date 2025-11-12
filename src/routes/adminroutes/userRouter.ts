import { Router } from "express";
import { getAllusers } from "../../adminController/userController";

export const adminrouter = Router()
adminrouter.get("/usercount",getAllusers)