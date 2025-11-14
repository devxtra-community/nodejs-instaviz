import { Request, Response } from "express";
import userModel from "../model/user";
import { uploadimageToSupabase } from "../utils/imageUploader";
import mongoose from "mongoose";

export const userImageUpdate = async (req: Request, res: Response) => {
  try {
    const { userId, image } = req.body;

    if (!userId || !image) {
      return res.status(400).json({ message: "image and userId are required." });
    }

    const imageUrl = await uploadimageToSupabase(userId, image);

    let query: any;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query = { _id: userId };
    } else {
      query = { googleId: userId };
    }

    const updatedUser = await userModel.findOneAndUpdate(
      query,
      { picture: imageUrl },
      { new: true, upsert: false } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(" User image updated:", updatedUser.picture);

    return res.status(200).json({
      message: "Profile image updated successfully",
      imageUrl: updatedUser.picture,
      user: updatedUser,
    });
  } catch (err) {
    console.error(" Error in userImageUpdate:", err);
    res.status(500).json({ message: "Internal server error.", err });
  }
};
