import { Router } from "express";
import { uploadStats } from "../../adminController/activityController/uploadStats";
import { uploadSuccess } from "../../adminController/activityController/uploadSuccess";
import { peakHours } from "../../adminController/activityController/peakHour";
import {adminVerify} from '../../utils/adminVerify'

 export const activityRouter = Router()
activityRouter.get('/uploadstats' , adminVerify , uploadStats)
activityRouter.get('/uploadsuccess' , adminVerify , uploadSuccess)
activityRouter.get('/peakhours', adminVerify , peakHours)