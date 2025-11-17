// src/controllers/uploadController.ts
import type { Request, Response } from 'express';
import fs from 'fs';
import csv from 'csv-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '../config/r2Client';
import dataModel from '../model/dataModel';
import { CustomError } from '../utils/CustomError';
import { generateAiPromt } from '../utils/aiPrompt';

interface UserPayload {
  userId: string;
  isGuest?: boolean;
}

type AuthedRequest = Request & {
  user?: UserPayload;
};

//  Gemini setup 
let apiKeyIndex = 0;
const apiKeys = process.env.GEMINI_API_KEY!.split(',').map((k) => k.trim());
let currentApi = apiKeys[apiKeyIndex];

let genAI = new GoogleGenerativeAI(currentApi);
let model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const switchApi = () => {
  apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
  currentApi = apiKeys[apiKeyIndex];
  genAI = new GoogleGenerativeAI(currentApi);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  console.log('API key switched to', currentApi);
};

//  Controller 
export const fileParsing = async (req: Request, res: Response) => {
  try {
    console.log("entering to upload controller")
    console.time('Parsing CSV');
    if (!req.file) {
      return res.status(404).json({ message: 'File Not Uploaded' });
    }

    const file = req.file as Express.Multer.File;
    const filepath = file.path;

    const results: any[] = [];
    let headers: string[] = [];
    let totalRows = 0;
    let responded = false;

    const handleOnHeaders = (hdrs: string[]) => {
      headers = hdrs;
    };

    const handleOnData = (data: any) => {
      totalRows++;
      results.push(data);
    };

    const handleOnError = (err: any) => {
      console.log('error while parsing csv:', err);
      responded = true;
      return res.status(500).json({
        message: 'error parsing csv',
        success: false,
        error: String(err),
      });
    };

    const handleOnEnd = async () => {
      if (responded) return;
      responded = true;
      console.timeEnd('Parsing CSV');

      //  Uploading to Cloudflare R2 
      const fileBuffer = fs.readFileSync(filepath);
      const fileName = `${Date.now()}_${file.originalname}`;

      try {
        await r2.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: fileName,
            Body: fileBuffer,
            ContentType: 'text/csv',
          }),
        );
      } catch (err) {
        console.error('R2 upload error:', err);
        return res.status(500).json({
          message: 'R2 upload failed',
          success: false,
        });
      }

      fs.unlink(filepath, () => { });

      const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
      console.log('Uploaded file URL:', fileUrl);

      //  Compute basic metrics 
      const totalColumns = headers.length;
      let missingValues = 0;

      for (const row of results) {
        for (const val of Object.values(row)) {
          if (val === '' || val === null || val === undefined) {
            missingValues++;
          }
        }
      }

      const computedMetrics = {
        total_rows: totalRows,
        total_columns: totalColumns,
        missing_values: missingValues,
      };

      //  Get user id from middleware 
      const authedReq = req as AuthedRequest;
      const userId = authedReq.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not identified',
        });
      }

      const dataset = await dataModel.create({
        data: results.slice(0, 10),
        user_id: userId as any,
        chat_id: null,
        chart_id: null,
        r2_url: fileUrl,
      });

      const prompt = generateAiPromt(dataset, computedMetrics);
      let aiResponse: any;

      try {
        console.log('Using Gemini API key:', currentApi);
        console.time('AI response time:');
        const result = await model.generateContent(prompt);

        let responseText = result.response
          .text()
          .trim()
          .replace(/```json|```/g, '');

        aiResponse = JSON.parse(responseText);
        console.log('AI response:', aiResponse);
        console.timeEnd('AI response time:');
      } catch (err: any) {
        const msg = String(err?.message || '');
        if (
          err.status === 503 ||
          msg.includes('quota') ||
          msg.includes('exceeded') ||
          msg.includes('429')
        ) {
          console.log('Limit reached for this API key, switching...');
          switchApi();
        } else {
          console.log('Error from Gemini:', err);
        }
      }
      // const tokenReducing = await userModel
      return res.status(200).json({
        success: true,
        message: 'Dataset processed successfully',
        datasetId: dataset._id,
        r2Url: fileUrl,
        data: aiResponse,
      });
    };

    const stream = fs
      .createReadStream(filepath, { encoding: 'utf-8' })
      .pipe(csv());

    stream
      .on('headers', handleOnHeaders)
      .on('data', handleOnData)
      .on('error', handleOnError)
      .on('end', handleOnEnd);
  } catch (err) {
    console.log(err);
    const error = new CustomError({ errorData: String(err), statusCode: 404 });
    return res.status(error.statusCode).json(error);
  }
};
