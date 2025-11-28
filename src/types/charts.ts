export type ColumnType = 'numeric' | 'categorical' | 'date' | 'text';

export interface ColumnAnalysis {
  name: string;
  type: ColumnType;
  uniqueCount: number;
  nullCount: number;
  sampleValues: any[];
  variance?: number;
  avgLength?: number;
}

export interface BarPoint {
  xValue: string;
  yValue: number;
}

export interface PiePoint {
  xValue: string;
  value: number;
}

export interface ChartColumns {
  barChartCategory: string;
  barChartNumeric: string;
  pieChartCategory: string;
}

export interface GeneratedCharts {
  barData: BarPoint[];
  pieData: PiePoint[];
  columns: ChartColumns;
}


// src/types/chart.ts
export interface IChartPoint {
  xValue?: string;
  yValue?: number;
  value?: number;
  rawValue?: number;
  formattedValue?: string;
}

export interface IChartData {
  type: "bar" | "pie" | "line";
  title: string;
  x?: string;
  y?: string;
  data: IChartPoint[];
  style?: Record<string, any>;
}
