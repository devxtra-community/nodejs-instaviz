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
        console.log("Rate limit → switching key...");
        switchApi();
        attempts++;
        continue;
      }

      console.log("Non-limit AI error → stopping.");
      break;
    }
  }

  if (!aiResponse) {
    console.log("Fallback → local chart generation");

    const { barData, pieData, columns } = generateChartsFromData(results);

    aiResponse = {
      metrics: computedMetrics,
      charts: [
        {
          type: "bar",
          title: `${columns.barChartNumeric} by ${columns.barChartCategory}`,
          x: columns.barChartCategory,
          y: columns.barChartNumeric,
          data: barData,
        },
        {
          type: "pie",
          title: `Distribution by ${columns.pieChartCategory}`,
          x: columns.pieChartCategory,
          y: "count",
          data: pieData,
        },
      ],
      summary: ["Local chart analysis used due to AI failure."],
      key_fields: Object.keys(results[0]).slice(0, 5),
    };
  }

  return aiResponse;
}
