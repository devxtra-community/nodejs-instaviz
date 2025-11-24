import userModel from '../../model/user';
import moment from 'moment';
import { Request, Response } from 'express';

export const getWeeklyUser = async (req: Request, res: Response) => {
  try {
    const IST = 330; // 5h 30min

    const startOfWeek = moment().utcOffset(IST).startOf('isoWeek').toDate(); // compute IST-based start and end 
    const endOfWeek = moment().utcOffset(IST).endOf('isoWeek').toDate(); 

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const users = await userModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfWeek,
            $lte: endOfWeek,
          },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    console.log("AGG USERS:", JSON.stringify(users, null, 2));

    const countsByDay: Record<string, number> = {};

    users.forEach(u => {
      const weekday = moment(u._id).format("ddd"); // convert grouped days into weekdays name 
      countsByDay[weekday] = u.count;
    });

    const formatted = weekDays.map(day => ({
      day,
      users: countsByDay[day] || 0,
    }));

    return res.json({
      success: true,
      data: formatted,
    });

  } catch (err: any) {
    console.error("WEEKLY USER ERROR:", err.message);
    console.error("FULL ERROR:", err);

    return res.status(500).json({
      message: "Error fetching weekly users",
      success: false,
    });
  }
};
