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
import { buildWhitelist } from "@/lib/destiny/terms-whitelist";
import { extractReadingText, validateReadingText } from "@/lib/destiny/validate-reading";
import {
  appendReading,
  checkAskLimit,
  loadChartSession,
} from "@/lib/destiny/chart-session";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ApiError } from "@/types";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  sessionToken: z.string().min(10).max(64),
  question: z
    .string()
    .trim()
    .min(2, "问题太短")
    .max(200, "问题过长")
    .refine(
      (s) => !/忽略(以上|前面)|system\s*:|ignore\s+(the\s+)?above|你是一个/i.test(s),
      { message: "请输入正当的问题" },
    ),
  topic: z.enum(["career", "love", "wealth", "health", "study", "overall"]).optional(),
});

export async function POST(req: NextRequest) {
  const { env } = getCloudflareContext();

  const clientId =
    req.headers.get("x-client-id") ||
    req.headers.get("x-forwarded-for") ||
    "anon";
  const limit = await checkRateLimit(env.CACHE_KV, clientId);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: limit.reason === "day" ? "今日观命次数已用尽" : "追问过于频繁，稍候再试",
        code: "rate_limit",
        retryAfter: limit.retryAfterSec,
      } satisfies ApiError,
      { status: 429 },
    );
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

  const { sessionToken, question, topic } = parsed.data;

  // 加载命盘
  const session = await loadChartSession(env.CACHE_KV, sessionToken);
  if (!session) {
    return NextResponse.json(
      { error: "命盘已散，请重新观命", code: "invalid_input" } satisfies ApiError,
      { status: 404 },
    );
  }

  // 同盘追问限流
  const askLimit = await checkAskLimit(env.CACHE_KV, sessionToken);
  if (!askLimit.ok) {
    return NextResponse.json(
      {
        error: `同一命盘单日追问次数已达上限 (${askLimit.limit} 次)`,
        code: "rate_limit",
      } satisfies ApiError,
      { status: 429 },
    );
  }

  // 注入新问题到 compact 副本
  const compactWithQuestion = {
    ...session.compact,
    question,
    topics: topic ? [topic] : session.compact.topics ?? ["overall"],
  };
  const whitelist = buildWhitelist(compactWithQuestion);
  const hasZiwei = !!compactWithQuestion.ziwei;

  let reading;
  let llmFailed = false;
  try {
    reading = await deepseekJson({
      apiKey: env.DEEPSEEK_API_KEY,
      systemPrompt: DESTINY_SYSTEM_PROMPT,
      userPrompt: buildDestinyUserPrompt(compactWithQuestion, whitelist, hasZiwei),
      maxTokens: 2000,
      temperature: 0.8,
      validate: (p) => DestinyReadingSchema.parse(p),
    });
    const text = extractReadingText(reading);
    const violations = validateReadingText(text, whitelist, hasZiwei);
    if (violations.length > 0) {
      console.warn("[destiny ask] reading violations:", violations);
    }
  } catch (err) {
    console.error("[destiny ask] deepseek failed:", (err as Error).message);
    reading = destinyFallback(compactWithQuestion);
    llmFailed = true;
  }

  await appendReading(env.CACHE_KV, sessionToken, {
    question,
    reading,
    createdAt: Date.now(),
  });

  return NextResponse.json({
    id: crypto.randomUUID(),
    type: "destiny-ask",
    sessionToken,
    question,
    reading,
    llmFailed,
    createdAt: Date.now(),
  });
}
