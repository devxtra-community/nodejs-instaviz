import  Jwt  from "jsonwebtoken";
import { Request,Response,NextFunction } from "express";
  export const verifyToken  = (req:Request,res:Response,next:NextFunction)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({message:"no token"})
    }
     const token = authHeader.split(" ")[1]
      try{
        const decoded = Jwt.verify(token,process.env.JWT_SECRET!);
        req.user = decoded;
    next();

      }catch(err){
            return res.status(403).json({ message: "Invalid or expired token" });
      }

 
  } 