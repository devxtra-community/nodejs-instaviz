export function normalizeChartsForFrontend(aiCharts: any[]): any[] {
  if (!Array.isArray(aiCharts)) return [];

  return aiCharts
    .map((chart: any) => {
      const rawType = String(chart.type || '').toLowerCase();

      const type =
        rawType.includes('bar') ? 'bar' :
        rawType.includes('pie') ? 'pie' :
        rawType.includes('line') ? 'line' :
        null;

      if (!type) return null;

      const x = chart.x || chart.xField || chart.categoryField || 'x';
      const y = chart.y || chart.yField || chart.valueField || 'y';
      const title = chart.title || `${type.toUpperCase()} chart`;

      const rawData = chart.data || chart.points || chart.series || [];

      const data = rawData.map((p: any) => {
        const xValue =
          p.xValue ??
          p[x] ??
          p.label ??
          p.name ??
          p.category ??
          '';

        const yValue =
          p.yValue ??
          p[y] ??
          p.value ??
          null;

        return {
          xValue,
          yValue,
          value: p.value ?? yValue,
        };
      });

      return { type, x, y, title, data };
    })
    .filter(Boolean);
}
