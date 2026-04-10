import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { saveDestinyShare } from "@/lib/db/d1";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ApiError } from "@/types";
import type { CompactChart } from "@/types/destiny";
import type { DestinyReading } from "@/lib/deepseek/schemas";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  compact: z.unknown(),
  reading: z.unknown(),
  gender: z.enum(["male", "female"]),
  question: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const { env } = getCloudflareContext();

  const clientId =
    req.headers.get("x-client-id") ||
    req.headers.get("x-forwarded-for") ||
    "anon";
  const limit = await checkRateLimit(env.CACHE_KV, `share:${clientId}`, {
    perMinute: 10,
    perDay: 100,
  });
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: "分享过于频繁",
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
      { error: "数据格式错误", code: "invalid_input" } satisfies ApiError,
      { status: 400 },
    );
  }

  // 简易尺寸保护：避免恶意写入超大 payload
  const sizeKb = JSON.stringify(parsed.data).length / 1024;
  if (sizeKb > 32) {
    return NextResponse.json(
      { error: "命盘数据过大", code: "invalid_input" } satisfies ApiError,
      { status: 400 },
    );
  }

  const id = crypto.randomUUID().slice(0, 12);
  await saveDestinyShare(env.DB, {
    id,
    compact: parsed.data.compact as CompactChart,
    reading: parsed.data.reading as DestinyReading,
    gender: parsed.data.gender,
    question: parsed.data.question,
  });
  return NextResponse.json({ shareId: id, expiresInDays: 7 });
}
