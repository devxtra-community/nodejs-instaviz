// utils/fallbackCharts.ts

export function generateChartsFromData(rows: any[]) {
  console.log(" Fallback: Generating charts ...");

  if (!rows || rows.length === 0) {
    return {
      barData: [],
      pieData: [],
      columns: {
        barChartCategory: "",
        barChartNumeric: "",
        pieChartCategory: "",
      },
    };
  }

  const sample = rows[0];
  const columns = Object.keys(sample);

  type ColumnType = "numeric" | "categorical" | "date" | "text";

  interface ColumnAnalysis {
    name: string;
    type: ColumnType;
    uniqueCount: number;
    nullCount: number;
    variance: number;
    avgLength: number;
    sampleValues: any[];
  }

  const analyses: ColumnAnalysis[] = columns.map((col) => {
    const values = rows.map((r) => r[col]);

    const nonNull = values.filter(
      (v) => v !== "" && v !== null && v !== undefined
    );

    const unique = new Set(nonNull);

    const numericValues = nonNull                                                                                                                                                                                                    
      .map((v) => Number(String(v).replace(/,/g, "")))
      .filter((v) => !isNaN(v));

    const isNumeric = numericValues.length >= nonNull.length * 0.6;

    const dateRegex =
      /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{1,2}-\w{3}-\d{4}/;

    const hasDatePattern = nonNull.some((v) => dateRegex.test(String(v)));

    let type: ColumnType = "text";
    if (hasDatePattern) type = "date";
    else if (isNumeric) type = "numeric";
    else if (unique.size <= nonNull.length * 0.5) type = "categorical";

    // Variance
    let variance = 0;
    if (numericValues.length > 0) {
      const mean =
        numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      variance =
        numericValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
        numericValues.length;
    }

    const avgLength =
      nonNull.reduce((sum, v) => sum + String(v).length, 0) /
      (nonNull.length || 1);

    return {
      name: col,
      type,
      uniqueCount: unique.size,
      nullCount: values.length - nonNull.length,
      variance,
      avgLength,
      sampleValues: [...unique].slice(0, 5),
    };
  });

  // ----------- SCORING LOGIC -----------

  const scoreColumn = (c: ColumnAnalysis, mode: "cat" | "num" | "pie") => {
    let score = 0;

    if (mode === "cat") {
      if (c.type === "categorical") score += 100;
      if (c.uniqueCount >= 3 && c.uniqueCount <= 80) score += 60;
      if (c.avgLength < 40) score += 20;

      const keywords = [
        "category",
        "type",
        "status",
        "name",
        "region",
        "title",
      ];
      if (keywords.some((k) => c.name.toLowerCase().includes(k))) score += 40;
    }

    if (mode === "num") {
      if (c.type === "numeric") score += 100;
      if (c.variance > 0) score += 40;

      const numericKeywords = [
        "value",
        "amount",
        "price",
        "total",
        "count",
        "score",
      ];
      if (numericKeywords.some((k) => c.name.toLowerCase().includes(k)))
        score += 40;

      // penalize IDs
      if (c.name.toLowerCase().includes("id")) score -= 80;
    }

    if (mode === "pie") {
      if (c.type === "categorical") score += 100;
      if (c.uniqueCount >= 3 && c.uniqueCount <= 20) score += 60;
      if (c.uniqueCount > 20 && c.uniqueCount <= 50) score += 20;

      if (c.avgLength < 20) score += 20;

      const keywords = ["status", "type", "category", "level"];
      if (keywords.some((k) => c.name.toLowerCase().includes(k))) score += 40;
    }

    return Math.max(score, 0);
  };

  // Select best category column
  const bestCategory = analyses
    .map((c) => ({ col: c.name, score: scoreColumn(c, "cat") }))
    .sort((a, b) => b.score - a.score)[0]?.col;

  const bestNumeric = analyses
    .map((c) => ({ col: c.name, score: scoreColumn(c, "num") }))
    .sort((a, b) => b.score - a.score)[0]?.col;

  const bestPieCategory = analyses
    .filter((c) => c.name !== bestCategory)
    .map((c) => ({ col: c.name, score: scoreColumn(c, "pie") }))
    .sort((a, b) => b.score - a.score)[0]?.col;

  // -------- BAR CHART --------
  const barMap = new Map<string, number>();

  rows.forEach((r) => {
    const cat = String(r[bestCategory] || "").trim();
    const num = Number(String(r[bestNumeric]).replace(/,/g, ""));
    if (!cat || isNaN(num)) return;

    barMap.set(cat, (barMap.get(cat) || 0) + num);
  });

  const barData = [...barMap.entries()]
    .map(([xValue, yValue]) => ({ xValue, yValue }))
    .sort((a, b) => b.yValue - a.yValue)
    .slice(0, 15);

  // -------- PIE CHART --------
  const pieMap = new Map<string, number>();

  rows.forEach((r) => {
    const cat = String(r[bestPieCategory] || "").trim();
    if (!cat) return;
    pieMap.set(cat, (pieMap.get(cat) || 0) + 1);
  });

  let pieEntries = [...pieMap.entries()].sort((a, b) => b[1] - a[1]);

  let pieData = pieEntries.slice(0, 8).map(([xValue, value]) => ({
    xValue,
    value,
  }));

  if (pieEntries.length > 8) {
    const other = pieEntries
      .slice(8)
      .reduce((sum, [, v]) => sum + v, 0);

    pieData.push({ xValue: "Other", value: other });
  }

  return {
    barData,
    pieData,
    columns: {
      barChartCategory: bestCategory,
      barChartNumeric: bestNumeric,
      pieChartCategory: bestPieCategory,
    },
  };
}
