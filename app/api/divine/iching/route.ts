import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { deepseekJson } from "@/lib/deepseek/client";
import { IChingReadingSchema } from "@/lib/deepseek/schemas";
import {
  ICHING_SYSTEM_PROMPT,
  buildIChingUserPrompt,
  ichingFallback,
} from "@/lib/deepseek/prompts/iching";
import { findHexagramByLines } from "@/lib/divination/iching-hexagrams";
import { checkRateLimit } from "@/lib/rate-limit";
import type { IChingResponse, ApiError } from "@/types";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "问题太短")
    .max(200, "问题过长")
    .refine(
      (s) => !/忽略(以上|前面)|system\s*:|ignore\s+(the\s+)?above/i.test(s),
      { message: "请输入正当的占卜问题" },
    ),
  lines: z.array(z.number().int().min(6).max(9)).length(6),
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
        error: limit.reason === "day" ? "今日占卜次数已尽" : "请稍后再试",
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
  const { question, lines } = parsed.data;

  const benLines = lines.map((n) => (n === 7 || n === 9 ? 1 : 0));
  const bianLines = lines.map((n, i) =>
    n === 6 ? 1 : n === 9 ? 0 : benLines[i]!,
  );
  const changedIndices = lines
    .map((n, i) => (n === 6 || n === 9 ? i : -1))
    .filter((i) => i >= 0);

  const hex = findHexagramByLines(benLines);
  if (!hex) {
    return NextResponse.json(
      { error: "卦象匹配失败", code: "server_error" } satisfies ApiError,
      { status: 500 },
    );
  }
  const bianHex = changedIndices.length > 0 ? findHexagramByLines(bianLines) : undefined;

  let reading;
  try {
    reading = await deepseekJson({
      apiKey: env.DEEPSEEK_API_KEY,
      systemPrompt: ICHING_SYSTEM_PROMPT,
      userPrompt: buildIChingUserPrompt({
        question,
        hexagram: hex,
        changedHexagram: bianHex,
        changedLines: changedIndices,
      }),
      maxTokens: 900,
      validate: (p) => IChingReadingSchema.parse(p),
    });
  } catch (err) {
    console.error("[iching] deepseek failed:", (err as Error).message);
    reading = ichingFallback(hex);
  }

  const response: IChingResponse = {
    id: crypto.randomUUID(),
    type: "iching",
    question,
    hexagramIndex: hex.index,
    hexagram: { name: hex.name, symbol: hex.symbol, text: hex.text },
    changedLines: changedIndices,
    ...(bianHex && {
      changedHexagram: { name: bianHex.name, symbol: bianHex.symbol },
    }),
    reading,
    createdAt: Date.now(),
  };
  return NextResponse.json(response);
}
