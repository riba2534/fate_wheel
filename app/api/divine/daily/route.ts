import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
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

export const dynamic = "force-dynamic";

// 按北京时间（UTC+8）计算"今天"，避免 Workers UTC 环境下日期漂移 8 小时
function bjDateStr(now = Date.now()): string {
  return new Date(now + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

// 计算到下一个北京时间零点还剩多少秒
function secondsUntilBjMidnight(now = Date.now()): number {
  const bjNow = new Date(now + 8 * 3600 * 1000);
  const bjTomorrow = new Date(
    Date.UTC(
      bjNow.getUTCFullYear(),
      bjNow.getUTCMonth(),
      bjNow.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ),
  );
  const bjNowMs = bjNow.getTime();
  return Math.max(60, Math.ceil((bjTomorrow.getTime() - bjNowMs) / 1000));
}

export async function POST(req: NextRequest) {
  const { env } = getCloudflareContext();

  const clientId =
    req.headers.get("x-client-id") ||
    req.headers.get("x-forwarded-for") ||
    "anon";

  const date = bjDateStr();
  const cacheKey = `daily:${clientId}:${date}`;

  const cached = await env.CACHE_KV.get<DailyResponse>(cacheKey, "json");
  if (cached) {
    return NextResponse.json(cached);
  }

  const limit = await checkRateLimit(env.CACHE_KV, clientId);
  if (!limit.ok) {
    const err: ApiError = {
      error: limit.reason === "day" ? "今日占卜次数已尽" : "请稍后再试",
      code: "rate_limit",
      retryAfter: limit.retryAfterSec,
    };
    return NextResponse.json(err, { status: 429 });
  }

  const signIdx = await seededInt(`${clientId}:${date}`, SIGNS.length);
  const sign = getSign(SIGNS[signIdx]!.no);

  let reading;
  try {
    reading = await deepseekJson({
      apiKey: env.DEEPSEEK_API_KEY,
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

  await env.CACHE_KV.put(cacheKey, JSON.stringify(response), {
    expirationTtl: secondsUntilBjMidnight(),
  });

  return NextResponse.json(response);
}
