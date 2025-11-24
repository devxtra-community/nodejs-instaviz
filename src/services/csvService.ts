import fs from 'fs';
import csv from 'csv-parser';

export interface ParsedCsv {
  results: any[];
  headers: string[];
  totalRows: number;
}

export function parseCsvFile(filepath: string): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    let headers: string[] = [];
    let totalRows = 0;

    const stream = fs.createReadStream(filepath, { encoding: 'utf-8' }).pipe(csv());

    stream
      .on('headers', (hdrs: string[]) => {
        headers = hdrs;
      })
      .on('data', (data: any) => {
        totalRows++;
        results.push(data);
      })
      .on('error', (err: any) => {
        console.error('CSV parsing error:', err);
        reject(err);
      })
      .on('end', () => {
        resolve({ results, headers, totalRows });
      });
  });
}
