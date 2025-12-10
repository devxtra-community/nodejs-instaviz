import mongoose, { Schema } from "mongoose";

const userSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    userName: String,
    userEmail: String,

    startTime: { type: Date, default: Date.now },
    lastHeartbeat: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },

    duration: { type: Number, default: 0 }, // seconds

    userAgent: String,
    ipAddress: String,
    screenWidth: Number,
    screenHeight: Number,

    ended: { type: Boolean, default: false },

   
    day: {
      type: String,
      index: true,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserSession", userSessionSchema);

