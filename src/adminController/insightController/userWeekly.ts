import userModel from '../../model/user';
import moment, { weekdays } from 'moment';
import { Request, Response } from 'express';

export const getWeeklyUser = async (req: Request, res: Response) => {
  try {
    const IST = 330
    const startOfWeek = moment().utcOffset(IST).startOf('isoWeek')
    const endOfWeek = moment().utcOffset(IST).endOf('isoWeek')
    const weekDays = [...Array(7)].map((_, i) => // spreads into a real array of 7 elements and then iterates 7 times from 0 to 6
      startOfWeek.clone() // copy Monday
        .add(i, 'days') //add i=1 -> Tue...
        .format('ddd'),
    );
     const users = await userModel.aggregate([{
        $match:{
            createdAt:{$gte : startOfWeek.toDate(),
                $lte:endOfWeek.toDate()
            },
            isDeleted : false
        }
     },
    {$group:{
        _id:{
            $dateToString : {format : '%a' , date : "$createdAt"}
        },
        count : {$sum : 1}
    }}])

    const formatted = weekDays.map((day)=>({
        day,
        users : users.find((u)=> u._id === day)?.count || 0
    }))

    return res.json(formatted)
  } catch (err) {
    console.error('Weekly Growth Error:', err);
    return res.status(500).json({ message: 'Error fetching weekly users', success: false });
  }
};
