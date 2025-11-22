import { NextFunction, Request, Response } from 'express';
import Jwt from 'jsonwebtoken';
import userModel from '../model/user';
import chatModel from '../model/chat';
import chartModel from '../model/chart';
import guestModel from '../model/guest';

interface JwtPayload {
  id: string;
}

interface UserPayload {
  userId: string;
  isGuest?: boolean;
}

type AuthedRequest = Request & {
  user?: UserPayload;
};

export const tokenCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Checking whether user is logged in or guest');
    const authedReq = req as AuthedRequest;
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      const decoded = Jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;
      console.log(decoded)
      authedReq.user = {
        userId: decoded.id,
        isGuest: false,
      };
      console.log('Authenticated user from JWT:', decoded.id);
      const currentUserToken = await userModel.findById({ _id: decoded.id })
      if (currentUserToken?.token == 0) {
        return res.json({ message: "Token is finished ! buy more token..", success: false })
      }
      return next();
    }
    const guestIdFromCookie = req.cookies?.userId;

    if (guestIdFromCookie) {
      authedReq.user = {
        userId: guestIdFromCookie,
        isGuest: true,
      };
      console.log('Using existing guest cookie:', guestIdFromCookie);
      const UserToken = await guestModel.findById({ _id: req.cookies.userId })

      if (UserToken?.token == 0) {
        return res.json({ message: "Token is finished ! buy more token..", success: false })
      }
      return next();
    }

    console.log('Creating new guest user');

    const newGuestUser = await guestModel.create({
      isGuest: true,
    });
    const nChat = new chatModel({
      user_id: newGuestUser._id,
    });

    const nChart = new chartModel({
      user_id: newGuestUser._id,
      chat_id: nChat._id,
    });

    nChat.chart_id = nChart._id;

    await Promise.all([nChat.save(), nChart.save()]);

    // setting the cookie
    res.cookie('userId', newGuestUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    console.log('Guest cookie set successfully:', newGuestUser._id.toString());

    authedReq.user = {
      userId: newGuestUser._id.toString(),
      isGuest: true,
    };

    return next();
  } catch (err) {
    console.error('Error in tokenCheck middleware:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
