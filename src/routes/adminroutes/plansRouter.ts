import { Router } from "express";
import { addplan } from "../../adminController/plansController";
import { showplan } from "../../adminController/plansController";
import { updateplan } from "../../adminController/plansController";
import { deleteplan } from "../../adminController/plansController";
export const plansRouter = Router()

plansRouter.post("/plans",addplan)
plansRouter.get("/plans",showplan)
plansRouter.put("/plans/:id",updateplan)
plansRouter.delete("/plans/:id",deleteplan)