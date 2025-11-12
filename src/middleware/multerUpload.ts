import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log("Created upload directory:", UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (_req, file, cb) {
    const suffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, `${suffix}_${file.originalname}`);
  },
});

function fileFiltercsv(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".csv") {
    return cb(new Error("only csv FileType allowed"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter: fileFiltercsv,
//   limits: { fileSize: 50 * 1024 * 1024 },
});

export default upload;
export { UPLOAD_DIR };
