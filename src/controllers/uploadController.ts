import type { Request, Response } from 'express';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import csv from 'csv-parser';
import { CustomError } from '../utils/CustomError';
import { generateAiPromt } from '../utils/aiPromt';

// const apikey =
let apiKeyIndex = 1;
const apiKeys = process.env.GEMINI_API_KEY!.split(',').map(k => k.trim());
let currentApi = apiKeys[apiKeyIndex];
let genAI = new GoogleGenerativeAI(currentApi);
let model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const switchApi = () => {
  apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
  currentApi = apiKeys[apiKeyIndex];
  genAI = new GoogleGenerativeAI(currentApi);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  console.log('Api Key swithed',currentApi);
};

export const fileParsing = async (req: Request, res: Response) => {
  try {
    // console.log(req.ip);
    console.time('checking')
    console.log(currentApi);
    if (!req.file) {
      return res.status(404).json({ message: 'File Not Uploaded' });
    }

    const filepath = req.file.path;
    const results: any[] = [];
    let headers: string[] = [];
    let totalRows = 0;
    // let headerOnCalledCount = 0;

    const handleOnHeaders = (hdrs: string[]) => {
      headers = hdrs;
      // TODO: Check and remove
      // console.log("Header evert called : ", headerOnCalledCount++, hdrs);
    };

    const handleOnData = (data: any) => {
      totalRows++;
      results.push(data);
    };

    const handleOnError = (err: any) => {
      console.log('error while parsing csv:', err);
      return res.status(500).json({
        message: 'error parsing csv',
        success: false,
        error: String(err),
      });
    };

    const handleOnEnd = async () => {
      console.timeEnd('checking');
      const rowsneeded = results.slice(0, 10);
      const totalColumns = headers.length;
      let missingValues = 0;
      for (let i of results) {
        for (let j of Object.values(i)) {
          if (j === '' || j === null || j === undefined) {
            missingValues++;
          }
        }
      }

      // user to calucuate total rows, cols of the given data
      const computedMetrics = {
        total_rows: totalRows,
        total_columns: totalColumns,
        missing_values: missingValues,
      };

      // Data given to AI
      const sampleData = {
        name: req.file?.originalname,
        headers,
        rows: rowsneeded,
        metrics: computedMetrics,
      };

      const json = JSON.stringify(sampleData);
      const modelsize = Buffer.byteLength(json, 'utf8');
      console.log((modelsize / (1024 * 1024)).toFixed(2) + ' MB');
      fs.unlink(filepath, err => {
        if (err) console.log('File removing Failed', err);
      });

      const prompt = generateAiPromt(sampleData, computedMetrics);
      try {
        console.time('ai response');
        const result = await model.generateContent(prompt);
        const responsetext = await result.response.text();
        console.timeEnd('ai response');
        console.log(responsetext);
      } catch (err: any) {
        const msg = String(err?.message || '');
        if (
          err.status == 503 ||
          msg.includes('quota') ||
          msg.includes('exceeded') ||
          msg.includes('429')
        ) {
          console.log('Limit Reached For This Api Key');
          switchApi();
        } else {
          console.log(err);
        }
      }
    };

    const stream = fs.createReadStream(filepath, { encoding: 'utf-8' }).pipe(csv());

    stream
      .on('headers', handleOnHeaders)
      .on('data', handleOnData)
      .on('error', handleOnError)
      .on('end', handleOnEnd);
    //..
  } catch (err) {
    console.log(err);
    const error = new CustomError({ errorData: String(err), statusCode: 404 });
    return res.status(error.statusCode).json(error);
  }
};
