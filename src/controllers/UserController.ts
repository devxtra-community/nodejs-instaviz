import { Request, Response } from "express";
import userModel from "../model/user";
import { uploadimageToSupabase } from "../utils/imageUploader";

export const userImageUpdate = async (req: Request, res: Response) => {
    console.log("hi")
    try {
        const { userId, image } = req.body;

        if (!userId || !image) {
            return res.status(401).json({ message: "image and userId is required.." })
        }

        const imageUrl = await uploadimageToSupabase(userId, image);

        await userModel.findByIdAndUpdate(userId, { picture: image })

        return res.status(200).json({ message: "image uploaded successfully..", imageUrl })
    }
    catch (err) {
        res.status(500).json({ message: "Internal server error..", err })
    }
}