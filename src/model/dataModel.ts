import mongoose, { Schema } from "mongoose";

interface Data {
  data: Record<string, any>[];
  aggregations: Record<string, any>;
  user_id: mongoose.Types.ObjectId;
  chat_id?: string;
  chart_id?: mongoose.Types.ObjectId;
  r2_url?: string;
  device?: "mobile" | "desktop";
  status?: "success" | "failed";
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
    ],

    aggregations: {
      type: Schema.Types.Mixed,
      required: false,
    },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },

    chat_id: {
      type: Schema.Types.ObjectId,
      ref: "chat",
    },

    chart_id: {
      type: Schema.Types.ObjectId,
      ref: "chart",
    },

    r2_url: {
      type: String,
      required: false,
    },

    device: {
      type: String,
      enum: ["mobile", "desktop"],
      default: "desktop",
    },

   
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  {
    timestamps: true,
  }
);

const dataModel = mongoose.model<Data>("data", dataSchema);
export default dataModel;
