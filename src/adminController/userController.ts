import { Request,Response,NextFunction } from "express";
import userModel from "../model/user";
import guestModel from "../model/guest";
import { any, cache } from "joi";
import { log } from "console";
import { Type } from "@aws-sdk/client-s3";
import { performance } from "perf_hooks";
import { start } from "repl";
import activeModel from "../model/activeModel";

//function for get allloged users count to admindashboard graph
export const loggedusers = async(req:Request,res:Response)=>{

try{

const fetcchallusers = await userModel.find().countDocuments()
res.status(200).json({message:"user count taken",fetcchallusers,success:true})

}
catch{

    res.status(500).json({message:"user not found"})
}}

export const updateUserstatus  =  async(req:Request,res:Response)=>{
  try{
  const {id}  = req.params
  const {status} = req.body
  const usestatus  = await userModel.findByIdAndUpdate (id,{
    status:req.body.status
  },{new:true})
  res.status(200).json({message:"userstatus updated",success:true})
}
catch(err){
res.status(500).json({message:"user status cant update",success:false})
}
}

//function for get new logged users count per month
export const getNewUsersPerMonth = async (req: Request, res: Response) => {
  console.log("reached");
  
  try {
    const usersPerMonth = await userModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);
    res.status(200).json({message: "new users per month count get successfully",success: true,usersPerMonth});
  } catch  {
  
    res.status(500).json({message:"new user per month count not get"})
 
  }
};

//function for add guestusers
export const addGustuser = async(req:Request,res:Response)=>{
      try {
    const newGuest = await guestModel.create({
      token: 12345,
      IP_address: 19216801
    });
    res.status(200).json({message:"guest user added successfully",addGustuser,success:true})
}

catch{

res.status(500).json({message:"guest user not added some error"})
}
}

//function for get full gustusers count
export const fetchAllgustusers = async(req:Request,res:Response)=>{
  try{
   const getAllgustusers  = await guestModel.find().countDocuments()
   res.status(200).json({message:"all gust users fetched successfully",allgustusers:getAllgustusers,success:true})
   
  }
  catch{

  }
}

//function for get all users count
export const getAllusers = async (req: Request, res: Response) => {
  try {
    const loggedCount = await userModel.countDocuments();
    const guestCount = await guestModel.countDocuments();

    const totalCount = loggedCount + guestCount;

    res.status(200).json({
      message: "All users fetched successfully",
      totalCount,
      loggedCount,
      guestCount,
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: "failed to fetch all users", error: err });
  }
};

//get allusers to a single page

export const alluserspage = async(req:Request,res:Response)=>{

  try{
    const loggedusers = await userModel.find();
    const gustusers = await guestModel.find();
    const allusertopage = [...loggedusers,...gustusers].flat()

    res.status(200).json({message:"allusers got to page",alluser:allusertopage,success:true})

  }

  catch(err){
   res.status(500).json({message:"all users couldint get page",success:false,err})
  

  }
}

//user single page 

export const GetSingleuser = async(req:Request,res:Response)=>{

  try{
    const id = req.params.id
     const loggedusers = await userModel.find();
     const gustusers = await guestModel.find();
     const allusertopage = [...loggedusers,...gustusers].flat()
     const singleUser = allusertopage.find((user: any) => user._id.toString() === id);
     res.status(200).json({message:"single user page fetched",singleuser:singleUser,success:true})
     }
  catch(err){
    res.status(500).json({message:"user single page cant fetch",err})
  }

}


//single user token  for each users
export const singleUsertoken = async (req: Request, res: Response) => {
  console.log("hii");

  try {
    const { id } = req.params;

    const singleuserToken = await userModel.findById(id).select("token name email");
    res.status(200).json({message:"singleuser token count fetched successfully",singletoken:singleuserToken?.token,success:true})

  }

   catch(err){
    console.log(err,"data cant fetch ");
    res.status(500).json({message:"count not fetched"})
    
   }

  }   

  //get activ time
 export const getUserActiveTime = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const sessions = await activeModel.find({ userId });

    const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    return res.status(200).json({
      userId,
      totalActiveSeconds: totalSeconds,
      totalActiveMinutes: Math.floor(totalSeconds / 60),
      totalActiveHours: (totalSeconds / 3600).toFixed(2),
      sessions
    });

  } catch (err) {
    res.status(500).json({ message: "Error calculating time", error: err });
  }
};


  

