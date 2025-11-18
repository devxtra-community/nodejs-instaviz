export const generateAiPrompt = (computedMetrics: any, dataset: any, tools: any) => {
  // Extract tool names from tool details
  const toolNames = Array.isArray(tools) 
    ? tools.map((t: any) => typeof t === 'string' ? t : t.name).join(", ")
    : String(tools);

  return `You are an expert data analyst for InstaviZ. Analyze the provided CSV dataset and generate insights with charts.

DATASET INFORMATION:
- Dataset ID: ${dataset._id}
- R2 File URL: ${dataset.r2_url}
- Total Rows: ${computedMetrics.total_rows}
- Total Columns: ${computedMetrics.total_columns}
- Missing Values: ${computedMetrics.missing_values}

SAMPLE DATA (first 10 rows):
${JSON.stringify(dataset.data, null, 2)}

AVAILABLE MCP TOOLS:
${toolNames}

INSTRUCTIONS:
1. Analyze the dataset structure and identify:
   - Categorical columns (for grouping)
   - Numerical columns (for aggregation)
   - Key fields and patterns

2. Generate TWO charts:
   a) BAR CHART: Use categorical grouping with numerical aggregation
   b) PIE CHART: Use categorical grouping with counts

3. For numeric calculations, you MUST use MCP tools (mdb_aggregate or mdb_query).

4. Use this MCP query structure for aggregations:

FOR BAR CHART (sum/avg of numeric column by category):
{
  "database": "Instaviz",
  "collection": "datas",
  "pipeline": [
    { "$match": { "_id": "${dataset._id}" }},
    { "$unwind": "$data" },
    {
      "$group": {
        "_id": "$data.CATEGORY_COLUMN_NAME",
        "value": { "$sum": { "$toDouble": "$data.NUMERIC_COLUMN_NAME" }}
      }
    },
    { "$project": { "xValue": "$_id", "yValue": "$value", "_id": 0 }},
    { "$sort": { "yValue": -1 }},
    { "$limit": 10 }
  ]
}

FOR PIE CHART (count by category):
{
  "database": "Instaviz",
  "collection": "datas",
  "pipeline": [
    { "$match": { "_id": "${dataset._id}" }},
    { "$unwind": "$data" },
    {
      "$group": {
        "_id": "$data.CATEGORY_COLUMN_NAME",
        "value": { "$sum": 1 }
      }
    },
    { "$project": { "xValue": "$_id", "value": "$value", "_id": 0 }},
    { "$sort": { "value": -1 }},
    { "$limit": 8 }
  ]
}

CRITICAL RULES:
- Call MCP tools (mdb_aggregate) to get real chart data
- After receiving MCP results, format them into the JSON structure below
- Replace CATEGORY_COLUMN_NAME and NUMERIC_COLUMN_NAME with actual column names from the dataset
- NEVER return placeholder or dummy data
- Output ONLY valid JSON (no markdown, no backticks)

REQUIRED OUTPUT FORMAT:
{
  "metrics": {
    "total_rows": ${computedMetrics.total_rows},
    "total_columns": ${computedMetrics.total_columns},
    "missing_values": ${computedMetrics.missing_values},
    "charts_generated": 2
  },
  "charts": [
    {
      "type": "bar",
      "title": "Descriptive Title",
      "x": "category_column_name",
      "y": "numeric_column_name",
      "data": [
        { "xValue": "category1", "yValue": 123.45 },
        { "xValue": "category2", "yValue": 67.89 }
      ]
    },
    {
      "type": "pie",
      "title": "Descriptive Title",
      "x": "category_column_name",
      "y": "count",
      "data": [
        { "xValue": "category1", "value": 50 },
        { "xValue": "category2", "value": 30 }
      ]
    }
  ],
  "summary": [
    "Key insight 1 about the data",
    "Key insight 2 about patterns",
    "Key insight 3 about trends"
  ],
  "key_fields": ["field1", "field2", "field3"]
}

Begin analysis. Use MCP tools to fetch real data for charts.`;
};