/**
 * 内存 LRU 限流
 * 每 clientId 每分钟 5 次、每天 30 次
 * 服务器单实例部署，无需 Redis
 */

interface Bucket {
  minute: { count: number; resetAt: number };
  day: { count: number; resetAt: number };
}

const buckets = new Map<string, Bucket>();
const MAX_ENTRIES = 10_000;

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * 60_000;

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

export function checkRateLimit(
  clientId: string,
  config: LimitConfig = DEFAULT_LIMITS,
): LimitResult {
  const now = Date.now();
  let bucket = buckets.get(clientId);
  if (!bucket) {
    bucket = {
      minute: { count: 0, resetAt: now + MINUTE_MS },
      day: { count: 0, resetAt: now + DAY_MS },
    };
    // 简易 LRU：超过阈值时清除最早的 10%
    if (buckets.size >= MAX_ENTRIES) {
      const keys = Array.from(buckets.keys()).slice(0, MAX_ENTRIES / 10);
      for (const k of keys) buckets.delete(k);
    }
    buckets.set(clientId, bucket);
  }

  // 重置过期窗口
  if (now >= bucket.minute.resetAt) {
    bucket.minute = { count: 0, resetAt: now + MINUTE_MS };
  }
  if (now >= bucket.day.resetAt) {
    bucket.day = { count: 0, resetAt: now + DAY_MS };
  }

  if (bucket.day.count >= config.perDay) {
    return {
      ok: false,
      reason: "day",
      retryAfterSec: Math.ceil((bucket.day.resetAt - now) / 1000),
    };
  }
  if (bucket.minute.count >= config.perMinute) {
    return {
      ok: false,
      reason: "minute",
      retryAfterSec: Math.ceil((bucket.minute.resetAt - now) / 1000),
    };
  }

  bucket.minute.count += 1;
  bucket.day.count += 1;
  return { ok: true };
}
