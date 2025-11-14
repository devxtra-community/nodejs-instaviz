import { Router } from "express";
import { uploadStats } from "../../adminController/activityController/uploadStats";
import { uploadSuccess } from "../../adminController/activityController/uploadSuccess";
import { peakHours } from "../../adminController/activityController/peakHour";

export const activityRouter = Router()
activityRouter.get('/uploadstats' , uploadStats)
activityRouter.get('/uploadsuccess' , uploadSuccess)
activityRouter.get('/peakhours',peakHours)