import { Request,Response } from "express";
import userModel from "../model/user";//called userdatabase
import guestModel from "../model/guest";

//function for get allloged users count to admindashboard graph
export const loggedusers = async(req:Request,res:Response)=>{

try{

const fetcchallusers = await userModel.find().countDocuments()
res.status(200).json({message:"user count taken",fetcchallusers,success:true})

}
catch{

    res.status(500).json({message:"user not found"})
}}



//function for get new logged users count per month
export const getNewUsersPerMonth = async (req: Request, res: Response) => {
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
