import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { deepseekJson } from "@/lib/deepseek/client";
import { DestinyReadingSchema } from "@/lib/deepseek/schemas";
import {
  DESTINY_SYSTEM_PROMPT,
  buildDestinyUserPrompt,
  destinyFallback,
} from "@/lib/deepseek/prompts/destiny";
import { buildDestiny } from "@/lib/destiny";
import { extractReadingText, validateReadingText } from "@/lib/destiny/validate-reading";
import { saveChartSession, appendReading } from "@/lib/destiny/chart-session";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ApiError } from "@/types";

export const dynamic = "force-dynamic";

const BirthInputSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23).optional(),
  minute: z.number().int().min(0).max(59).optional(),
  timeMode: z.enum(["precise", "period", "unknown"]),
  timePeriod: z.enum(["dawn", "morning", "afternoon", "evening"]).optional(),
  gender: z.enum(["male", "female"]),
  birthProvince: z.string().max(4).optional(),
  topics: z
    .array(z.enum(["career", "love", "wealth", "health", "study", "overall"]))
    .max(6)
    .optional(),
  question: z
    .string()
    .trim()
    .max(200)
    .optional()
    .refine(
      (s) => !s || !/忽略(以上|前面)|system\s*:|ignore\s+(the\s+)?above|你是一个/i.test(s),
      { message: "请输入正当的问题" },
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
      error: limit.reason === "day" ? "今日观命次数已用尽" : "观命过于频繁，稍候再试",
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
  const parsed = BirthInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "输入无效",
        code: "invalid_input",
      } satisfies ApiError,
      { status: 400 },
    );
  }

  const input = parsed.data;
  // 额外校验：precise 时必须提供 hour/minute
  if (input.timeMode === "precise" && (input.hour === undefined || input.minute === undefined)) {
    return NextResponse.json(
      { error: "精确时辰模式需要提供小时与分钟", code: "invalid_input" } satisfies ApiError,
      { status: 400 },
    );
  }
  if (input.timeMode === "period" && !input.timePeriod) {
    return NextResponse.json(
      { error: "大致时段模式需要选择时段", code: "invalid_input" } satisfies ApiError,
      { status: 400 },
    );
  }

  // 排盘
  let destiny;
  try {
    destiny = buildDestiny(input);
  } catch (err) {
    console.error("[destiny] build failed:", (err as Error).message);
    return NextResponse.json(
      { error: "排盘失败，请检查生辰输入", code: "server_error" } satisfies ApiError,
      { status: 500 },
    );
  }

  const hasZiwei = !!destiny.chart.ziwei;

  // 调 DeepSeek 解读
  let reading;
  let llmFailed = false;
  try {
    reading = await deepseekJson({
      apiKey: env.DEEPSEEK_API_KEY,
      systemPrompt: DESTINY_SYSTEM_PROMPT,
      userPrompt: buildDestinyUserPrompt(destiny.compact, destiny.whitelist, hasZiwei),
      maxTokens: 2000,
      temperature: 0.8,
      validate: (p) => DestinyReadingSchema.parse(p),
    });

    // 白名单二次校验
    const text = extractReadingText(reading);
    const violations = validateReadingText(text, destiny.whitelist, hasZiwei);
    if (violations.length > 0) {
      console.warn("[destiny] reading violations:", violations);
      // 轻量策略：有违规但不强制重试，在返回体里附 warning 供前端决定展示
    }
  } catch (err) {
    console.error("[destiny] deepseek failed:", (err as Error).message);
    reading = destinyFallback(destiny.compact);
    llmFailed = true;
  }

  // 写入 KV session，供同盘追问复用
  const sessionToken = crypto.randomUUID();
  const now = Date.now();
  try {
    await saveChartSession(env.CACHE_KV, sessionToken, {
      compact: destiny.compact,
      gender: input.gender,
      createdAt: now,
    });
    await appendReading(env.CACHE_KV, sessionToken, {
      question: input.question ?? null,
      reading,
      createdAt: now,
    });
  } catch (err) {
    console.warn("[destiny] kv session save failed:", (err as Error).message);
  }

  return NextResponse.json({
    id: crypto.randomUUID(),
    type: "destiny",
    sessionToken,
    // 返回 compact 命盘给前端渲染（不含阳历 PII，已在 compact 里剥离）
    compact: destiny.compact,
    reading,
    createdAt: now,
    llmFailed,
  });
}
