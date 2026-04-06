import { NextRequest, NextResponse } from "next/server";
import { deepseekJson } from "@/lib/deepseek/client";
import { DailyReadingSchema } from "@/lib/deepseek/schemas";
import {
  DAILY_SYSTEM_PROMPT,
  buildDailyUserPrompt,
  dailyFallback,
} from "@/lib/deepseek/prompts/daily";
import { SIGNS, getSign } from "@/lib/divination/signs";
import { seededInt } from "@/lib/divination/rng";
import { checkRateLimit } from "@/lib/rate-limit";
import type { DailyResponse, ApiError } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 服务端全天缓存（同一用户同一日必返同一结果）
const dailyCache = new Map<string, { response: DailyResponse; expireAt: number }>();

export async function POST(req: NextRequest) {
  const clientId =
    req.headers.get("x-client-id") ||
    req.headers.get("x-forwarded-for") ||
    "anon";

  const date = todayStr();
  const cacheKey = `${clientId}:${date}`;

  // 缓存命中
  const cached = dailyCache.get(cacheKey);
  if (cached && cached.expireAt > Date.now()) {
    return NextResponse.json(cached.response);
  }

  // 限流（缓存未命中才消耗）
  const limit = checkRateLimit(clientId);
  if (!limit.ok) {
    const err: ApiError = {
      error: limit.reason === "day" ? "今日占卜次数已尽" : "请稍后再试",
      code: "rate_limit",
      retryAfter: limit.retryAfterSec,
    };
    return NextResponse.json(err, { status: 429 });
  }

  // 根据 clientId + date 计算签号（同用户同天必同签）
  const signIdx = await seededInt(`${clientId}:${date}`, SIGNS.length);
  const sign = getSign(SIGNS[signIdx]!.no);

  // DeepSeek 解读
  let reading;
  try {
    reading = await deepseekJson({
      systemPrompt: DAILY_SYSTEM_PROMPT,
      userPrompt: buildDailyUserPrompt(sign, date),
      maxTokens: 500,
      validate: (p) => DailyReadingSchema.parse(p),
    });
  } catch (err) {
    console.error("[daily] deepseek failed:", (err as Error).message);
    reading = dailyFallback(sign);
  }

  const response: DailyResponse = {
    id: crypto.randomUUID(),
    type: "daily",
    date,
    signNumber: sign.no,
    signName: sign.name,
    signText: sign.text,
    level: sign.level,
    reading,
    createdAt: Date.now(),
  };

  // 缓存到次日 0 点
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  dailyCache.set(cacheKey, {
    response,
    expireAt: tomorrow.getTime(),
  });

  // 清理过期缓存
  if (dailyCache.size > 5000) {
    for (const [k, v] of dailyCache) {
      if (v.expireAt < Date.now()) dailyCache.delete(k);
    }
  }

  return NextResponse.json(response);
}
