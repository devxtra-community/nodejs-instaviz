import { NextFunction, Request, Response } from "express";
import multer from "multer";

export const fileSizeCheck = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: `File size too large. Max is ${process.env.MAX_FILE_SIZE} bytes.`,
      });
    }
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};
