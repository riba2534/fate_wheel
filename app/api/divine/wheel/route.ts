import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { deepseekJson } from "@/lib/deepseek/client";
import { WheelReadingSchema } from "@/lib/deepseek/schemas";
import {
  WHEEL_SYSTEM_PROMPT,
  buildWheelUserPrompt,
  wheelFallback,
} from "@/lib/deepseek/prompts/wheel";
import {
  WHEEL_SECTORS,
  computeWheelRotation,
  getSector,
} from "@/lib/divination/wheel-sectors";
import { randomInt } from "@/lib/divination/rng";
import { checkRateLimit } from "@/lib/rate-limit";
import type { WheelResponse, ApiError } from "@/types";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "问题太短")
    .max(200, "问题过长")
    .refine(
      (s) => !/忽略(以上|前面)|system\s*:|ignore\s+(the\s+)?above|你是一个/i.test(s),
      { message: "请输入正当的占卜问题" },
    ),
});

export async function POST(req: NextRequest) {
  const { env } = getCloudflareContext();

  const clientId =
    req.headers.get("x-client-id") ||
    req.headers.get("x-forwarded-for") ||
    "anon";
  const limit = await checkRateLimit(env.CACHE_KV, clientId);
  if (!limit.ok) {
    const err: ApiError = {
      error: limit.reason === "day" ? "今日占卜次数已用尽" : "占卜过于频繁，请稍后再试",
      code: "rate_limit",
      retryAfter: limit.retryAfterSec,
    };
    return NextResponse.json(err, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSec ?? 60) },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "请求体非法", code: "invalid_input" } satisfies ApiError,
      { status: 400 },
    );
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "输入无效",
        code: "invalid_input",
      } satisfies ApiError,
      { status: 400 },
    );
  }
  const { question } = parsed.data;

  const sectorIndex = randomInt(WHEEL_SECTORS.length);
  const sector = getSector(sectorIndex);

  // 微事实增强：若用户已在观命模式填过盘，client 会带 x-day-master header（URL-encoded）
  const dayMasterHdr = req.headers.get("x-day-master");
  let dayMaster: string | undefined;
  if (dayMasterHdr) {
    try {
      const decoded = decodeURIComponent(dayMasterHdr);
      if (decoded && decoded.length <= 6) dayMaster = decoded;
    } catch {}
  }

  let reading;
  try {
    reading = await deepseekJson({
      apiKey: env.DEEPSEEK_API_KEY,
      systemPrompt: WHEEL_SYSTEM_PROMPT,
      userPrompt: buildWheelUserPrompt(question, sector, { dayMaster }),
      validate: (p) => WheelReadingSchema.parse(p),
    });
  } catch (err) {
    console.error("[wheel] deepseek failed, using fallback:", (err as Error).message);
    reading = wheelFallback(sector);
  }

  const response: WheelResponse = {
    id: crypto.randomUUID(),
    type: "wheel",
    question,
    sectorIndex,
    sector: {
      name: sector.name,
      nameEn: sector.nameEn,
      level: sector.level,
      score: sector.score,
      symbol: sector.symbol,
      hue: sector.hue,
    },
    rotationDeg: computeWheelRotation(sectorIndex),
    reading,
    createdAt: Date.now(),
  };
  return NextResponse.json(response);
}
