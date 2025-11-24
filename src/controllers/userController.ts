import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import userModel from '../model/user';
import { uploadimageToSupabase } from '../utils/imageUploader';
import mongoose from 'mongoose';

export const userImageUpdate = async (req: Request, res: Response) => {
  try {
    const { userId, image } = req.body;
    console.log('image router reached');

    if (!userId || !image) {
      return res.status(400).json({ message: 'image and userId are required.' });
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
      { new: true, upsert: false },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(' User image updated:', updatedUser.picture);

    return res.status(200).json({
      message: 'Profile image updated successfully',
      imageUrl: updatedUser.picture,
      user: updatedUser,
    });
  } catch (err) {
    console.error(' Error in userImageUpdate:', err);
    res.status(500).json({ message: 'Internal server error.', err });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    console.log(req.body);

    if (!userId || !oldPassword || !newPassword) {
      return res.status(403).json({ message: 'All fields required..' });
    }
    const user = await userModel.findOne({ _id: userId });
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: 'User is not found..' });
    }

    if (user.googleId) {
      return res.status(200).json({
        message: 'This account uses Google Login. Password cannot be changed.',
      });
    }

    const isCorrect = await bcrypt.compare(oldPassword, user.password!);

    if (!isCorrect) {
      return res.status(400).json({ message: 'Password is not matching.!' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
};


export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const user = await userModel.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined },
        { googleId: userId },
      ].filter(Boolean),
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", err });
  }
};
