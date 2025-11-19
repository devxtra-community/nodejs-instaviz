import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import refreshModel from '../model/refreshtoken';

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token Provided' });
    }

    const token = authHeader.split(' ')[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = decoded;
      console.log('token', decoded);

      const refreshRecord = await refreshModel.findOne({ userId: decoded.id });

      if (!refreshRecord) {
        return res.status(401).json({
          message: 'Session expired. Please login again',
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired admin access token' });
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
