import { Router } from "express";

import { addGustuser } from "../../admincontroller/usercontroller";
import { loggedusers } from "../../admincontroller/usercontroller";
import { fetchAllgustusers } from "../../admincontroller/usercontroller";
import { getNewUsersPerMonth } from "../../admincontroller/usercontroller";
import { getAllusers } from "../../admincontroller/usercontroller";

export const adminrouter = Router()


adminrouter.get("/loggedusers",loggedusers)
adminrouter.get("/gustusers",fetchAllgustusers)
adminrouter.get("/getallusers",getAllusers)
adminrouter.get("/newuserpermonth",getNewUsersPerMonth)








adminrouter.post("/addgustuser",addGustuser)

