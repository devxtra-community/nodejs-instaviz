import mongoose, { Schema } from "mongoose";

const userSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    startTime: { type: Date, default: Date.now },
    lastHeartbeat: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },

    duration: { type: Number, default: 0 }, // seconds

    userAgent: { type: String },
    ipAddress: { type: String },
    screenWidth: { type: Number },
    screenHeight: { type: Number },

    ended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("UserSession", userSessionSchema);


 // userAgent : 
    // ipAddress : 
    // screenWidth
    // screenHeight