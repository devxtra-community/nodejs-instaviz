import { adminLogin } from "../../adminController/auth/adminLogin";
import { Router } from "express";
import { adminRefresh } from "../../adminController/auth/adminRefresh";
import {adminLogout} from '../../adminController/auth/adminLogout'

const adminAuthRouter = Router();

adminAuthRouter.post("/login", adminLogin);

adminAuthRouter.post('/refresh',adminRefresh)

adminAuthRouter.post('/logout',adminLogout)

export default adminAuthRouter;
