  import mongoose, { Schema, Document, Types } from "mongoose";

  export interface ISessionMessage {
    fromAi?: string | null;
    fromUser?: string | null;
    createdAt?: Date;
  }

  export interface IChartData {
    title: string;
    type: "bar" | "pie" | "line";
    x?: string;
    y?: string;
    data: any[];
    style?: any;
  }

  export interface ISession extends Document {
    user_id: Types.ObjectId;
    data_id?: Types.ObjectId;
    title: string;
    messages: ISessionMessage[];
    charts: IChartData[];
    metrics: any;
    createdAt: Date;
    updatedAt: Date;
  }

  const SessionSchema = new Schema<ISession>(
    {
      user_id: { type: Schema.Types.ObjectId, ref: "users_or_guest", required: true },

      data_id: { type: Schema.Types.ObjectId, ref: "datas", default: null },

      title: { type: String, default: "New Session" },

      messages: [
        {
          user: { type: String, default: "" },
          ai: { type: String, default: "" },
          createdAt: { type: Date, default: Date.now },
        },
      ],

      charts: [
        {
          title: String,
          type: { type: String, enum: ["bar", "pie", "line"] },
          x: String,
          y: String,
          data: Schema.Types.Mixed,
          style: { type: Schema.Types.Mixed, default: {} },
        },
      ],

      metrics: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
  );

  export const SessionModel =
    mongoose.models.sessions || mongoose.model<ISession>("sessions", SessionSchema);
