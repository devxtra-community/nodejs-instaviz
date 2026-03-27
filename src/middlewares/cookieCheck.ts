import { NextFunction, Request, Response } from "express"

export const cookieCheck = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("userId", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        });
        next();
    }
    catch (err) {
        console.log("failed to delete cookie :", err)
        return res.status(500).json({ message: "internal server error:", success: false })
    }
}