import type { Aggregations } from "./streamAggregations";

export type FinalChart = {
  type: "bar" | "pie";
  title: string;
  x: string;          // category column (for both bar & pie)
  y?: string;         // numeric column (bar only)
  data: Array<{ xValue: string; yValue?: number; value?: number }>;
};

export function generateChartData(
  aiCharts: any[] | null,
  aggregations: Aggregations
): FinalChart[] {
  if (!aiCharts || aiCharts.length === 0) return [];

  const finalCharts: FinalChart[] = [];

  for (const chart of aiCharts) {
    if (chart.type !== "bar" && chart.type !== "pie") continue;

    // BAR CHART
    if (chart.type === "bar") {
      const xCol = chart.x;
      let yCol = chart.y;

      // If AI used "count", FIX IT → use real numeric field
      if (yCol === "count") {
        // choose first numeric column instead
        yCol = Object.keys(aggregations.numeric)[0];
      }

      const rows = Object.entries(aggregations.numeric).map(
        ([colName, stats]: any) => ({
          xValue: colName,
          yValue: Number(stats.sum || 0),
        })
      );

      finalCharts.push({
        type: "bar",
        title: chart.title,
        x: xCol,
        y: yCol,
        data: rows,
      });
    }

    // PIE CHART
    if (chart.type === "pie") {
      const xCol = chart.label; // AI uses "label" but frontend uses "x"

      const cat = aggregations.categorical[xCol];
      if (!cat) continue;

      const rows = Object.entries(cat.counts).map(([name, count]) => ({
        xValue: name,
        value: Number(count),
      }));

      finalCharts.push({
        type: "pie",
        title: chart.title,
        x: xCol,
        data: rows,
      });
    }
  }

  return finalCharts;
}
