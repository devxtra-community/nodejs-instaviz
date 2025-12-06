// utils/chartInterpreter

import type { Aggregations } from "./streamAggregations";

export interface ChartIntent {
  valid: boolean;
  type: "bar" | "pie" | "line" | null;
  category: string | null;
  numeric: string | null;
}

// INTERPRET AI CHART REQUEST
export function interpretChartRequest(
  chartReq: any,
  aggregations: Aggregations
): ChartIntent {
  if (!chartReq) {
    return { valid: false, type: null, category: null, numeric: null };
  }

  const category = chartReq.category?.trim() || null;
  const numeric = chartReq.numeric?.trim() || null;
  const type = chartReq.chart_type || null;

  // Validate columns exist in dataset
  const allCols = [
    ...Object.keys(aggregations.categorical),
    ...Object.keys(aggregations.numeric),
  ];

  const isValidCategory = category && allCols.includes(category);
  const isValidNumeric =
    !numeric || Object.keys(aggregations.numeric).includes(numeric);

  if (!type || !isValidCategory) {
    return { valid: false, type: null, category: null, numeric: null };
  }

  // type now supports line
  if (!["bar", "pie", "line"].includes(type)) {
    return { valid: false, type: null, category: null, numeric: null };
  }

  return {
    valid: true,
    type,
    category,
    numeric,
  };
}

// UNIVERSAL FALLBACK CHART GENERATOR
export function fallbackChartGenerator(
  intent: ChartIntent,
  aggregations: Aggregations
) {
  const { type, category, numeric } = intent;

  //  PIE 
  if (type === "pie") {
    const cat = aggregations.categorical[category!];
    if (!cat)
      return { type: "pie", title: `Distribution of ${category}`, x: category!, data: [] };

    const rows = Object.entries(cat.counts).map(([name, count]) => ({
      xValue: name,
      value: Number(count),
    }));

    return {
      type: "pie",
      title: `Distribution of ${category}`,
      x: category!,
      data: rows,
    };
  }

  //  BAR 
  if (type === "bar") {
    let yCol = numeric;

    if (!yCol || yCol === "count") {
      yCol = Object.keys(aggregations.numeric)[0]; // default numeric column
    }

    const cat = aggregations.categorical[category!];
    if (!cat)
      return {
        type: "bar",
        title: `${yCol} by ${category}`,
        x: category!,
        y: yCol!,
        data: [],
      };

    const rows = Object.entries(cat.counts).map(([name, count]) => ({
      xValue: name,
      yValue: count,
    }));

    return {
      type: "bar",
      title: `${yCol} by ${category}`,
      x: category!,
      y: yCol!,
      data: rows,
    };
  }

  //  LINE (NEW) 
  if (type === "line") {
    let yCol = numeric;

    if (!yCol || yCol === "count") {
      yCol = Object.keys(aggregations.numeric)[0];
    }

    const cat = aggregations.categorical[category!];
    if (!cat)
      return {
        type: "line",
        title: `${yCol} Trend by ${category}`,
        x: category!,
        y: yCol!,
        data: [],
      };

    // Turn categorical distribution into a time-like series
    const rows = Object.entries(cat.counts).map(([name, count]) => ({
      xValue: name,
      yValue: count,
    }));

    return {
      type: "line",
      title: `${yCol} Trend for ${category}`,
      x: category!,
      y: yCol!,
      data: rows,
    };
  }

  return null;
}
