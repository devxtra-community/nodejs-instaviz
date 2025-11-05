import type { Request, Response } from "express"
export const loginCheck = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        console.log(email, password)
    }
    catch (err) {
        console.log(err);
        return
    }
}