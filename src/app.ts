
import path from 'path';
import mongoose from 'mongoose'
import morgan from 'morgan';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import passport from './config/passport.ts';
import cookieParser from "cookie-parser";
import authRouter from './routes/authRoutes.ts';
import uploadRouter from './routes/uploadRouter.ts'
import userRouter from './routes/userRouter.ts';
import paymentRouter from './routes/paymentRoutes.js';
import { insightsRouter } from './routes/adminroutes/insightsRouter.ts';
import {tokenrouter} from  './routes/adminroutes/tokenRouter.ts'
import {plansRouter} from  './routes/adminroutes/plansRouter.ts'

import sessionRoutes from "./routes/sessionRouter.ts";

import { fileSizeCheck } from './middlewares/fileSizeCheck.ts';
import { activityRouter } from './routes/adminroutes/activityRouter.ts';
import adminAuthRouter from './routes/adminroutes/adminAuthRouter.ts';
import {adminUserRouter} from "./routes/adminroutes/userRouter.ts"


const app = express();
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());
app.use(morgan("dev"));

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
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use('/payment/webhook', express.raw({ type: 'application/json' }));


app.use("/session", sessionRoutes);

//middleware user routs

app.use("/upload", uploadRouter)
app.use("/user", userRouter)
app.use("/auth", authRouter)
app.use("/payment", paymentRouter)
app.use("/payment",paymentRouter)

//admin routes
app.use('/admin',adminAuthRouter)
app.use('/admin',insightsRouter)
app.use('/admin',activityRouter)


app.use('/admin',adminUserRouter)
app.use('/admin',insightsRouter)
app.use('/admin',tokenrouter)
app.use("/admin",plansRouter)

//file upload check
app.use(fileSizeCheck);

//listening
app.listen(process.env.PORT, async() => {
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

