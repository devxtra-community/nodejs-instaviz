import { Request, Response } from 'express';
import refreshModel from '../../model/refreshtoken';
import jwt from 'jsonwebtoken';
import { hashToken } from '../../utils/hashTokens';

export const refreshAdminAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.adminRefreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No admin refresh token' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const hashed = hashToken(refreshToken);
    const saved = await refreshModel.findOne({ tokenhash: hashed });
    if (!saved) {
      return res
        .status(401)
        .json({ success: false, message: 'Refresh token not found or revoked' });
    }

    if (saved.expiresAt < new Date()) {
      await saved.deleteOne();
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
      });
    }

    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        role:"admin"
      },
      process.env.JWT_SECRET!,
      { expiresIn: '10s' },
    );

    return res.status(200).json({
      success: true,
      newAccessToken,
    });
    
  } catch (err) {
    console.log('Admin refresh failed:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
