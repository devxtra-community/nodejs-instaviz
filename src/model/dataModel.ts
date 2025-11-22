import mongoose, { Schema } from "mongoose";

interface Data {
  data: Record<string, any>[];
  user_id: mongoose.Types.ObjectId;
  chat_id?: string;
  chart_id?: mongoose.Types.ObjectId;
  r2_url?: string;

  device: "desktop" | "mobile";  
  status: "success" | "failed";  

  createdAt: Date;
  updatedAt: Date;
}


const dataSchema = new Schema<Data>(
  {
    data: [
      {
        type: Map,
        of: Schema.Types.Mixed,
      },
      {
        type: Map,
        of: Schema.Types.Mixed,
      },
    ],

    aggregations: {
      type: Schema.Types.Mixed, 
      required: false,
    },

    user_id: { type: Schema.Types.ObjectId, ref: "user" },

    chat_id: { type: Schema.Types.ObjectId, ref: "chat" },

    chart_id: { type: Schema.Types.ObjectId, ref: "chart" },

    r2_url: { type: String },

    device: {
      type: String,
      enum: ["desktop", "mobile"],
      required: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

const dataModel = mongoose.model<Data>("data", dataSchema);
export default dataModel;
