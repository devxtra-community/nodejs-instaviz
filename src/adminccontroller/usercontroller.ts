import { Request,Response } from "express";
import userModel from "../model/user";

//function for get aallusers count to admindashboard graph
export const getAllusers = async(req:Request,res:Response)=>{

try{

const fetcchallusers = await userModel.find().countDocuments()
res.status(200).json({message:"user count taken",fetcchallusers,success:true})

}
catch{

    res.status(500).json({message:"user not found"})
}}