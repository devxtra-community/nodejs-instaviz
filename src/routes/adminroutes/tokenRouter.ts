import { Router } from "express";
import { getAlltokencont } from "../../admincontroller/tokenController";
import { getAlltokenusage } from "../../admincontroller/tokenController";
export const tokenrouter  = Router()

tokenrouter.get("/alltokens",getAlltokencont)
tokenrouter.get("/alltokenusage",getAlltokenusage)
