import { Response, Request} from "express";
import { deviceModel } from "../model/admin/insights/deviceModel";

export const getUserDevices = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // get logged user-info from request

    // find all devices from db where userId matches logged in user
    const devices = await deviceModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 });
      res.json({devices})
  } catch (err) {
    res.status(500).json({ message: "Error Fetching Devices", error: err });
  }
};
