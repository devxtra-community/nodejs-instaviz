import { signJwt } from "../../services/jwtService.ts";
import type { Response, Request } from "express";
import type { User } from "../../model/user.ts";

export const googleCallback = (req: Request, res: Response) => {
    const user = req.user as User;

    const token = signJwt({
        id: user.googleId,
        email: user.email
    });
    res.json({ message: "Google login successfull", token, user })
};