import mongoose from "mongoose";

const featureUsageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  feature: { type: String, required: true }, 
  count: { type: Number, default: 1 },
  lastUsed: { type: Date, default: Date.now },
});

export const FeatureUsageModel = mongoose.model("FeatureUsage", featureUsageSchema);
