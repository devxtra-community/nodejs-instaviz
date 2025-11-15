import { NextFunction, Request, Response } from 'express';
import dataModel from '../model/dataModel';

export const tokenCheck = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('api in middleware');
    
    const userIp = req.ip;
    console.log(userIp);

    console.log(req.user)
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }
};
