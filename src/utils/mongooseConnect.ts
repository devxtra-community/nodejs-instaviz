import mongoose from "mongoose"
export const connection = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri!);
    console.log("Mongoose connected");
  } catch (err) {
    console.log(err);
  }
};