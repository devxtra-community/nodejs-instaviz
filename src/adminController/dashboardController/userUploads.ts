import { Request, Response } from 'express';
import dataModel from '../../model/dataModel';

export const getUploadDeviceStats = async (req: Request, res: Response) => {
  try {
    //  this month range
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const desktop = await dataModel.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      device: 'desktop',
    });

    const mobile = await dataModel.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      device: 'mobile',
    });

    return res.json({
      desktop,
      mobile,
    });
  } catch (err) {
    console.log('Upload device stats error:', err);
    return res.status(500).json({ message: 'Error fetching upload stats' });
  }
};
