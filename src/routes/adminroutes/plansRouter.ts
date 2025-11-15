import { Router } from "express";
import { addplan } from "../../adminController/plansController";
import { showplan } from "../../adminController/plansController";
import { updateplan } from "../../adminController/plansController";
import { deleteplan } from "../../adminController/plansController";
export const plansRouter = Router()

plansRouter.post("/addplans",addplan)
plansRouter.get("/showplans",showplan)
plansRouter.put("/updateplans/:id",updateplan)
plansRouter.delete("/deleteplans/:id",deleteplan)