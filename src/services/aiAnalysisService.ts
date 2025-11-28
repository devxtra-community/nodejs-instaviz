// services/aiAnalysisService.ts

import { generateAiPrompt } from "../utils/aiPrompt";
import mcpClient from "../services/mcpClient";
import { generateChartsFromData } from "./chartGenerator";

// import your central model + API switching
import { getModel, switchApi, getApiKeyCount } from "./switchingApi";

export async function analyzeDatasetWithAiOrFallback(
  computedMetrics: { total_rows: number; total_columns: number; missing_values: number },
  dataset: any,
  results: any[]
) {
  let aiResponse = null;

  const tools = await mcpClient.listTools();
  const prompt = generateAiPrompt(computedMetrics, dataset, tools);

  let attempts = 0;

  while (attempts < getApiKeyCount() && !aiResponse) {
    try {
      const model = getModel();
      const chat = model.startChat({ history: [] });

      let result = await chat.sendMessage(prompt);
      let response = result.response;

      let iteration = 0;

      while (iteration < 10) {
        const fn = response.functionCalls()?.[0];
        if (!fn) break;

        const toolResult = await mcpClient.call(fn.name, fn.args);

        const next = await chat.sendMessage([
          {
            functionResponse: {
              name: fn.name,
              response: toolResult,
            },
          },
        ]);

        response = next.response;
        iteration++;
      }

      const text = response.text().trim().replace(/```json|```/g, "");
      aiResponse = JSON.parse(text);

      console.log("AI analysis completed with key", attempts + 1);
    } catch (err: any) {
      const msg = String(err?.message || "");
      console.log("Gemini error:", msg);

      if (
        msg.includes("quota") ||
        msg.includes("429") ||
        msg.includes("exceeded") ||
        err.status === 503
      ) {
        console.log("Rate limit  switching key...");
        switchApi();
        attempts++;
        continue;
      }

      console.log("Non-limit AI error  stopping.");
      break;
    }
  }
  if (!aiResponse) {
  console.log("Fallback → local chart + intelligent insight generation");

  const { barData, pieData, columns } = generateChartsFromData(results);

  // Basic metrics
  const totalRows = computedMetrics.total_rows;
  const totalCols = computedMetrics.total_columns;
  const missing = computedMetrics.missing_values;

  // Chart info
  const topBar = barData[0];
  const topPie = pieData[0];

  // Detect imbalance
  const pieTotal = pieData.reduce((s, p) => s + p.value, 0);
  const pieDominance =
    topPie && pieTotal > 0 ? (topPie.value / pieTotal) * 100 : 0;

  // Detect if numeric column is skewed / high variance
  const numericCols = results.length
    ? Object.keys(results[0]).filter((c) =>
        results.some((r) => !isNaN(Number(r[c])))
      )
    : [];

  let skewNotes : any = [];
  numericCols.forEach((col) => {
    const nums = results
      .map((r) => Number(r[col]))
      .filter((n) => !isNaN(n));
    if (nums.length < 5) return;

    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const max = Math.max(...nums);
    const min = Math.min(...nums);

    if (max > mean * 4) {
      skewNotes.push(`${col} has very large outliers.`);
    }
    if (min < mean * 0.25) {
      skewNotes.push(`${col} is highly left-skewed.`);
    }
  });

  // Build human-quality summary
  const summary = [
    `Your dataset contains ${totalRows} rows and ${totalCols} columns, giving enough data for reliable analysis.`,

    missing > 0
      ? `There are ${missing} missing values, indicating that some cleaning or preprocessing may improve accuracy.`
      : `No missing values detected — the dataset appears clean and consistent.`,

    topBar
      ? `In the bar chart analysis, ${topBar.xValue} contributes the most with a total of ${topBar.yValue}, making it the most influential category for numeric trends.`
      : `Not enough numeric/categorical combinations found to generate a bar insight.`,

    topPie
      ? `In the category distribution, ${topPie.xValue} is the dominant group with ${topPie.value} occurrences, representing ${pieDominance.toFixed(
          1
        )}% of all records.`
      : `Pie distribution could not identify strong category groupings.`,

    pieDominance > 60
      ? `The dataset has high category imbalance, meaning one category dominates the distribution.`
      : pieDominance > 30
      ? `Category distribution shows moderate imbalance, with a few categories standing out.`
      : `Category distribution appears balanced without extreme dominance.`,

    skewNotes.length > 0
      ? `Notable numeric anomalies: ${skewNotes.join(" ")}`
      : `Numeric columns appear evenly distributed without strong outliers.`,

    `Key fields that provide the most insight: ${Object.keys(results[0])
      .slice(0, 5)
      .join(", ")}.`,
  ];

  aiResponse = {
    metrics: computedMetrics,

    charts: [
      {
        type: "bar",
        title: `${columns.barChartNumeric} by ${columns.barChartCategory}`,
        description: `Visualizes how ${columns.barChartNumeric} values change across different ${columns.barChartCategory} groups.`,
        x: columns.barChartCategory,
        y: columns.barChartNumeric,
        data: barData,
        style: { layout: "vertical", limit: 15 },
      },
      {
        type: "pie",
        title: `Distribution of ${columns.pieChartCategory}`,
        description: `Shows the proportion of records by ${columns.pieChartCategory}, helping highlight dominant categories.`,
        x: columns.pieChartCategory,
        y: "count",
        data: pieData,
        style: { showLabels: true, showLegend: true },
      },
    ],

    summary: summary.filter(Boolean), // remove empty items

    key_fields: Object.keys(results[0] || {}).slice(0, 5),
  };
}


  return aiResponse;
}
