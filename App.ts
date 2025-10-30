import express from 'express';
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
const app = express()


//database connection
const connection = async () => {
    try {
        await mongoose.connect(process.env.mongo_uri!);
        console.log("Mongoose connected")
    }
    catch (err) {
        console.log(err)
    }
}


//middleware
app.use("/", (req, res) => {
    res.send("HELLO ")
})

//routing
app.use


//listening 
app.listen(4000, () => {
    connection()
    console.log(`http://localhost:4000`)
})