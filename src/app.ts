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
import { adminrouter } from "./routes/adminroutes/userRouter.ts";
import { insightsRouter } from "./routes/adminroutes/insightsRouter.ts";
import { fileSizeCheck } from "./middlewares/fileSizeCheck.ts";
import chatRouter from "./routes/chatRouter.ts";

dotenv.config();
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());
app.use(morgan("dev"));
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
  limit: 220,
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
      const allowedOrigins = [
        process.env.CLIENT_URL,
        "http://localhost:5000"
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(limiter);

app.use("/payment/webhook", express.raw({ type: "application/json" }));

//middleware
app.use("/upload", uploadRouter);
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/payment", paymentRouter);

app.use("/chat", chatRouter);

// admin routes
app.use("/admin/dashboard", adminrouter);
app.use("/admin/dashboard", insightsRouter);

//file upload check
app.use(fileSizeCheck);

//listening
app.listen(process.env.PORT, async () => {
  await connection();
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
