const MINUTE_SEC = 60;
const DAY_SEC = 24 * 60 * 60;

export interface LimitConfig {
  perMinute: number;
  perDay: number;
}

export const DEFAULT_LIMITS: LimitConfig = { perMinute: 5, perDay: 30 };

export interface LimitResult {
  ok: boolean;
  reason?: "minute" | "day";
  retryAfterSec?: number;
}

export async function checkRateLimit(
  kv: KVNamespace,
  clientId: string,
  config: LimitConfig = DEFAULT_LIMITS,
): Promise<LimitResult> {
  const minKey = `rl:min:${clientId}`;
  const dayKey = `rl:day:${clientId}`;

  const [minStr, dayStr] = await Promise.all([
    kv.get(minKey),
    kv.get(dayKey),
  ]);
  const minCount = minStr ? parseInt(minStr, 10) || 0 : 0;
  const dayCount = dayStr ? parseInt(dayStr, 10) || 0 : 0;

  if (dayCount >= config.perDay) {
    return { ok: false, reason: "day", retryAfterSec: DAY_SEC };
  }
  if (minCount >= config.perMinute) {
    return { ok: false, reason: "minute", retryAfterSec: MINUTE_SEC };
  }

  await Promise.all([
    kv.put(minKey, String(minCount + 1), { expirationTtl: MINUTE_SEC }),
    kv.put(dayKey, String(dayCount + 1), { expirationTtl: DAY_SEC }),
  ]);

  return { ok: true };
}
