// src/types/express.d
import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      isGuest?: boolean;
    }

    interface Request {
      user?: UserPayload;
      device?: 'mobile' | 'desktop'
      uploadStatus?: 'success' | 'failed'
    }
  }
}

export {};
