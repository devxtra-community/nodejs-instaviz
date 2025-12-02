import express from "express";
import * as controller from "../controllers/sessionController";

const sessionRouter = express.Router();

// sessionRouter.use(tokenCheck);

sessionRouter.post("/", controller.createSession);
sessionRouter.get("/", controller.listSessions);
sessionRouter.get("/:id", controller.getSession);
sessionRouter.patch("/:id", controller.updateSession);
sessionRouter.post("/:id/message", controller.appendMessage);
sessionRouter.delete("/:id", controller.deleteSession);

export default sessionRouter;
