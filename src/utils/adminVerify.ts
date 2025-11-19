import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

export const adminVerify = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const token = req.cookies.adminAccessToken || 
    req.headers.authorization?.replace('Bearer ','')
    if(!token){
        return res.status(401).json({message : 'Not authorized' , success : false})
    }
    const decoded = jwt.verify(token , process.env.JWT_SECRET!) as any
    if(decoded.role !=='admin'){
      return res.status(403).json({
        message : 'Forbidden',
        success : false
      })
    }
    (req as any).admin = decoded
    next()
  } catch {
    return res.status(401).json({
      message: "Invalid token",
      success: false,
    });
  }
};
