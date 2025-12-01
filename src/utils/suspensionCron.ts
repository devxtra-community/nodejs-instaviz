// utils/suspensionCron.ts
import cron from "node-cron";
import userModel from "../model/user"

export const startSuspensionCheck = () => {
  // Run every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = new Date();

      // Find and update all expired suspensions
      const result = await userModel.updateMany(
        {
          isSuspended: true,
          suspensionEnd: { $lte: now },
        },
        {
          $set: {
            isSuspended: false,
            suspensionEnd: null,
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(` Auto-unsuspended ${result.modifiedCount} users`);
      }
    } catch (error) {
      console.error(" Suspension cron error:", error);
    }
  });

  console.log("🕒 Suspension checker started (runs every 10 minutes)");
};