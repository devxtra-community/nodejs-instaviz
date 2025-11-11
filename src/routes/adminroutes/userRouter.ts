import { Router } from "express";
import { getAllusers } from "../../adminccontroller/usercontroller";

export const adminrouter = Router()
adminrouter.get("/usercount",getAllusers)