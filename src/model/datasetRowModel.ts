import { Schema, model, Document } from "mongoose";

export interface IDatasetRow extends Document {
  datasetId: string; // string version of Dataset._id
  [key: string]: any;
}

const DatasetRowSchema = new Schema<IDatasetRow>(
  {
    datasetId: { type: String, required: true, index: true },
  },
  {
    strict: false, // allow arbitrary CSV columns as top-level fields
    minimize: true,
  }
);

export default model<IDatasetRow>("DatasetRow", DatasetRowSchema, "dataset_rows");
