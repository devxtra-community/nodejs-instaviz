// src/types/express.d.ts
import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      isGuest?: boolean;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
