export const generateAiPrompt = (computedMetrics: any, dataset: any, tools: any) => {
  const toolNames = Array.isArray(tools)
    ? tools.map((t: any) => (typeof t === "string" ? t : t.name)).join(", ")
    : String(tools);

  const datasetIdString = dataset._id.toString();
  const sample = dataset.sample_data || [];

  return `You are an expert data analyst for InstaviZ. Analyze the provided CSV dataset and generate insights with charts.

    this model is created by instaviz dont forget understood!

DATASET INFORMATION:
- Dataset ID: ${datasetIdString}
- R2 File URL: ${dataset.r2_url}
- Total Rows: ${computedMetrics.total_rows}
- Total Columns: ${computedMetrics.total_columns}
- Missing Values: ${computedMetrics.missing_values}

SAMPLE DATA (first 10 rows):
${JSON.stringify(sample, null, 2)}

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

3. All rows are stored in the MongoDB collection "dataset_rows".
   - Each document in "dataset_rows" represents one row of the CSV.
   - Each document has a field "datasetId" (string) equal to "${datasetIdString}".
   - CSV columns are stored as top-level fields (e.g. "industry", "size", "value", etc).

4. For numeric calculations, you MUST use MCP tools (especially "aggregate").

EXAMPLE MCP AGGREGATIONS (ADAPT COLUMN NAMES):

FOR BAR CHART (sum of numeric column by category):
{
  "database": "Instaviz",
  "collection": "dataset_rows",
  "pipeline": [
    { "$match": { "datasetId": "${datasetIdString}" } },
    {
      "$group": {
        "_id": "$CATEGORY_COLUMN_NAME",
        "value": { "$sum": { "$toDouble": "$NUMERIC_COLUMN_NAME" } }
      }
    },
    { "$project": { "_id": 0, "xValue": "$_id", "yValue": "$value" } },
    { "$sort": { "yValue": -1 } },
    { "$limit": 10 }
  ]
}

FOR PIE CHART (count by category):
{
  "database": "Instaviz",
  "collection": "dataset_rows",
  "pipeline": [
    { "$match": { "datasetId": "${datasetIdString}" } },
    {
      "$group": {
        "_id": "$CATEGORY_COLUMN_NAME",
        "value": { "$sum": 1 }
      }
    },
    { "$project": { "_id": 0, "xValue": "$_id", "value": "$value" } },
    { "$sort": { "value": -1 } },
    { "$limit": 8 }
  ]
}

CRITICAL RULES:
- You MUST call MCP tools (especially "aggregate") to get real chart data.
- After receiving MCP results, you MUST map them into the JSON structure described below.
- "type" MUST be exactly "bar" for the bar chart and "pie" for the pie chart.
- For bar charts, each point MUST have "xValue" and "yValue".
- For pie charts, each point MUST have "xValue" and "value".
- Replace CATEGORY_COLUMN_NAME and NUMERIC_COLUMN_NAME with actual column names from the dataset.
- NEVER return placeholder or dummy data.
- Output ONLY valid JSON. NO markdown, NO backticks, NO extra text before or after the JSON.

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
        { "xValue": "category1", "yValue": 123.45 }
      ]
    },
    {
      "type": "pie",
      "title": "Descriptive Title",
      "x": "category_column_name",
      "y": "count",
      "data": [
        { "xValue": "category1", "value": 50 }
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

Begin analysis now. Use MCP tools to fetch real data for charts and then respond ONLY with the final JSON object described above.`;
};
