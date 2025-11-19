import { Request, Response } from 'express';
import adminModel from '../../model/admin/adminModel';
import { hashToken } from '../../utils/hashTokens';
import refreshModel from '../../model/refreshtoken';

export const adminLogout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.adminRefreshToken;

    if (!refreshToken) {
      return res.status(200).json({ success: true, message: 'Admin already logged out' });
    }

    const hashed = hashToken(refreshToken);

    // Remove hashed refresh token from DB
    await refreshModel.deleteOne({ tokenhash: hashed });

    // Remove refreshToken cookie
    res.clearCookie('adminRefreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });

    return res.status(200).json({ success: true, message: 'Admin logged out successfully' });
  } catch (err) {
    console.log('Admin logout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
