import mongoose from "mongoose";

export interface Irefreshtoken {
  userId: mongoose.Types.ObjectId;
  tokenhash: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
  lastActiveAt: Date;
  isValid: boolean;
}

const refreshTokenSchema = new mongoose.Schema<Irefreshtoken>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  tokenhash: {
    type: String,
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
  },

  userAgent: {
    type: String,
  },

  ip: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  lastActiveAt: {
    type: Date,
    default: Date.now,
  },

  isValid: {
    type: Boolean,
    default: true,
  },
});

const refreshModel = mongoose.model<Irefreshtoken>(
  "refreshToken",
  refreshTokenSchema
);

export default refreshModel;
