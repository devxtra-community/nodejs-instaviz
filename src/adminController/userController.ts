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

// get all users average active time per day + hourly active users
export const hourlyActiveUserCount = async (req: Request, res: Response) => {
  try {
    const { day } = req.query;

    if (!day) {
      return res.status(400).json({
        success: false,
        message: "day (YYYY-MM-DD) is required",
      });
    }


    const sessions = await activeModel.find({ day });


    if (!sessions.length) {
      return res.json({
        success: true,
        day,
        hourlyActive: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          active: 0,
        })),
        averageSeconds: 0,
        averageFormatted: "0h 0m",
      });
    }



    const hourly = Array(24).fill(0);

    sessions.forEach((session) => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime || session.lastHeartbeat);

      let startHour = start.getHours();
      let endHour = end.getHours();

      if (endHour < startHour) endHour = startHour;

      for (let hr = startHour; hr <= endHour && hr < 24; hr++) {
        hourly[hr] += 1;
      }
    });

    const hourlyFormatted = hourly.map((count, hr) => ({
      hour: hr,
      active: count,
    }));



    const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);

    const uniqueUsers = new Set(sessions.map((s) => s.userId.toString())).size;

    const averageSeconds = Math.floor(totalSeconds / uniqueUsers);

    const hours = Math.floor(averageSeconds / 3600);
    const minutes = Math.floor((averageSeconds % 3600) / 60);

    const formatted = `${hours}h ${minutes}m`;

  
    return res.json({
      success: true,
      day,
      hourlyActive: hourlyFormatted,
      averageSeconds,
      averageFormatted: formatted,
    });

  } catch (err) {
    console.error("Hourly active count error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getUserDailyActiveTime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

 
    const filter: any = { userId };

    if (startDate || endDate) {
      filter.day = {};
      if (startDate) filter.day.$gte = startDate;
      if (endDate) filter.day.$lte = endDate;
    }


    const sessions = await activeModel.find(filter).sort({ day: 1 });

    if (!sessions.length) {
      return res.json({
        success: true,
        userId,
        message: "No active sessions found",
        dailyActiveTime: [],
        totalSeconds: 0,
        totalFormatted: "0h 0m",
      });
    }


    const dailyMap = new Map<string, number>();

    sessions.forEach((session) => {
      const day = session.day;
      const currentTotal = dailyMap.get(day) || 0;
      dailyMap.set(day, currentTotal + session.duration);
    });

    // Format the daily active time
    const dailyActiveTime = Array.from(dailyMap.entries()).map(([day, totalSeconds]) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      let formatted = "";
      if (hours > 0) {
        formatted = `${hours}h ${minutes}m`;
      } else {
        formatted = `${minutes}m`;
      }

      // Get day name
      const date = new Date(day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

      return {
        date: day,
        dayName,
        totalSeconds,
        formatted,
      };
    });

    // Calculate overall total
    const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const totalFormatted = `${totalHours}h ${totalMinutes}m`;

    // Calculate average per day
    const avgSeconds = Math.floor(totalSeconds / dailyActiveTime.length);
    const avgHours = Math.floor(avgSeconds / 3600);
    const avgMinutes = Math.floor((avgSeconds % 3600) / 60);
    const avgFormatted = `${avgHours}h ${avgMinutes}m`;

    return res.json({
      success: true,
      userId,
      dailyActiveTime,
      totalSeconds,
      totalFormatted,
      averagePerDay: {
        seconds: avgSeconds,
        formatted: avgFormatted,
      },
    });

  } catch (err) {
    console.error("User daily active time error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//singleuser avarage time
export const getsingleUserDailyActiveTime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const { startDate, endDate } = req.query;

    const filter: any = { userId };

    if (startDate || endDate) {
      filter.day = {};
      if (startDate) filter.day.$gte = startDate;
      if (endDate) filter.day.$lte = endDate;
    }

 
    const sessions = await activeModel.find(filter);

  
    const weekDays: Record<string, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    
    sessions.forEach((session) => {
      const date = new Date(session.day);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

      if (weekDays[dayName] !== undefined) {
        weekDays[dayName] += session.duration;
      }
    });


    const dailyActiveTime = Object.entries(weekDays).map(([dayName, totalSeconds]) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const formatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      return {
        dayName,
        totalSeconds,
        formatted,
      };
    });


    const totalSeconds = Object.values(weekDays).reduce((sum, v) => sum + v, 0);

    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const totalFormatted = `${totalHours}h ${totalMinutes}m`;

    const avgSeconds = Math.floor(totalSeconds / 7);
    const avgHours = Math.floor(avgSeconds / 3600);
    const avgMinutes = Math.floor((avgSeconds % 3600) / 60);
    const avgFormatted = `${avgHours}h ${avgMinutes}m`;

    return res.json({
      success: true,
      userId,
      dailyActiveTime, 
      totalSeconds,
      totalFormatted,
      averagePerDay: {
        seconds: avgSeconds,
        formatted: avgFormatted,
      },
    });

  } catch (err) {
    console.error("Single user weekly time error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//user suspend for days 
export const suspendUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;    
    const { days } = req.query;

    // Validation
    if (!days || isNaN(Number(days)) || Number(days) <= 0) {
      return res.status(400).json({ 
        message: "Invalid number of days. Must be a positive number." 
      });
    }

    const suspensionEnd = new Date();
    suspensionEnd.setDate(suspensionEnd.getDate() + Number(days));

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      {
        isSuspended: true,
        suspensionEnd,
      },
      { new: true } // Return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      success: true,
      message: `User suspended for ${days} days`,
      suspensionEnd: suspensionEnd.toISOString()
    });
  } catch (error) {
    console.error("Suspend error:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};