import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveShare, getShare } from "@/lib/db/sqlite";
import { checkRateLimit } from "@/lib/rate-limit";
import type { DivinationResponse, ApiError } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 简化校验：只校验必要字段，其余透传
const DivinationSchema = z.object({
  id: z.string().min(10).max(64),
  type: z.enum(["wheel", "daily", "iching"]),
  createdAt: z.number().int().positive(),
}).passthrough();

export async function POST(req: NextRequest) {
  const clientId =
    req.headers.get("x-client-id") ||
    req.headers.get("x-forwarded-for") ||
    "anon";

  // 分享限流宽松：每分钟 10 次
  const limit = checkRateLimit(`share:${clientId}`, { perMinute: 10, perDay: 100 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "分享过于频繁", code: "rate_limit", retryAfter: limit.retryAfterSec } satisfies ApiError,
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

  const shareId = saveShare(parsed.data as unknown as DivinationResponse);
  return NextResponse.json({ shareId, expiresInDays: 7 });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "缺少 id", code: "invalid_input" } satisfies ApiError,
      { status: 400 },
    );
  }
  const data = getShare(id);
  if (!data) {
    return NextResponse.json(
      { error: "卦象已散，不可追寻", code: "invalid_input" } satisfies ApiError,
      { status: 404 },
    );
  }
  return NextResponse.json(data);
}
