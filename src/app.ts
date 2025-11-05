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

//routing
// app.use


//listening 
app.listen(4000, () => {
    connection()
    console.log(`http://localhost:4000`)
})