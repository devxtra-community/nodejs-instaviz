import mongoose, { Schema, Document } from "mongoose";

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date | null;
  duration?: number;
}

const userSessionSchema = new Schema<IUserSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endTime: {
      type: Date,
      default: null
    },
    duration: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model<IUserSession>("UserSession", userSessionSchema);
