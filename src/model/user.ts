import mongoose, { Schema, Document } from "mongoose";

enum Status {
  Active = "active",
  Disabled = "disabled"
}

export interface IUser extends Document {
  googleId?: string;
  name?: string;
  picture?: string;
  email: string;
  password?: string;

  token: number;
  tokenCreatedAt?: Date;

  status?: Status;
  isDeleted?: boolean;

  place?: string;
  phone?: number;

  lastActiveAt?: Date;

  dailyActiveTime: number;
  totalActiveTime: number;
  activeDays: number;
  averageActiveTime: number;

  createdAt?: Date;
}

const userSchema = new Schema(
  {
    googleId: { type: String, unique: true, sparse: true },
    name: String,
    picture: String,

    email: { type: String, required: true, unique: true },
    password: String,

    token: { type: Number, default: 3 },
    tokenCreatedAt: { type: Date, default: Date.now },

    place: String,
    phone: Number,

    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.Active
    },

    isDeleted: { type: Boolean, default: false },

    lastActiveAt: { type: Date, default: null },

    dailyActiveTime: { type: Number, default: 0 },
    totalActiveTime: { type: Number, default: 0 },
    activeDays: { type: Number, default: 0 },
    averageActiveTime: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const userModel = mongoose.model<IUser>("User", userSchema);
export default userModel;
