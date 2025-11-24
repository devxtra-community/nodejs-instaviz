import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import passport from "./config/passport.ts";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

// Routers
import authRouter from "./routes/authRoutes.ts";
import uploadRouter from "./routes/uploadRouter.ts";
import userRouter from "./routes/userRouter.ts";
import paymentRouter from "./routes/paymentRoutes.js";
import sessionRoutes from "./routes/sessionRouter.ts";

// Admin routes

import { insightsRouter } from "./routes/adminroutes/insightsRouter.ts";
import { tokenrouter } from "./routes/adminroutes/tokenRouter.ts";
import { plansRouter } from "./routes/adminroutes/plansRouter.ts";
import { activityRouter } from "./routes/adminroutes/activityRouter.ts";
import adminAuthRouter from "./routes/adminroutes/adminAuthRouter.ts";
import { adminUserRouter } from "./routes/adminroutes/userRouter.ts";

// Middlewares
import { fileSizeCheck } from "./middlewares/fileSizeCheck.ts";

dotenv.config();

const app = express();

/* -------------------- Middleware -------------------- */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());
app.use(morgan("dev"));

/* -------------------- Swagger Setup -------------------- */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "InstaviZ API Documentation",
      version: "1.0.0",
      description: "API documentation",
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
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/**/*.{ts,js}"],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* -------------------- Rate Limiter -------------------- */
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 220,
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply limiter for NON-admin routes
app.use((req, res, next) => {
  if (req.path.startsWith("/admin")) return next();
  return limiter(req, res, next);
});

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.CLIENT_URL,
        `http://localhost:${process.env.PORT}`,
      ];

      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* -------------------- Stripe Raw Webhook -------------------- */
app.use("/payment/webhook", express.raw({ type: "application/json" }));

/* -------------------- Routes -------------------- */

// main routes
app.use("/auth", authRouter);
app.use("/upload", uploadRouter);
app.use("/user", userRouter);
app.use("/payment", paymentRouter);
app.use("/session", sessionRoutes);

// admin routes


app.use("/admin", adminUserRouter);
app.use("/admin", insightsRouter);
app.use("/admin", tokenrouter);
app.use("/admin", plansRouter);
app.use("/admin", activityRouter);
app.use("/admin", adminAuthRouter);

// file size check
app.use(fileSizeCheck);

/* -------------------- Health Check -------------------- */
app.get("/health", (req: Request, res: Response) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.json({
    status: "ok",
    db: dbStatus,
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri!);
    console.log("MongoDB connected");
  } catch (err) {
    console.log(err);
  }
};


app.listen(process.env.PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});
