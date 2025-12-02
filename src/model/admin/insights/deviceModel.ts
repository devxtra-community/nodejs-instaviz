import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },

action:{
  type : String,
  default : 'login'
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const deviceModel = mongoose.model("Device", deviceSchema);
