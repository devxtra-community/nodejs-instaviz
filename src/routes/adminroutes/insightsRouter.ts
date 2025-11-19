import express from 'express';
import { deviceUsage } from '../../adminController/insightController/Device';
import { featureStats } from '../../adminController/insightController/feature';
import { downloadReport } from '../../adminController/insightController/downloadreport';
import { featureUsage } from '../../utils/featureLogger';
import { analyticsData } from '../../adminController/insightController/analytics';
import { verifyAdmin } from '../../middlewares/verifyAdmin';

export const insightsRouter = express.Router();

insightsRouter.get('/device', verifyAdmin, deviceUsage);

insightsRouter.get('/downloads', verifyAdmin, featureUsage('download_report'), downloadReport);

insightsRouter.get('/analytics', verifyAdmin, featureUsage('user_analytics'), analyticsData);

insightsRouter.get('/featurestats', verifyAdmin, featureStats);
