import { Request,Response } from "express";
import userModel from "../model/user";

//get  all token counts
export const getAlltokencont =  async(req:Request,res:Response)=>{
try{
const allTokencount = await userModel.aggregate([{$group:{_id:null,totalTokens:{$sum:"$token"}}}])
res.status(200).json({message:"all token cound go",alltokencount:allTokencount,success:true})
}
catch(err){
    res.status(500).json({message:"all token count not get"})
    console.log(err,"all token count not get");
}
}

//get token usage to graph 
export const getAlltokenusage  = async(re:Request,res:Response)=>{
try{
const tokenusagepermonth  =  await userModel.aggregate([{$group:{_id:{  year: { $year: "$createdAt" },
month: { $month: "$createdAt" }},totalTokens: { $sum: "$token" }}},{$sort: { "_id.year": 1, "_id.month": 1 } }])
res.status(200).json({message:"token usage successed",totaltokeusagepermonth:tokenusagepermonth,success:true})
}
catch(err){
res.status(500).json({message:"token usage get not successed",success:false,err
   
})
}


}