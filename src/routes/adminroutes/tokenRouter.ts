import { Router } from "express";
import { getAlltokencont } from "../../adminController/tokenController";
import { getAlltokenusage } from "../../adminController/tokenController";
export const tokenrouter  = Router()

tokenrouter.get("/alltokens",getAlltokencont)
tokenrouter.get("/alltokenusage",getAlltokenusage)
