import { NextFunction, Request, Response } from 'express';
import dataModel from '../model/dataModel';
import { verifyToken } from './verifyToken';
export const tokenCheck = async (error: any, req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('api in middleware');
    const userIp = req.ip;
    console.log(userIp);
    // next();
    return;
  } catch (err) {
    console.log(err);
  }
};
