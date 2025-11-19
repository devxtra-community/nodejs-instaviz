import { Router } from 'express';

import { verifyAdmin } from '../../middlewares/verifyAdmin';

import { loggedusers } from '../../adminController/userController';
import { fetchAllgustusers } from '../../adminController/userController';
import { getNewUsersPerMonth } from '../../adminController/userController';
import { getAllusers } from '../../adminController/userController';
import { alluserspage } from '../../adminController/userController';
import { GetSingleuser } from '../../adminController/userController';
import { singleUsertoken } from '../../adminController/userController';
import { addGustuser } from '../../adminController/userController';

export const adminUserRouter = Router();

adminUserRouter.get('/loggedusers', verifyAdmin, loggedusers);
adminUserRouter.get('/gustusers', fetchAllgustusers);
adminUserRouter.get('/getallusers', verifyAdmin, getAllusers);
adminUserRouter.get('/newuserpermonth', verifyAdmin, getNewUsersPerMonth);

adminUserRouter.get('/alluserspage', verifyAdmin, alluserspage);
adminUserRouter.get('/singleuser/:id', verifyAdmin, GetSingleuser);
adminUserRouter.get('/singltoken/:id', verifyAdmin, singleUsertoken);

adminUserRouter.post('/addgustuser', verifyAdmin, addGustuser);
