import { Router } from "express";


import { loggedusers } from "../../adminController/userController"
import { fetchAllgustusers } from "../../adminController/userController"
import { getNewUsersPerMonth } from "../../adminController/userController"
import { getAllusers } from "../../adminController/userController"
import { alluserspage } from "../../adminController/userController"
import { GetSingleuser } from "../../adminController/userController"
import { singleUsertoken } from "../../adminController/userController";
import { addGustuser } from "../../adminController/userController";

export const adminrouter = Router()


adminrouter.get("/loggedusers",loggedusers)
adminrouter.get("/gustusers",fetchAllgustusers)
adminrouter.get("/getallusers",getAllusers)
adminrouter.get("/newuserpermonth",getNewUsersPerMonth)

adminrouter.get("/alluserspage",alluserspage)
adminrouter.get("/singleuser/:id",GetSingleuser)
adminrouter.get("/singltoken/:id",singleUsertoken)





adminrouter.post("/addgustuser",addGustuser)

