import { Router } from 'express';
import { uploadStats } from '../../adminController/activityController/uploadStats';
import { uploadSuccess } from '../../adminController/activityController/uploadSuccess';
import { peakHours } from '../../adminController/activityController/peakHour';
import { verifyAdmin } from '../../middlewares/verifyAdmin';
import { getWeeklyUploads } from '../../adminController/activityController/weeklyUpload';
import dataModel from '../../model/dataModel';

export const activityRouter = Router();
activityRouter.get('/uploadstats', verifyAdmin, uploadStats);
activityRouter.get('/uploadsuccess', verifyAdmin, uploadSuccess);
activityRouter.get('/peakhours', verifyAdmin, peakHours);
activityRouter.get('/weeklyuploads', getWeeklyUploads)
activityRouter.get("/debug-created", async (req, res) => {
  const docs = await dataModel.find({}, { createdAt: 1, status: 1 }).lean();
  res.json(docs);
});
activityRouter.get("/debug-types", async (req, res) => {
  const docs = await dataModel.find().lean();

  const result = docs.map(doc => ({
    id: doc._id,
    createdAt: doc.createdAt,
    type: typeof doc.createdAt
  }));

  res.json(result);
});

