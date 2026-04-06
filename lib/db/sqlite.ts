import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { DivinationResponse } from "@/types";

const DB_PATH = process.env.DATABASE_PATH ?? "./data/fate-wheel.db";

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  const fullPath = resolve(process.cwd(), DB_PATH);
  mkdirSync(dirname(fullPath), { recursive: true });
  const db = new Database(fullPath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expire_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_shares_expire ON shares(expire_at);
  `);
  _db = db;
  return db;
}

const SHARE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

/** 保存一份占卜结果到服务端，返回可分享的 ID */
export function saveShare(data: DivinationResponse): string {
  const db = getDb();
  const id = data.id; // 复用 divination id
  const now = Date.now();
  db.prepare(
    `INSERT OR REPLACE INTO shares (id, type, data_json, created_at, expire_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(id, data.type, JSON.stringify(data), now, now + SHARE_TTL_MS);

  // 顺手清理过期
  db.prepare("DELETE FROM shares WHERE expire_at < ?").run(now);

  return id;
}

/** 读取分享结果，过期或不存在返回 null */
export function getShare(id: string): DivinationResponse | null {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT data_json, expire_at FROM shares WHERE id = ? LIMIT 1",
    )
    .get(id) as { data_json: string; expire_at: number } | undefined;
  if (!row) return null;
  if (row.expire_at < Date.now()) return null;
  try {
    return JSON.parse(row.data_json) as DivinationResponse;
  } catch {
    return null;
  }
}
