/**
 * 命盘 session 助手：把已排好的命盘存进 KV，供同盘多轮追问复用。
 * KV key 格式：dst:chart:{token}, TTL 24h
 *              dst:reads:{token}, TTL 24h，存解读历史数组
 */
import type { CompactChart, DestinyReading } from "@/types/destiny";

const CHART_TTL_SEC = 24 * 60 * 60;
const ASK_LIMIT_PER_DAY = 10;

export interface ChartSession {
  compact: CompactChart;
  gender: "male" | "female";
  createdAt: number;
}

export interface ReadingEntry {
  question: string | null;
  reading: DestinyReading;
  createdAt: number;
}

export async function saveChartSession(
  kv: KVNamespace,
  token: string,
  data: ChartSession,
): Promise<void> {
  await kv.put(`dst:chart:${token}`, JSON.stringify(data), {
    expirationTtl: CHART_TTL_SEC,
  });
}

export async function loadChartSession(
  kv: KVNamespace,
  token: string,
): Promise<ChartSession | null> {
  const raw = await kv.get(`dst:chart:${token}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChartSession;
  } catch {
    return null;
  }
}

export async function appendReading(
  kv: KVNamespace,
  token: string,
  entry: ReadingEntry,
): Promise<ReadingEntry[]> {
  const raw = await kv.get(`dst:reads:${token}`);
  let arr: ReadingEntry[] = [];
  if (raw) {
    try {
      arr = JSON.parse(raw) as ReadingEntry[];
    } catch {
      arr = [];
    }
  }
  arr.push(entry);
  await kv.put(`dst:reads:${token}`, JSON.stringify(arr), {
    expirationTtl: CHART_TTL_SEC,
  });
  return arr;
}

export async function checkAskLimit(
  kv: KVNamespace,
  token: string,
): Promise<{ ok: boolean; count: number; limit: number }> {
  const raw = await kv.get(`dst:reads:${token}`);
  let count = 0;
  if (raw) {
    try {
      count = (JSON.parse(raw) as ReadingEntry[]).length;
    } catch {}
  }
  return { ok: count < ASK_LIMIT_PER_DAY, count, limit: ASK_LIMIT_PER_DAY };
}
