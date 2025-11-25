import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import passport from "./config/passport.ts";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import authRouter from "./routes/authRoutes.ts";
import uploadRouter from "./routes/uploadRouter.ts";
import userRouter from "./routes/userRouter.ts";
import paymentRouter from "./routes/paymentRoutes.js";
import { insightsRouter } from "./routes/adminroutes/insightsRouter.ts";
import { fileSizeCheck } from "./middlewares/fileSizeCheck.ts";
import chatRouter from "./routes/chatRouter.ts";
import { tokenrouter } from "./routes/adminroutes/tokenRouter.ts";
import { plansRouter } from "./routes/adminroutes/plansRouter.ts";
import { dashboardRouter } from "./routes/adminroutes/dashboardRouter.ts";
import { activityRouter } from "./routes/adminroutes/activityRouter.ts";
import adminAuthRouter from "./routes/adminroutes/adminAuthRouter.ts";
import { adminUserRouter } from "./routes/adminroutes/userRouter.ts";
import router from "./routes/sessionRouter.ts";
import { corsMiddleware } from "./middlewares/corsMiddleware.ts"
import { swaggerSpec } from "./services/swaggerSpec.ts";
import { healthRouter } from "./routes/healthCheckRoute.ts"
import { connection } from "./utils/mongooseConnect.ts"
import { limiter } from './utils/rateLimiter.ts'

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(corsMiddleware);
app.use(limiter);
app.use("/payment/webhook", express.raw({ type: "application/json" }));

//middleware
app.use("/upload", fileSizeCheck, uploadRouter)
app.use("/user", userRouter)
app.use("/auth", authRouter)
app.use("/payment", paymentRouter)
app.use("/chat", chatRouter)
//admin routes
app.use("/admin", adminAuthRouter);
app.use("/admin", dashboardRouter);
app.use("/admin", insightsRouter);
app.use("/admin", activityRouter);
app.use("/admin", adminUserRouter);
app.use("/admin", tokenrouter);
app.use("/admin", plansRouter);
app.use("/session", router);

//listening
app.listen(process.env.PORT, async () => {
  await connection();
  console.log(` Server running on http://localhost:${process.env.PORT}`);
  app.get("/health", healthRouter);
});
