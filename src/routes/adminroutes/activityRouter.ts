import { Router } from 'express';
import { uploadStats } from '../../adminController/activityController/uploadStats';
import { uploadSuccess } from '../../adminController/activityController/uploadSuccess';
import { peakHours } from '../../adminController/activityController/peakHour';
import { verifyAdmin } from '../../middlewares/verifyAdmin';

export const activityRouter = Router();
activityRouter.get('/uploadstats', verifyAdmin, uploadStats);
activityRouter.get('/uploadsuccess', verifyAdmin, uploadSuccess);
activityRouter.get('/peakhours', verifyAdmin, peakHours);
