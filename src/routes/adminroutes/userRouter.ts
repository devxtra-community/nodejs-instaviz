import { Router } from "express";

import { addGustuser } from "../../admincontroller/userController";
import { loggedusers } from "../../admincontroller/userController";
import { fetchAllgustusers } from "../../admincontroller/userController";
import { getNewUsersPerMonth } from "../../admincontroller/userController";
import { getAllusers } from "../../admincontroller/userController";

export const adminrouter = Router()


adminrouter.get("/loggedusers",loggedusers)
adminrouter.get("/gustusers",fetchAllgustusers)
adminrouter.get("/getallusers",getAllusers)
adminrouter.get("/newuserpermonth",getNewUsersPerMonth)








adminrouter.post("/addgustuser",addGustuser)

