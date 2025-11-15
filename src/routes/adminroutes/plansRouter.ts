import { Router } from "express";
import { addplan } from "../../admincontroller/planscontroller";
import { showplan } from "../../admincontroller/planscontroller";
import { updateplan } from "../../admincontroller/planscontroller";
import { deleteplan } from "../../admincontroller/planscontroller";
export const plansRouter = Router()

plansRouter.post("/addplans",addplan)
plansRouter.get("/showplans",showplan)
plansRouter.put("/updateplans/:id",updateplan)
plansRouter.delete("/deleteplans/:id",deleteplan)