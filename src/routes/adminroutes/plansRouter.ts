import { Router } from 'express';
import { addplan } from '../../adminController/plansController';
import { showplan } from '../../adminController/plansController';
import { updateplan } from '../../adminController/plansController';
import { deleteplan } from '../../adminController/plansController';
import { verifyAdmin } from '../../middlewares/verifyAdmin';
export const plansRouter = Router();

plansRouter.post('/addplans', verifyAdmin, addplan);
plansRouter.get('/showplans', verifyAdmin, showplan);
plansRouter.put('/updateplans/:id', verifyAdmin, updateplan);
plansRouter.delete('/deleteplans/:id', verifyAdmin, deleteplan);
