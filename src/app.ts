import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import uploadRouter from './routes/uploadRouter.js';
import paymentRouter from './routes/paymentRoutes.js';

dotenv.config();
const app = express();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri!);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
  }
};

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST"],
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

app.listen(process.env.PORT,() => {
  connectDB();
  console.log(` Server running on http://localhost:${process.env.PORT}`);
});
