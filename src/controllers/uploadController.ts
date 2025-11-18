import type { Request, Response } from 'express';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import csv from 'csv-parser';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '../config/r2Client';
import dataModel from '../model/dataModel';
import { CustomError } from '../utils/CustomError';
import { generateAiPrompt } from '../utils/aiPrompt';
import mcpClient from '../services/mcpClient';

let apiKeyIndex = 0;
const apiKeys = process.env.GEMINI_API_KEY!.split(',').map(k => k.trim());
let currentApi = apiKeys[apiKeyIndex];
let genAI = new GoogleGenerativeAI(currentApi);

const mcpToolDeclarations = [
  {
    name: "mdb_aggregate",
    description: "Execute MongoDB aggregation pipeline to compute chart data",
    parameters: {
      type: "object" as const,
      properties: {
        database: { 
          type: "string" as const,
          description: "Database name" 
        },
        collection: { 
          type: "string" as const,
          description: "Collection name" 
        },
        pipeline: { 
          type: "array" as const,
          description: "MongoDB aggregation pipeline stages",
          items: {
            type: "object" as const,
            description: "Pipeline stage"
          }
        }
      },
      required: ["database", "collection", "pipeline"]
    }
  },
  {
    name: "mdb_query",
    description: "Query MongoDB collection to fetch documents",
    parameters: {
      type: "object" as const,
      properties: {
        database: { 
          type: "string" as const,
          description: "Database name" 
        },
        collection: { 
          type: "string" as const,
          description: "Collection name" 
        },
        query: { 
          type: "object" as const,
          description: "MongoDB query filter" 
        }
      },
      required: ["database", "collection", "query"]
    }
  }
];

let model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
  tools: [{ functionDeclarations: mcpToolDeclarations as any }]
});

const switchApi = () => {
  apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
  currentApi = apiKeys[apiKeyIndex];
  genAI = new GoogleGenerativeAI(currentApi);
  model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    tools: [{ functionDeclarations: mcpToolDeclarations as any }]
  });
  console.log('API Key switched to index:', apiKeyIndex);
};

/**
 * INTELLIGENT CHART GENERATION - Analyzes data to select most relevant columns
 */

