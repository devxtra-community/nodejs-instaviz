import { adminLogin } from '../../adminController/auth/adminLogin';
import { Router } from 'express';
import { adminLogout } from '../../adminController/auth/adminLogout';
import { refreshAdminAccessToken } from '../../adminController/auth/adminAuthController';

const adminAuthRouter = Router();

adminAuthRouter.post('/login', adminLogin);

adminAuthRouter.post('/refresh', refreshAdminAccessToken);

adminAuthRouter.post('/logout', adminLogout);

export default adminAuthRouter;
