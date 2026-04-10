import { buildBaziChart } from "./bazi";
import { buildZiweiChart } from "./ziwei";
import { compactChart, type CompactChart } from "./compact";
import { buildWhitelist, type TermWhitelist } from "./terms-whitelist";
import type { BirthInput, DestinyChart } from "./types";

/**
 * 观命总入口：输入生辰，输出完整命盘 + compact JSON + 白名单。
 * 时辰未知时紫微为 null。
 */
export function buildDestiny(input: BirthInput): {
  chart: DestinyChart;
  compact: CompactChart;
  whitelist: TermWhitelist;
} {
  const bazi = buildBaziChart(input);
  const ziwei = buildZiweiChart(input);

  const chart: DestinyChart = {
    bazi,
    ziwei,
    topics: input.topics,
    question: input.question,
  };
  const compact = compactChart(chart);
  const whitelist = buildWhitelist(compact);

  return { chart, compact, whitelist };
}
