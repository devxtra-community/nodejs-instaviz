import { NextFunction, Request, Response } from "express"
import cors from "cors"

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        cors({
            origin: (origin, callback) => {
                const allowedOrigins = [process.env.CLIENT_URL, `http://localhost:${process.env.PORT}`];

                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true,
            allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
        })
    }
    catch (err) {
        console.log("error happend inside cors middleware", err)
    }
}