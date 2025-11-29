import { Request, Response } from 'express';
import dataModel from '../../model/dataModel';

export const uploadStats = async (req: Request, res: Response) => {
  try {
    const logs = await dataModel.find();

    if (logs.length === 0) {
      return res.json({
        total: 0,
        success: 0,
        failed: 0,
        peakHour: null,
      });
    }

    const total = logs.length;

    const success = logs.filter(l => l.status === 'success').length;
    const failed = logs.filter(l => l.status === 'failed').length;

    // Count uploads per hour
    const hourCounts: Record<number, number> = {};

    logs.forEach(log => {
      const hour = new Date(log.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Calculate peak hour
    const peak = Object.entries(hourCounts).reduce((max, current) =>
      current[1] > max[1] ? current : max,
    );

    const peakHourNumber = Number(peak[0]);

    // Convert 24-hour to 12-hour format
    const formattedHour =
      peakHourNumber === 0
        ? '12 AM'
        : peakHourNumber === 12
          ? '12 PM'
          : peakHourNumber > 12
            ? `${peakHourNumber - 12} PM`
            : `${peakHourNumber} AM`;

    return res.json({
      total,
      success,
      failed,
      peakHour: formattedHour,
    });
  } catch (err) {
    console.log('Upload stats error:', err);
    return res.status(500).json({});
  }
};
