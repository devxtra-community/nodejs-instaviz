import mongoose, { Schema } from "mongoose";

const userSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    startTime: { type: Date, default: Date.now },
    lastHeartbeat: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },

    duration: { type: Number, default: 0 }, // total seconds  
  },
  { timestamps: true }
);

export default mongoose.model("UserSession", userSessionSchema);

 // userAgent : 
    // ipAddress : 
    // screenWidth
    // screenHeight