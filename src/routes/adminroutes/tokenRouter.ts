import { Router } from 'express';
import { getAlltokencont } from '../../adminController/tokenController';
import { getAlltokenusage } from '../../adminController/tokenController';
import { verifyAdmin } from '../../middlewares/verifyAdmin';
export const tokenrouter = Router();

tokenrouter.get('/alltokens', verifyAdmin, getAlltokencont);
tokenrouter.get('/alltokenusage', getAlltokenusage);
