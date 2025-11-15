import { adminLogin } from "../../adminController/auth/adminLogin";
import { Router } from "express";
import { adminRefresh } from "../../adminController/auth/adminRefresh";

const adminAuthRouter = Router();

adminAuthRouter.post("/login", adminLogin);

adminAuthRouter.post('/refresh',adminRefresh)

export default adminAuthRouter;
