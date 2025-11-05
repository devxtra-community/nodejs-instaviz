import type { Request, Response } from "express"
import otpModel from "../../model/otpModel.ts";
import Joi from "joi";



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




export const register = async(req:Request,res:Response)=>{
    try{
         const theValidation =  Joi.object({
            firstName: Joi.string().min(3).max(20).required(),
            lastName: Joi.string().min(3).max(20).required(),
            email:Joi.string().email().required(),
            password:Joi.string().pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$")).min(8)
            .messages({
                        "string.pattern.base": "Password must contain letters, numbers, and symbols",
                        "string.min": "Password must be at least 8 characters",
                        }),
            confirmPassword:Joi.string().valid(Joi.ref("password")).required().messages({
                                "any.only": "Password and Confirm Password must match",
                                "any.required": "Confirm Password is required"
                                })



         })

         const {error} = theValidation.validate(req.body,{abortEarly:false})
         if(error){
            return res.status(400).json({message:"failed"})
         }


         const otp = Math.floor( Math.random() * 900000);
         

    
        
        

    }catch(err){
        console.error("Register Error",err)
        res.status(500).json({message:"someting went wrong",success:false})
        
    }
}

export const verifyOtp = async(req:Request,res:Response) =>{
   try{
        const {email,otp} = req.body;
        const optData = otpModel.findOne({email})
        if(!optData){
            return res.status(400).json({message:"otp not found"})
        }
        if(!optData==otp){
            return res.status(400).json({message:"Invalid otp"})
        }
        



   }catch(err){
        console.log("veryfyotp catch woerked",err)
        res.status(500).json({message:"Internal server errror"})
   }
}