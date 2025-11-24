import mongoose, { Schema, model, Document } from "mongoose";

export interface IDataset extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: string | null;
  name: string;
  r2_url: string;
  row_count: number;
  column_count: number;
  sample_data: any[];
  device?: "mobile" | "desktop";
  status?: "success" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const DatasetSchema = new Schema(
  {
    user_id: { type: String, default: null },
    name: { type: String, required: true },
    r2_url: { type: String, required: true },
    row_count: { type: Number, required: true },
    column_count: { type: Number, required: true },

    sample_data: {
      type: [Schema.Types.Mixed],
      default: [],
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
    }
  },
  {
    timestamps: true,  
  }
);

export default model<IDataset>("datas", DatasetSchema);
