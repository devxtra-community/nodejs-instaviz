import express from 'express';
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import cors from 'cors';
import passport from './config/passport.ts';
import cookieParser from "cookie-parser";
import googleRouter from './routes/authRoutes.ts';
import uploadRouter from './routes/uploadRouter.ts'
import userRouter from './routes/userRouter.ts';
import paymentRouter from './routes/paymentRoutes.js';
import { adminrouter } from './routes/adminroutes/userRouter.ts';
import { insightsRouter } from './routes/adminroutes/insightsRouter.ts';

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use(cookieParser())


//database connection
const connection = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri!);
    console.log("Mongoose connected");
  }
  catch (err) {
    console.log(err)
  }
}

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use("/payment/webhook", express.raw({ type: "application/json" }));

//middleware
app.use("/upload", uploadRouter)
app.use("/user", userRouter)
app.use("/auth", googleRouter)
app.use("/payment",paymentRouter)

// admin routes
app.use("/admin/dashboard",adminrouter)
app.use('/admin/dashboard',insightsRouter)

//routing
// app.use

//listening 
app.listen(process.env.PORT,() => {
  connection();
  console.log(` Server running on http://localhost:${process.env.PORT}`);
});