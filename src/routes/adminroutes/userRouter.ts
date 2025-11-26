import { Router } from "express";
import { loggedusers, suspendUser } from "../../adminController/userController"
import { fetchAllgustusers } from "../../adminController/userController"
import { getNewUsersPerMonth } from "../../adminController/userController"
import { getAllusers } from "../../adminController/userController"
import { alluserspage } from "../../adminController/userController"
import { GetSingleuser } from "../../adminController/userController"
import { singleUsertoken } from "../../adminController/userController";
import { addGustuser } from "../../adminController/userController";
import { updateUserstatus } from "../../adminController/userController";
import { hourlyActiveUserCount } from "../../adminController/userController";
import { getUserDailyActiveTime } from "../../adminController/userController";
import { getsingleUserDailyActiveTime } from "../../adminController/userController";
import { verifyAdmin } from "../../middlewares/verifyAdmin";


export  const adminUserRouter = Router()

adminUserRouter.get('/loggedusers', loggedusers);
adminUserRouter.get('/gustusers', fetchAllgustusers);
adminUserRouter.get('/getallusers', getAllusers);
adminUserRouter.get('/newuserpermonth',  getNewUsersPerMonth);

adminUserRouter.get("/alluserspage",alluserspage)
adminUserRouter.get("/singleuser/:id",GetSingleuser)
adminUserRouter.get("/singltoken/:id",singleUsertoken)

adminUserRouter.post("/addgustuser",verifyAdmin,addGustuser)
adminUserRouter.put("/status/:id",updateUserstatus)
adminUserRouter.get("/activetime",hourlyActiveUserCount)
adminUserRouter.get("/user-daily-active/:id", getUserDailyActiveTime);
adminUserRouter.get("/singleUsertime/:id", getsingleUserDailyActiveTime);
adminUserRouter.put("/suspend/:id",suspendUser)



