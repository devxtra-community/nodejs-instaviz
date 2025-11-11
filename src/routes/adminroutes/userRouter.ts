import { Router } from "express";
import { getAllusers } from "../../admincontroller/userController";

export const adminrouter = Router()
adminrouter.get("/usercount",getAllusers)