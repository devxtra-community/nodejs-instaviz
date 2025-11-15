import { Response , Request , NextFunction } from "express";
import { deviceModel } from "../model/admin/insights/deviceModel";

export const deviceLogger = async (req : Request , res : Response , next : NextFunction)=>{
    try{
      const user = (req as any).user // get the logged in user
      if(!user) return next() // if not user skip logging and continue request flow
    
     
    await deviceModel.create({
        userId : user._id,
        userAgent : req.headers['user-agent'] || 'unknown', // browser + os info
        ipAddress : req.ip || // request IP
        (req.headers['x-forwarded-for'] as string) || // For proxy / production servers
        req.socket.remoteAddress, // fallback method to get IP Address
        action: req.route.path //  saves "/fileupload" or "/login"
    })

    next()
}
    catch (err) {
    console.log("Device logging error:", err);    // If logging fails, print error but dont break login flow
    next(); 
}
}
