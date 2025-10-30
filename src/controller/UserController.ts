import type { Request, Response } from "express"
export const fileupload = async (req: Request, res: Response) => {
    try {
        res.send("hello");
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "internal server error", success: false })
    }
}