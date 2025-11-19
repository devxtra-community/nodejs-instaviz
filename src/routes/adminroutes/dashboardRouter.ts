import { Router } from 'express';
import { dashboardStats } from '../../adminController/dashboardController/cards';
import { getUserDeviceStats } from '../../adminController/dashboardController/userDevice';
import { getUploadDeviceStats } from '../../adminController/dashboardController/userUploads';
import { verifyAdmin } from '../../middlewares/verifyAdmin';

export const dashboardRouter = Router();

dashboardRouter.get('/dashboard/userdevices', verifyAdmin, getUserDeviceStats);
dashboardRouter.get('/dashboard/useruploads', verifyAdmin, getUploadDeviceStats);
dashboardRouter.get('/dashboard', verifyAdmin, dashboardStats);
