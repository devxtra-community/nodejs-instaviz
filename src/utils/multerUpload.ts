import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log('Created upload directory:', UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (_req, file, cb) {
    const suffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${suffix}_${safeName}`);
  },
});

function fileFiltercsv(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.csv') {
    return cb(new Error('Only CSV file type allowed'));
  }
  if (file.mimetype !== 'text/csv' && file.mimetype !== 'application/vnd.ms-excel') {
    return cb(new Error('Invalid mimetype for CSV'));
  }
  cb(null, true);
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter: fileFiltercsv,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

export default upload;
export { UPLOAD_DIR };
