import { Request, Response } from "express";
import path from "path";
import fs from "fs";

export const downloadReport = async (req: Request, res: Response) => {
  try {
    const dummyCSV = "name,age\nShrijit,22\nUser,30";

    const filePath = path.join(__dirname, "../../temp-report.csv");
    fs.writeFileSync(filePath, dummyCSV);

    res.download(filePath, "report.csv", () => {
      fs.unlinkSync(filePath); // cleanup temp file
    });

  } catch (err) {
    console.log("Download report error:", err);
    res.status(500).json({ message: "Failed to download report" });
  }
};
