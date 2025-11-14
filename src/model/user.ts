import mongoose, { Schema } from "mongoose";

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
    place:String,
    phone:Number
};



const userSchema = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    name: {
      type: String
    },
    picture: {
      type: String
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: false
    },
    token: {
      type: Number,
      default: 3,
      createdAt:{
      type: Date,
      default: Date.now
      }
    },
    place: {
      type: String
    },
    phone: {
      type: Number
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.Active
    },
    isDeleted: {
      type: Boolean,
      default: false
    },

   
    lastActiveAt: {
      type: Date
    },
    dailyActiveTime: {
      type: Number,
      default: 0 
    },
    averageActiveTime: {
      type: Number,
      default: 0 
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);



const userModel = mongoose.model<User>("user", userSchema);

export default userModel;