function generateChartsFromData(results: any[]) {
  console.log('🎯 Generating charts with intelligent column selection...');
  
  if (results.length === 0) {
    console.log(' No data to generate charts from');
    return { barData: [], pieData: [], columns: { barChartCategory: '', barChartNumeric: '', pieChartCategory: '' } };
  }

  const sampleRow = results[0];
  const columns = Object.keys(sampleRow);
  
  // Deep column analysis
  interface ColumnAnalysis {
    name: string;
    type: 'numeric' | 'categorical' | 'date' | 'text';
    uniqueCount: number;
    nullCount: number;
    sampleValues: any[];
    variance?: number;
    avgLength?: number;
  }
  
  const columnAnalysis: ColumnAnalysis[] = columns.map(col => {
    const values = results.map(row => row[col]);
    const nonNullValues = values.filter(v => v !== '' && v !== null && v !== undefined);
    const uniqueValues = new Set(nonNullValues);
    
    // Detect numeric columns
    const numericValues = nonNullValues.filter(v => !isNaN(Number(v))).map(Number);
    const isNumeric = numericValues.length > nonNullValues.length * 0.7;
    
    // Detect date columns
    const datePatterns = /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{1,2}-\w{3}-\d{4}/;
    const hasDatePattern = nonNullValues.some(v => datePatterns.test(String(v)));
    
    // Calculate variance for numeric columns
    let variance = 0;
    if (isNumeric && numericValues.length > 0) {
      const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      variance = numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length;
    }
    
    // Average text length for categorical columns
    const avgLength = nonNullValues.reduce((sum, v) => sum + String(v).length, 0) / nonNullValues.length;
    
    let type: 'numeric' | 'categorical' | 'date' | 'text';
    if (hasDatePattern) {
      type = 'date';
    } else if (isNumeric) {
      type = 'numeric';
    } else if (uniqueValues.size < nonNullValues.length * 0.5 && avgLength < 50) {
      type = 'categorical';
    } else {
      type = 'text';
    }
    
    return {
      name: col,
      type,
      uniqueCount: uniqueValues.size,
      nullCount: values.length - nonNullValues.length,
      sampleValues: Array.from(uniqueValues).slice(0, 5),
      variance,
      avgLength
    };
  });
  
  console.log(' Column analysis:', columnAnalysis.map(c => ({
    name: c.name,
    type: c.type,
    unique: c.uniqueCount
  })));
  
  // Score columns for chart relevance
  const scoreColumn = (col: ColumnAnalysis, purpose: 'category' | 'numeric' | 'pie-category') => {
    let score = 0;
    
    if (purpose === 'category') {
      // Good category columns: 3-50 unique values, not too long
      if (col.type === 'categorical') score += 100;
      if (col.uniqueCount >= 3 && col.uniqueCount <= 50) score += 50;
      if (col.uniqueCount > 50 && col.uniqueCount <= 100) score += 20;
      if (col.avgLength && col.avgLength < 30) score += 30;
      if (col.nullCount === 0) score += 20;
      
      // Penalize bad categories
      if (col.uniqueCount > 100) score -= 50;
      if (col.avgLength && col.avgLength > 50) score -= 30;
      if (col.type === 'text') score -= 40;
      
      // Boost common category names
      const categoryKeywords = ['category', 'type', 'status', 'group', 'name', 'class', 'region', 'country', 'city', 'department', 'product', 'brand'];
      if (categoryKeywords.some(kw => col.name.toLowerCase().includes(kw))) score += 40;
      
    } else if (purpose === 'numeric') {
      // Good numeric columns: actual numbers with variance
      if (col.type === 'numeric') score += 100;
      if (col.variance && col.variance > 0) score += 50;
      if (col.nullCount === 0) score += 20;
      
      // Boost common numeric names
      const numericKeywords = ['amount', 'price', 'cost', 'value', 'total', 'sum', 'count', 'quantity', 'revenue', 'sales', 'score', 'rating'];
      if (numericKeywords.some(kw => col.name.toLowerCase().includes(kw))) score += 40;
      
      // Penalize ID-like columns
      if (col.name.toLowerCase().includes('id')) score -= 60;
      if (col.uniqueCount === results.length) score -= 40; // Likely an ID
      
    } else if (purpose === 'pie-category') {
      // Pie charts work best with 3-12 categories
      if (col.type === 'categorical') score += 100;
      if (col.uniqueCount >= 3 && col.uniqueCount <= 12) score += 60;
      if (col.uniqueCount > 12 && col.uniqueCount <= 30) score += 30;
      if (col.avgLength && col.avgLength < 25) score += 30;
      if (col.nullCount === 0) score += 20;
      
      // Penalize
      if (col.uniqueCount > 30) score -= 40;
      if (col.uniqueCount < 3) score -= 40;
      
      // Boost status-like fields
      const statusKeywords = ['status', 'state', 'type', 'category', 'priority', 'level'];
      if (statusKeywords.some(kw => col.name.toLowerCase().includes(kw))) score += 50;
    }
    
    return Math.max(0, score);
  };
  
  // Find best columns for each chart type
  const categoricalCols = columnAnalysis.filter(c => c.type === 'categorical' || c.type === 'date');
  const numericCols = columnAnalysis.filter(c => c.type === 'numeric');
  
  // Select best bar chart columns
  const barCategoryScores = categoricalCols.map(c => ({
    col: c,
    score: scoreColumn(c, 'category')
  })).sort((a, b) => b.score - a.score);
  
  const barNumericScores = numericCols.map(c => ({
    col: c,
    score: scoreColumn(c, 'numeric')
  })).sort((a, b) => b.score - a.score);
  
  const barChartCategory = barCategoryScores[0]?.col.name || columns[0];
  const barChartNumeric = barNumericScores[0]?.col.name || columns[1];
  
  // Select best pie chart column (different from bar category)
  const pieCategoryScores = categoricalCols
    .filter(c => c.name !== barChartCategory)
    .map(c => ({
      col: c,
      score: scoreColumn(c, 'pie-category')
    }))
    .sort((a, b) => b.score - a.score);
  
  const pieChartCategory = pieCategoryScores[0]?.col.name || 
                           categoricalCols.find(c => c.name !== barChartCategory)?.name || 
                           barChartCategory;
  
  console.log('Selected columns:', {
    barChart: { 
      category: barChartCategory, 
      numeric: barChartNumeric,
      categoryScore: barCategoryScores[0]?.score,
      numericScore: barNumericScores[0]?.score
    },
    pieChart: { 
      category: pieChartCategory,
      score: pieCategoryScores[0]?.score
    }
  });
  
  // ===== GENERATE BAR CHART DATA =====
  const barChartMap = new Map<string, number>();
  let barSkippedRows = 0;
  
  results.forEach(row => {
    const category = String(row[barChartCategory] || '').trim();
    const value = parseFloat(row[barChartNumeric]);
    
    if (category && category !== '' && !isNaN(value)) {
      const current = barChartMap.get(category) || 0;
      barChartMap.set(category, current + value);
    } else {
      barSkippedRows++;
    }
  });
  
  const barData = Array.from(barChartMap.entries())
    .map(([xValue, yValue]) => ({ 
      xValue, 
      yValue: Math.round(yValue * 100) / 100
    }))
    .sort((a, b) => b.yValue - a.yValue)
    .slice(0, 15); // Show top 15 for better insights
  
  console.log(`Bar chart: ${barData.length} categories (skipped ${barSkippedRows} rows)`);
  
  // ===== GENERATE PIE CHART DATA =====
  const pieChartMap = new Map<string, number>();
  let pieSkippedRows = 0;
  
  results.forEach(row => {
    const category = String(row[pieChartCategory] || '').trim();
    if (category && category !== '' && category.toLowerCase() !== 'unknown' && category.toLowerCase() !== 'null') {
      const current = pieChartMap.get(category) || 0;
      pieChartMap.set(category, current + 1);
    } else {
      pieSkippedRows++;
    }
  });
  
  // If too many categories, group smaller ones as "Other"
  const pieEntries = Array.from(pieChartMap.entries())
    .sort((a, b) => b[1] - a[1]);
  
  let pieData = pieEntries.slice(0, 8).map(([xValue, value]) => ({ xValue, value }));
  
  // Add "Other" category if there are more entries
  if (pieEntries.length > 8) {
    const otherSum = pieEntries.slice(8).reduce((sum, [_, value]) => sum + value, 0);
    pieData.push({ xValue: 'Other', value: otherSum });
  }
  
  console.log(` Pie chart: ${pieData.length} categories (skipped ${pieSkippedRows} rows)`);
  
  return {
    barData,
    pieData,
    columns: {
      barChartCategory,
      barChartNumeric,
      pieChartCategory
    }
  };
}

