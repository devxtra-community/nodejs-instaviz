import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import passport from "./config/passport.ts";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import authRouter from "./routes/authRoutes.ts";
import uploadRouter from "./routes/uploadRouter.ts";
import userRouter from "./routes/userRouter.ts";
import paymentRouter from "./routes/paymentRoutes.js";

import { insightsRouter } from "./routes/adminroutes/insightsRouter.ts";
import { fileSizeCheck } from "./middlewares/fileSizeCheck.ts";
import chatRouter from "./routes/chatRouter.ts";

dotenv.config();
// import multer, { FileFilterCallback } from "multer";
// import path from "path";
// import { raw } from "body-parser";

import { tokenrouter } from "./routes/adminroutes/tokenRouter.ts";
import { plansRouter } from "./routes/adminroutes/plansRouter.ts";
import { dashboardRouter } from "./routes/adminroutes/dashboardRouter.ts";

import { activityRouter } from "./routes/adminroutes/activityRouter.ts";
import adminAuthRouter from "./routes/adminroutes/adminAuthRouter.ts";
import { adminUserRouter } from "./routes/adminroutes/userRouter.ts";
import router from "./routes/sessionRouter.ts";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());
app.use(morgan("dev")); //TODO: WHY ???. dev

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "InstaviZ Api documentation",
      version: "1.0.0",
      description: "API Documentation",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/**/*.{ts,js}"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// rate limiter per request
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

//database connection
const connection = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri!);
    console.log("Mongoose connected");
  } catch (err) {
    console.log(err);
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [process.env.CLIENT_URL, `http://localhost:${process.env.PORT}`];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/admin")) {
    return next();
  }
  return limiter(req, res, next);
});

app.use(limiter);

app.use("/payment/webhook", express.raw({ type: "application/json" }));

//middleware
app.use("/upload", uploadRouter, fileSizeCheck);
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/payment", paymentRouter);
app.use("/chat", chatRouter);
app.use("/upload", uploadRouter);
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/payment", paymentRouter);

//admin routes
app.use("/admin", adminAuthRouter);
app.use("/admin", dashboardRouter);
app.use("/admin", insightsRouter);
app.use("/admin", activityRouter);
app.use("/admin", adminUserRouter);
app.use("/admin", tokenrouter);
app.use("/admin", plansRouter);
app.use("/session", router);

//file upload check
app.use(fileSizeCheck);

//listening
app.listen(process.env.PORT, async () => {
  await connection();
  app.listen(process.env.PORT, () => {
    connection();
    console.log(` Server running on http://localhost:${process.env.PORT}`);
  });

  app.get("/health", async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.json({
      status: "ok",
      db: dbStatus,
      uptime: process.uptime(),
      time: new Date().toISOString(),
    });
  });
});
