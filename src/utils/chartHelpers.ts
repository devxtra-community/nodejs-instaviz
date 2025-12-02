import type { Aggregations } from "./streamAggregations";

export type FinalChart = {
  type: "bar" | "pie" | "line";
  title: string;
  x: string;
  y?: string;
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
      const yCol =
        chart.y && chart.y !== "count"
          ? chart.y
          : Object.keys(aggregations.numeric)[0];

      const cat = aggregations.categorical[xCol];
      if (!cat) continue;

      const rows = Object.entries(cat.counts).map(([label, count]) => ({
        xValue: label,
        yValue: Number(count), // <-- FIXED (no more unknown)
      }));

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
      const xCol = chart.x;
      const cat = aggregations.categorical[xCol];
      if (!cat) continue;

      const rows = Object.entries(cat.counts).map(([name, count]) => ({
        xValue: name,
        value: Number(count), // <-- FIXED
      }));

      finalCharts.push({
        type: "pie",
        title: chart.title,
        x: xCol,
        data: rows,
      });
    }

    // LINE CHART
    if (chart.type === "line") {
      const xCol = chart.x;
      const yCol = chart.y;

      const cat = aggregations.categorical[xCol];
      if (!cat) continue;

      const rows = Object.entries(cat.counts).map(([label, count]) => ({
        xValue: label,
        yValue: Number(count),
      }));

      finalCharts.push({
        type: "line",
        title: chart.title,
        x: xCol,
        y: yCol,
        data: rows,
      });
    }
  }


  return finalCharts;
}