export const fileParsing = async (req: Request, res: Response) => {
  let filepath: string | undefined;
  
  try {
    console.time('file-processing');
    
    if (!req.file) {
      return res.status(400).json({ message: 'File Not Uploaded', success: false });
    }

    const file = req.file as Express.Multer.File;
    filepath = file.path;
    const results: any[] = [];
    let headers: string[] = [];
    let totalRows = 0;

    // Parse CSV
    await new Promise<void>((resolve, reject) => {
      const stream = fs.createReadStream(filepath!, { encoding: 'utf-8' })
        .pipe(csv());

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
          resolve();
        });
    });

    console.log(`CSV parsed: ${totalRows} rows, ${headers.length} columns`);
    console.timeEnd('file-processing');

    // Upload to R2
    const fileBuffer = fs.readFileSync(filepath);
    const fileName = `${Date.now()}_${file.originalname}`;

    try {
      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: fileName,
          Body: fileBuffer,
          ContentType: "text/csv",
        })
      );
      console.log('File uploaded to R2:', fileName);
    } catch (err) {
      console.error("R2 upload error:", err);
      throw new Error('R2 upload failed');
    }

    // Clean up temp file
    fs.unlinkSync(filepath);
    filepath = undefined;

    // Public file URL
    const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    // Compute metrics
    const totalColumns = headers.length;
    let missingValues = 0;
    for (const row of results) {
      for (const val of Object.values(row)) {
        if (val === "" || val === null || val === undefined) missingValues++;
      }
    }

    const computedMetrics = {
      total_rows: totalRows,
      total_columns: totalColumns,
      missing_values: missingValues,
    };

    // Save to MongoDB (only first 10 rows for sample)
    const dataset = await dataModel.create({
      data: results.slice(0, 10),
      user_id: req.body.user_id || null,
      chat_id: null,
      chart_id: null,
      r2_url: fileUrl,
    });

    console.log('Dataset saved to MongoDB:', dataset._id);

    // Try AI analysis first, but have reliable fallback
    let aiResponse: any = null;
    
    // Only attempt AI if we have available API keys
    if (apiKeys.length > 0 && apiKeys[0]) {
      console.log('Fetching MCP tools...');
      const tools = await mcpClient.listTools();

      const prompt : any = generateAiPrompt(computedMetrics, dataset, tools);
      let retries = 0;
      const MAX_RETRIES = Math.min(apiKeys.length, 10); // Limit retries to 10

      while (retries < MAX_RETRIES && !aiResponse) {
        try {
          console.log(`Calling Gemini API (attempt ${retries + 1})...`);
          
          const chat = model.startChat({ history: [] });
          let result = await chat.sendMessage(prompt);
          let response = result.response;
          
          let maxIterations = 10;
          let iteration = 0;
          
          while (iteration < maxIterations) {
            const functionCall = response.functionCalls()?.[0];
            
            if (!functionCall) {
              try {
                const responseText = response.text().trim();
                const cleanedText = responseText.replace(/```json\n?|```\n?/g, '').trim();
                aiResponse = JSON.parse(cleanedText);
                console.log(' AI analysis completed successfully');
              } catch (parseErr) {
                console.error(' Failed to parse AI response');
                throw parseErr;
              }
              break;
            }
            
            console.log(` Executing MCP tool: ${functionCall.name}`);
            
            try {
              const toolResult = await mcpClient.call(functionCall.name, functionCall.args);
              
              result = await chat.sendMessage([{
                functionResponse: {
                  name: functionCall.name,
                  response: toolResult
                }
              }]);
              
              response = result.response;
              iteration++;
            } catch (toolErr) {
              console.error(' MCP tool execution failed:', toolErr);
              throw toolErr;
            }
          }
          
          if (iteration >= maxIterations) {
            throw new Error('Max function call iterations reached');
          }
          
          break;
          
        } catch (err: any) {
          const msg = String(err?.message || '');
          
          if (
            err.status === 503 ||
            err.status === 429 ||
            msg.includes('quota') ||
            msg.includes('exceeded') ||
            msg.includes('429')
          ) {
            console.log('  Rate limit reached');
            switchApi();
            retries++;
          } else {
            console.error(' Gemini API error:', err.message);
            break; // Don't retry on other errors
          }
        }
      }
    }

    //  RELIABLE FALLBACK: Generate charts directly from data
    if (!aiResponse) {
      console.log('  Using direct chart generation (most reliable method)');
      
      const { barData, pieData, columns } = generateChartsFromData(results);
      
      console.log(' Chart generation complete:', {
        barChartPoints: barData.length,
        pieChartPoints: pieData.length
      });
      
      aiResponse = {
        metrics: {
          total_rows: totalRows,
          total_columns: totalColumns,
          missing_values: missingValues,
          charts_generated: 2
        },
        charts: [
          {
            type: 'bar',
            title: `${columns.barChartNumeric} by ${columns.barChartCategory}`,
            x: columns.barChartCategory,
            y: columns.barChartNumeric,
            data: barData
          },
          {
            type: 'pie',
            title: `Distribution by ${columns.pieChartCategory}`,
            x: columns.pieChartCategory,
            y: 'count',
            data: pieData
          }
        ],
        summary: [
          `Dataset contains ${totalRows.toLocaleString()} rows across ${totalColumns} columns`,
          `${missingValues.toLocaleString()} missing values detected (${((missingValues / (totalRows * totalColumns)) * 100).toFixed(1)}%)`,
          `Top category in bar chart: ${barData[0]?.xValue || 'N/A'}`,
          `Most common value: ${pieData[0]?.xValue || 'N/A'} (${pieData[0]?.value || 0} occurrences)`
        ],
        key_fields: Object.keys(results[0]).slice(0, 5)
      };
      
      console.log(' Analysis generated successfully with direct method');
    }

    // Validate response structure
    if (!aiResponse.metrics || !aiResponse.charts || !Array.isArray(aiResponse.charts)) {
      console.error(' Invalid AI response structure:', aiResponse);
      throw new Error('AI response missing required fields');
    }

    // Final data quality check
    console.log(' Final response summary:', {
      totalRows: aiResponse.metrics.total_rows,
      charts: aiResponse.charts.length,
      barChartData: aiResponse.charts[0]?.data?.length || 0,
      pieChartData: aiResponse.charts[1]?.data?.length || 0
    });

    // Return response matching frontend expectations
    return res.status(200).json({
      success: true,
      message: "Dataset processed successfully",
      datasetId: dataset._id,
      r2Url: fileUrl,
      data: {
        metrics: {
          total_rows: aiResponse.metrics.total_rows,
          total_columns: aiResponse.metrics.total_columns,
          missing_values: aiResponse.metrics.missing_values,
          charts_generated: aiResponse.charts.length
        },
        charts: aiResponse.charts,
        summary: aiResponse.summary || [],
        key_fields: aiResponse.key_fields || []
      }
    });

  } catch (err) {
    console.error(' File parsing error:', err);
    
    // Clean up temp file on error
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    
    const error = new CustomError({ 
      errorData: err instanceof Error ? err.message : String(err), 
      statusCode: 500 
    });
    
    return res.status(error.statusCode).json({
      success: false,
      message: 'Dataset processing failed',
      error: error.errorData
    });
  }
};