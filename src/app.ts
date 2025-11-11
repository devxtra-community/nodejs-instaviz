import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import cors from 'cors';
import uploadRouter from './routes/uploadRouter.ts';
import paymentRouter from './routes/paymentRoutes.ts';
import { raw } from 'body-parser';

dotenv.config();
const app = express();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri!);
    console.log(" MongoDB Connected successfully");
  } catch (err) {
    console.error(" MongoDB Error occured:", err);
  }
};

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use((req, res, next) => {
  if (req.originalUrl === "/payment/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Routes
app.use("/upload", uploadRouter);
app.use("/user", uploadRouter);
app.use("/payment", paymentRouter);

app.listen(process.env.PORT, () => {
  connectDB();
  console.log(` Server running on : http://localhost:${process.env.PORT}`);
});
