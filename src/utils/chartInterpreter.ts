// utils/chartInterpreter.ts

import type { Aggregations } from "./streamAggregations";

export interface ChartIntent {
  valid: boolean;
  type: "bar" | "pie" | null;
  category: string | null;
  numeric: string | null;
}

//  INTERPRET AI CHART REQUEST
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

  // Validate columns exist
  const allCols = [
    ...Object.keys(aggregations.categorical),
    ...Object.keys(aggregations.numeric),
  ];

  const isValidCategory = category && allCols.includes(category);
  const isValidNumeric =
    !numeric ||
    (numeric && Object.keys(aggregations.numeric).includes(numeric));

  if (!type || !isValidCategory) {
    return { valid: false, type: null, category: null, numeric: null };
  }

  return {
    valid: true,
    type: type,
    category,
    numeric: numeric,
  };
}

//    RELIABLE FALLBACK CHART BUILDER
//    Always builds a fallback chart using full CSV aggregations
export function fallbackChartGenerator(
  intent: ChartIntent,
  aggregations: Aggregations
) {
  const { type, category, numeric } = intent;

  
  // PIE CHART
  
  if (type === "pie") {
    const cat = aggregations.categorical[category!];

    if (!cat)
      return {
        type: "pie",
        title: `Distribution of ${category}`,
        x: category!,
        data: [],
      };

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

  
  // BAR CHART
  
  if (type === "bar") {
    let yCol = numeric;

    // If AI requested "count", use first numeric column
    if (!yCol || yCol === "count") {
      yCol = Object.keys(aggregations.numeric)[0];
    }

    const values = aggregations.categorical[category!];
    const numericStats = aggregations.numeric[yCol!];

    const rows = Object.entries(values.counts).map(([name, count]) => ({
      xValue: name,
      yValue: count, // not sum — this is more useful
    }));

    return {
      type: "bar",
      title: `${yCol} by ${category}`,
      x: category!,
      y: yCol!,
      data: rows,
    };
  }

  return null;
}
