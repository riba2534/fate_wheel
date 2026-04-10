import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { saveShare, getShare } from "@/lib/db/d1";
import { checkRateLimit } from "@/lib/rate-limit";
import type { DivinationResponse, ApiError } from "@/types";

export const dynamic = "force-dynamic";

const DivinationSchema = z
  .object({
    id: z.string().min(10).max(64),
    type: z.enum(["wheel", "daily", "iching"]),
    createdAt: z.number().int().positive(),
  })
  .passthrough();

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
  const parsed = DivinationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "数据格式错误", code: "invalid_input" } satisfies ApiError,
      { status: 400 },
    );
  }

  const shareId = await saveShare(
    env.DB,
    parsed.data as unknown as DivinationResponse,
  );
  return NextResponse.json({ shareId, expiresInDays: 7 });
}

export async function GET(req: NextRequest) {
  const { env } = getCloudflareContext();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "缺少 id", code: "invalid_input" } satisfies ApiError,
      { status: 400 },
    );
  }
  const data = await getShare(env.DB, id);
  if (!data) {
    return NextResponse.json(
      { error: "卦象已散，不可追寻", code: "invalid_input" } satisfies ApiError,
      { status: 404 },
    );
  }
  return NextResponse.json(data);
}
