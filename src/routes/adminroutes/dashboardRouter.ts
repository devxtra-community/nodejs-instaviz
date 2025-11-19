import { Router } from 'express';
import { adminVerify } from '../../utils/adminVerify';
import {dashboardStats} from '../../adminController/dashboardController/cards'
import { getUserDeviceStats } from '../../adminController/dashboardController/userDevice';
import { getUploadDeviceStats } from '../../adminController/dashboardController/userUploads';

export const dashboardRouter = Router();

dashboardRouter.get('/dashboard/userdevices', adminVerify, getUserDeviceStats);
dashboardRouter.get('/dashboard/useruploads', adminVerify, getUploadDeviceStats);
dashboardRouter.get('/dashboard',adminVerify,dashboardStats)
