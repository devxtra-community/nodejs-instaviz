import mongoose from "mongoose";
const uploadSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["success", "failed"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export const UploadLog = mongoose.model('Upload' , uploadSchema)