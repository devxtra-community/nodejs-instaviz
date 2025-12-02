export function userWantsChart(message: string) {
  return /(chart|graph|plot|visualize|show.*trend|distribution|aggregate|group by|sum by)/i.test(
    message
  );
}
