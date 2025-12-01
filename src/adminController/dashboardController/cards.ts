import { Request, Response } from 'express';
import dataModel from '../../model/dataModel';
import userModel from '../../model/user';
import Payment from '../../model/paymentModel'

export const dashboardStats = async (req: Request, res: Response) => {
  try {
    const revenueAgg = await Payment.aggregate([
      // total revenue

      {
        $match: { status: 'success' },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const totalUsers = await userModel.countDocuments();

    const premiumUsers = await Payment.distinct('userId', {
      status: 'success',
    });

    const conversionRate =
      totalUsers === 0 ? 0 : Math.round((premiumUsers.length / totalUsers) * 100);

    const dataGenerated = await dataModel.countDocuments(); // no. of processed/uploaded data in your system

    return res.json({
      totalRevenue,
      conversionRate,
      dataGenerated,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch stats', err });
  }
};
