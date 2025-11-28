import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChatMessage {
  fromAi?: string | null;
  fromUser?: string | null;
  createdAt?: Date;
}

export interface IChat extends Document {
  session_id?: Types.ObjectId; 
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    session_id :{
      type: Schema.Types.ObjectId,
      ref: "sessions",
      required: true,
    },

    messages: [
      {
        fromAi: { type: String, default: null },
        fromUser: { type: String, default: null },
        createdAt: { type: Date, default: () => new Date() },
      },
    ],
  },
  { timestamps: true }
);

export const ChatModel =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
export default ChatModel