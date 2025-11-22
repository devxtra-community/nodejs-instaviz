import fs from 'fs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '../config/r2Client';

export async function uploadCsvToR2(filepath: string, originalName: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filepath);
  const fileName = `${Date.now()}_${originalName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: fileBuffer,
      ContentType: 'text/csv',
    })
  );

  console.log('File uploaded to R2:', fileName);

  return `${process.env.R2_PUBLIC_URL}/${fileName}`;
}
