import { GeneratedCharts, ColumnAnalysis } from '../types/charts';

export function generateChartsFromData(results: any[]): GeneratedCharts {
  console.log('Generating charts with intelligent column selection...');

  if (results.length === 0) {
    console.log(' No data to generate charts from');
    return { 
      barData: [], 
      pieData: [], 
      columns: { barChartCategory: '', barChartNumeric: '', pieChartCategory: '' } 
    };
  }

  const sampleRow = results[0];
  const columns = Object.keys(sampleRow);

  const columnAnalysis: ColumnAnalysis[] = columns.map(col => {
    const values = results.map(row => row[col]);
    const nonNullValues = values.filter(v => v !== '' && v !== null && v !== undefined);
    const uniqueValues = new Set(nonNullValues);

    const numericValues = nonNullValues
      .filter(v => !isNaN(Number(v)))
      .map(Number);
    const isNumeric = numericValues.length > nonNullValues.length * 0.7;

    const datePatterns = /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{1,2}-\w{3}-\d{4}/;
    const hasDatePattern = nonNullValues.some(v => datePatterns.test(String(v)));

    let variance = 0;
    if (isNumeric && numericValues.length > 0) {
      const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      variance = numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length;
    }

    const avgLength =
      nonNullValues.reduce((sum, v) => sum + String(v).length, 0) / nonNullValues.length;

    let type: ColumnAnalysis['type'];
    if (hasDatePattern) {
      type = 'date';
    } else if (isNumeric) {
      type = 'numeric';
    } else if (uniqueValues.size < nonNullValues.length * 0.5 && avgLength < 50) {
      type = 'categorical';
    } else {
      type = 'text';
    }

    return {
      name: col,
      type,
      uniqueCount: uniqueValues.size,
      nullCount: values.length - nonNullValues.length,
      sampleValues: Array.from(uniqueValues).slice(0, 5),
      variance,
      avgLength
    };
  });

  console.log(' Column analysis:', columnAnalysis.map(c => ({
    name: c.name,
    type: c.type,
    unique: c.uniqueCount
  })));

  const scoreColumn = (col: ColumnAnalysis, purpose: 'category' | 'numeric' | 'pie-category') => {
    let score = 0;

    if (purpose === 'category') {
      if (col.type === 'categorical') score += 100;
      if (col.uniqueCount >= 3 && col.uniqueCount <= 50) score += 50;
      if (col.uniqueCount > 50 && col.uniqueCount <= 100) score += 20;
      if (col.avgLength && col.avgLength < 30) score += 30;
      if (col.nullCount === 0) score += 20;

      if (col.uniqueCount > 100) score -= 50;
      if (col.avgLength && col.avgLength > 50) score -= 30;
      if (col.type === 'text') score -= 40;

      const categoryKeywords = [
        'category','type','status','group','name','class',
        'region','country','city','department','product','brand'
      ];
      if (categoryKeywords.some(kw => col.name.toLowerCase().includes(kw))) score += 40;

    } else if (purpose === 'numeric') {
      if (col.type === 'numeric') score += 100;
      if (col.variance && col.variance > 0) score += 50;
      if (col.nullCount === 0) score += 20;

      const numericKeywords = [
        'amount','price','cost','value','total','sum','count',
        'quantity','revenue','sales','score','rating'
      ];
      if (numericKeywords.some(kw => col.name.toLowerCase().includes(kw))) score += 40;

      if (col.name.toLowerCase().includes('id')) score -= 60;
      if (col.uniqueCount === results.length) score -= 40;
    } else {
      if (col.type === 'categorical') score += 100;
      if (col.uniqueCount >= 3 && col.uniqueCount <= 12) score += 60;
      if (col.uniqueCount > 12 && col.uniqueCount <= 30) score += 30;
      if (col.avgLength && col.avgLength < 25) score += 30;
      if (col.nullCount === 0) score += 20;

      if (col.uniqueCount > 30) score -= 40;
      if (col.uniqueCount < 3) score -= 40;

      const statusKeywords = ['status','state','type','category','priority','level'];
      if (statusKeywords.some(kw => col.name.toLowerCase().includes(kw))) score += 50;
    }

    return Math.max(0, score);
  };

  const categoricalCols = columnAnalysis.filter(c => c.type === 'categorical' || c.type === 'date');
  const numericCols = columnAnalysis.filter(c => c.type === 'numeric');

  const barCategoryScores = categoricalCols
    .map(c => ({ col: c, score: scoreColumn(c, 'category') }))
    .sort((a, b) => b.score - a.score);

  const barNumericScores = numericCols
    .map(c => ({ col: c, score: scoreColumn(c, 'numeric') }))
    .sort((a, b) => b.score - a.score);

  const barChartCategory = barCategoryScores[0]?.col.name || columns[0];
  const barChartNumeric = barNumericScores[0]?.col.name || columns[1];

  const pieCategoryScores = categoricalCols
    .filter(c => c.name !== barChartCategory)
    .map(c => ({ col: c, score: scoreColumn(c, 'pie-category') }))
    .sort((a, b) => b.score - a.score);

  const pieChartCategory =
    pieCategoryScores[0]?.col.name ||
    categoricalCols.find(c => c.name !== barChartCategory)?.name ||
    barChartCategory;

  console.log('Selected columns:', {
    barChart: { 
      category: barChartCategory, 
      numeric: barChartNumeric,
      categoryScore: barCategoryScores[0]?.score,
      numericScore: barNumericScores[0]?.score
    },
    pieChart: { 
      category: pieChartCategory,
      score: pieCategoryScores[0]?.score
    }
  });

  const barChartMap = new Map<string, number>();
  let barSkippedRows = 0;

  results.forEach(row => {
    const category = String(row[barChartCategory] || '').trim();
    const value = parseFloat(row[barChartNumeric]);

    if (category && !isNaN(value)) {
      const current = barChartMap.get(category) || 0;
      barChartMap.set(category, current + value);
    } else {
      barSkippedRows++;
    }
  });

  const barData = Array.from(barChartMap.entries())
    .map(([xValue, yValue]) => ({ 
      xValue, 
      yValue: Math.round(yValue * 100) / 100
    }))
    .sort((a, b) => b.yValue - a.yValue)
    .slice(0, 15);

  console.log(`Bar chart: ${barData.length} categories (skipped ${barSkippedRows} rows)`);

  const pieChartMap = new Map<string, number>();
  let pieSkippedRows = 0;

  results.forEach(row => {
    const category = String(row[pieChartCategory] || '').trim();
    if (category && !['unknown','null'].includes(category.toLowerCase())) {
      const current = pieChartMap.get(category) || 0;
      pieChartMap.set(category, current + 1);
    } else {
      pieSkippedRows++;
    }
  });

  const pieEntries = Array.from(pieChartMap.entries())
    .sort((a, b) => b[1] - a[1]);

  let pieData = pieEntries.slice(0, 8).map(([xValue, value]) => ({ xValue, value }));

  if (pieEntries.length > 8) {
    const otherSum = pieEntries.slice(8).reduce((sum, [_, value]) => sum + value, 0);
    pieData.push({ xValue: 'Other', value: otherSum });
  }

  console.log(` Pie chart: ${pieData.length} categories (skipped ${pieSkippedRows} rows)`);

  return {
    barData,
    pieData,
    columns: { barChartCategory, barChartNumeric, pieChartCategory }
  };
}
