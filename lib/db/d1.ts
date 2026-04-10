import type { DivinationResponse } from "@/types";
import type { CompactChart } from "@/types/destiny";
import type { DestinyReading } from "@/lib/deepseek/schemas";

const SHARE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function saveShare(
  db: D1Database,
  data: DivinationResponse,
): Promise<string> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT OR REPLACE INTO shares (id, type, data_json, created_at, expire_at)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    )
    .bind(data.id, data.type, JSON.stringify(data), now, now + SHARE_TTL_MS)
    .run();
  return data.id;
}

export async function getShare(
  db: D1Database,
  id: string,
): Promise<DivinationResponse | null> {
  const row = await db
    .prepare("SELECT data_json, expire_at FROM shares WHERE id = ?1 LIMIT 1")
    .bind(id)
    .first<{ data_json: string; expire_at: number }>();
  if (!row) return null;
  if (row.expire_at < Date.now()) return null;
  try {
    return JSON.parse(row.data_json) as DivinationResponse;
  } catch {
    return null;
  }
}

// -------- 观命分享 --------

export interface DestinyShareRow {
  id: string;
  compact: CompactChart;
  reading: DestinyReading;
  gender: "male" | "female";
  question?: string;
  createdAt: number;
}

export async function saveDestinyShare(
  db: D1Database,
  data: {
    id: string;
    compact: CompactChart;
    reading: DestinyReading;
    gender: "male" | "female";
    question?: string;
  },
): Promise<string> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT OR REPLACE INTO destiny_shares
       (id, compact_json, reading_json, gender, question, created_at, expire_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
    )
    .bind(
      data.id,
      JSON.stringify(data.compact),
      JSON.stringify(data.reading),
      data.gender,
      data.question ?? null,
      now,
      now + SHARE_TTL_MS,
    )
    .run();
  return data.id;
}

export async function getDestinyShare(
  db: D1Database,
  id: string,
): Promise<DestinyShareRow | null> {
  const row = await db
    .prepare(
      "SELECT compact_json, reading_json, gender, question, created_at, expire_at FROM destiny_shares WHERE id = ?1 LIMIT 1",
    )
    .bind(id)
    .first<{
      compact_json: string;
      reading_json: string;
      gender: string;
      question: string | null;
      created_at: number;
      expire_at: number;
    }>();
  if (!row) return null;
  if (row.expire_at < Date.now()) return null;
  try {
    return {
      id,
      compact: JSON.parse(row.compact_json) as CompactChart,
      reading: JSON.parse(row.reading_json) as DestinyReading,
      gender: row.gender as "male" | "female",
      question: row.question ?? undefined,
      createdAt: row.created_at,
    };
  } catch {
    return null;
  }
}

