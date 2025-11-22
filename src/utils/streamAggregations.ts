// utils/streamAggregations.ts
export type Row = Record<string, any>;

export type NumericSummary = {
  sum: number;
  min: number;
  max: number;
  count: number; // valid numeric entries
  missing: number;
  unique: Set<string>;
};

export type CategoricalSummary = {
  counts: Map<string, number>;
  missing: number;
  unique: Set<string>;
};

export type StreamingAggState = {
  rowCount: number;
  numericCols: Set<string>;
  categoricalCols: Set<string>;
  columnDetectionLimit: number;
  detectionSamples: number;
  numeric: Record<string, NumericSummary>;
  categorical: Record<string, CategoricalSummary>;
};

const tryParseNumber = (v: any) => {
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim();
  if (!s) return NaN;
  const cleaned = s.replace(/,/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
};

export const initStreamingAgg = (): StreamingAggState => {
  return {
    rowCount: 0,
    numericCols: new Set(),
    categoricalCols: new Set(),
    detectionSamples: 0,
    columnDetectionLimit: 500, // auto-detect numeric vs categorical using first 500 rows 
    numeric: {},
    categorical: {},
  };
};

const detectColumnTypes = (state: StreamingAggState, row: Row) => {
  state.detectionSamples++;

  const cols = Object.keys(row);
  for (const col of cols) {
    const val = row[col];
    const n = tryParseNumber(val);

    if (!state.numeric[col]) {
      state.numeric[col] = {
        sum: 0,
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
        count: 0,
        missing: 0,
        unique: new Set(),
      };
    }
    if (!state.categorical[col]) {
      state.categorical[col] = {
        counts: new Map(),
        missing: 0,
        unique: new Set(),
      };
    }

    if (!Number.isNaN(n)) {
      state.numericCols.add(col);
    } else {
      state.categoricalCols.add(col);
    }
  }
};

const finalizeColumnTypes = (state: StreamingAggState) => {
  for (const col of state.numericCols) state.categoricalCols.delete(col);
};

export const updateStreamingAgg = (state: StreamingAggState, row: Row) => {
  state.rowCount++;

  if (state.detectionSamples < state.columnDetectionLimit) {
    detectColumnTypes(state, row);
    return; // don’t aggregate yet until types are detected
  }

  // lock types after detection phase
  if (state.detectionSamples === state.columnDetectionLimit) {
    finalizeColumnTypes(state);
  }

  // Now do full aggregation
  for (const col of Object.keys(row)) {
    const raw = row[col];
    const trimmed = raw === null || raw === undefined ? "" : String(raw).trim();

    if (state.numericCols.has(col)) {
      const n = tryParseNumber(raw);
      const ref = state.numeric[col];

      if (Number.isNaN(n)) {
        ref.missing++;
      } else {
        ref.sum += n;
        ref.count++;
        if (n < ref.min) ref.min = n;
        if (n > ref.max) ref.max = n;
        ref.unique.add(trimmed);
      }
    } else {
      const ref = state.categorical[col];

      if (!trimmed) {
        ref.missing++;
      } else {
        const prev = ref.counts.get(trimmed) || 0;
        ref.counts.set(trimmed, prev + 1);
        ref.unique.add(trimmed);
      }
    }
  }
};

export const finalizeStreamingAgg = (state: StreamingAggState) => {
  const finalNumeric: any = {};
  for (const col of state.numericCols) {
    const ref = state.numeric[col];
    finalNumeric[col] = {
      sum: ref.sum,
      min: ref.min === Infinity ? 0 : ref.min,
      max: ref.max === -Infinity ? 0 : ref.max,
      avg: ref.count > 0 ? ref.sum / ref.count : 0,
      count: ref.count,
      missing: ref.missing,
      unique_count: ref.unique.size,
    };
  }

  const finalCategorical: any = {};
  for (const col of state.categoricalCols) {
    const ref = state.categorical[col];
    const entries = [...ref.counts.entries()].sort((a, b) => b[1] - a[1]);

    finalCategorical[col] = {
      counts: Object.fromEntries(entries),
      unique_count: ref.unique.size,
      missing: ref.missing,
      top_values: entries.slice(0, 10).map(([value, count]) => ({ value, count })),
    };
  }

  return {
    numeric: finalNumeric,
    categorical: finalCategorical,
    meta: {
      total_rows: state.rowCount,
      total_columns: state.numericCols.size + state.categoricalCols.size,
    },
  };
};

export type Aggregations = ReturnType<typeof finalizeStreamingAgg>;

