import express from 'express';
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import passport from './config/passport.ts';
import router from './routes/authRoutes.ts';
import uploadRouter from './routes/uploadRouter.ts'
import userRouter from './routes/userRouter.ts';

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

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
//middleware
app.use("/upload", uploadRouter)
app.use("/user", userRouter)
app.use('/auth', router)
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import uploadRouter from './routes/uploadRouter.ts';
import paymentRouter from './routes/paymentRoutes.ts';

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

app.listen(process.env.PORT,() => {
  connectDB();
  console.log(` Server running on : http://localhost:${process.env.PORT}`);
});
