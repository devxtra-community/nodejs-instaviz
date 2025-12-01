import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    planName: {
      type: String, 
      enum: ["starter", "pro", "enterprise"],
      required: true,
    },

    paymentId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
