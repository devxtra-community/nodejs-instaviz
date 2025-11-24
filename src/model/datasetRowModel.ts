import { Schema, model, Document } from "mongoose";

export interface IDatasetRow extends Document {
  datasetId: string;
  [key: string]: any;
}

const DatasetRowSchema = new Schema<IDatasetRow>(
  {
    datasetId: { type: String, required: true, index: true },
  },
  {
    strict: false, 
    minimize: true,
  }
);

export default model<IDatasetRow>("DatasetRow", DatasetRowSchema, "dataset_rows");
