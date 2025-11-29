import mongoose from "mongoose";

const featureUsageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  feature: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

export const FeatureUsage = mongoose.model("FeatureUsage", featureUsageSchema);
