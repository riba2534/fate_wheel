import type { DivinationResponse } from "@/types";

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
