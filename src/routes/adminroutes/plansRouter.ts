import { Router } from 'express';
import { addplan } from '../../adminController/plansController';
import { showplan } from '../../adminController/plansController';
import { updateplan } from '../../adminController/plansController';
import { deleteplan } from '../../adminController/plansController';
import { verifyAdmin } from '../../middlewares/verifyAdmin';
export const plansRouter = Router();

plansRouter.post('/plans', addplan);
plansRouter.get('/plans',  showplan);
plansRouter.put('/plans/:id', verifyAdmin, updateplan);
plansRouter.delete('/plans/:id', verifyAdmin, deleteplan);
