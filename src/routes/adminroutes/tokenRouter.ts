
import { Router } from "express";
import { getAlltokencont } from "../../adminController/tokenController";
import { getAlltokenusage } from "../../adminController/tokenController";
export const tokenrouter  = Router()
//import { verifyAdmin } from '../../middlewares/verifyAdmin';
tokenrouter.get("/alltokens",getAlltokencont)
tokenrouter.get("/alltokenusage",getAlltokenusage)






 //tokenrouter.get('/alltokens', verifyAdmin, getAlltokencont);
 tokenrouter.get('/alltokenusage', getAlltokenusage);
