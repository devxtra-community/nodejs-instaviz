import mongoose from "mongoose";
import Dataset, { IDataset } from "../model/dataModel";
import DatasetRow from "../model/datasetRowModel";

export async function createDatasetWithRows(
  results: any[],
  userId: mongoose.Types.ObjectId | null,
  fileUrl: string,
  fileName: string,
  totalColumns: number
) {
  console.time("dataset uploading to mongodb:")
  // 1) Create dataset metadata doc (with sample rows)
  const dataset = await Dataset.create({
    user_id: userId,
    name: fileName,
    r2_url: fileUrl,
    row_count: results.length,
    column_count: totalColumns,
    sample_data: results.slice(0, 10),
  }) as IDataset; 

  console.log("Dataset saved to MongoDB:", dataset._id);
  console.timeEnd("dataset uploading to mongodb:")

  // 2) Insert all rows into dataset_rows
  const datasetId = dataset._id.toString();
  console.time("rows uploading in  mongodb:")
  const rowsToInsert = results.map((row) => ({
    datasetId,
    ...row,
  }));

  if (rowsToInsert.length > 0) {
    await DatasetRow.insertMany(rowsToInsert, { ordered: false });
    console.log(`Inserted ${rowsToInsert.length} rows into dataset_rows`);
  }
  console.timeEnd("rows uploading in  mongodb:")

  return dataset;
}
