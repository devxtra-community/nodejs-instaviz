// src/models/Chart.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { IChartData, IChartPoint } from "../types/charts";

export interface IChart extends Document {
  user_id: mongoose.Types.ObjectId;
  session_id: mongoose.Types.ObjectId;
  data_id?: mongoose.Types.ObjectId;
  chart_data: IChartData[];
}

const ChartPointSchema = new Schema<IChartPoint>(
  {
    xValue: String,
    yValue: Number,
    value: Number,
    rawValue: Number,
    formattedValue: String,
  },
  { _id: false }
);

const ChartDataSchema = new Schema<IChartData>(
  {
    type: { type: String, enum: ["bar", "pie", "line"], required: true },
    title: { type: String, required: true },
    x: String,
    y: String,
    data: { type: [ChartPointSchema], default: [] },
    style: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const ChartSchema = new Schema<IChart>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "user", required: true },
    session_id: { type: Schema.Types.ObjectId, ref: "sessions", required: true },
    data_id: { type: Schema.Types.ObjectId, ref: "datas" },

    chart_data: { type: [ChartDataSchema], default: [] },
  },
  { timestamps: true }
);

const ChartModel: Model<IChart> =
  mongoose.models.chart || mongoose.model<IChart>("chart", ChartSchema);

export default ChartModel;
