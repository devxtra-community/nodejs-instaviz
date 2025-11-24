import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import adminModel from '../../model/admin/adminModel';

import { signJwt } from '../../services/jwtServices';
import refreshModel from '../../model/refreshtoken';
import { hashToken } from '../../utils/hashTokens';

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Admin not Found', success: false });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password is not Correct', success: false });
    }

    const accessToken = signJwt({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    const refreshToken = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      process.env.REFRESH_SECRET!,
      { expiresIn: '30d' },
    );

    const hashed = hashToken(refreshToken);

    await refreshModel.findOneAndUpdate(
      { userId: admin._id },
      {
        userId: admin._id,
        tokenhash: hashed,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { upsert: true },
    );

    res.cookie('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      accessToken,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });

    
  } catch (err) {
    console.error('Admin Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
