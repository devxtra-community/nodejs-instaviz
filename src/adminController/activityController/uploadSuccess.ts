import { Request, Response } from 'express';
import { UploadLog } from '../../model/admin/activity/upload';

export const uploadSuccess = async (req: Request, res: Response) => {
  try {
    const logs = await UploadLog.find();

    if (logs.length === 0) {
      return res.json({ successRate: 0 });
    }

    const total = logs.length;
    const success = logs.filter(l => l.status === 'success').length;

    const successRate = Math.round((success / total) * 100);

    return res.json({ successRate });
  } catch (err) {
    console.log('Upload rate error:', err);
    return res.status(500).json({ successRate: 0 });
  }
};
