import mongoose, { Schema, Document } from "mongoose";

enum Status {
  Active = "active",
  Disabled = "disabled"
};

export interface User {
  googleId?: number
  name?: string,
  picture?: string,
  email: string,
  password?: string,
  token: number,
  status?: Status,
  isDeleted?: boolean,
  place: String,
  phone: Number
};

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
    isDeleted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const userModel = mongoose.model<User>("User", userSchema);
export default userModel;
