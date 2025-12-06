// models/Session
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
  user_id?: Types.ObjectId | null;      // Logged in user
  session_token?: string | null;        // Guest user session
  data_id?: Types.ObjectId | null;      
  title: string;
  messages: ISessionMessage[];
  charts: IChartData[];
  metrics: any;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "users", default: null },
    session_token: { type: String, default: null },  // GUEST SUPPORT

    data_id: { type: Schema.Types.ObjectId, ref: "datas", default: null },

    title: { type: String, default: "New Session" },

    messages: [
      {
        fromAi: String,
        fromUser: String,
        createdAt: { type: Date, default: () => new Date() },
      },
    ],

    charts: [
      {
        title: String,
        type: String,
        x: String,
        y: String,
        data: Schema.Types.Mixed,
        style: Schema.Types.Mixed,
      },
    ],

    metrics: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const SessionModel =
  mongoose.models.sessions || mongoose.model<ISession>("sessions", SessionSchema);
