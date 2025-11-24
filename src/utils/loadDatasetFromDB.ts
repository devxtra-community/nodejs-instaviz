// utils/loadDatasetFromDB.ts
import dataModel from "../model/dataModel";

export async function loadDatasetFromDB() {
  try {
    const latest = await dataModel
      .findOne({})
      .sort({ createdAt: -1 })
      .lean();

    if (!latest) return null;

    return {
      sampleRows: latest.data || [],
      aggregations: (latest as any).aggregations || null,  
    };
  } catch (err) {
    console.error("Failed to load dataset:", err);
    return null;
  }
}
