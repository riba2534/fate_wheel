"use client";

/** 占卜历史 IndexedDB 封装（idb） */

import { openDB, type IDBPDatabase, type DBSchema } from "idb";
import type { DivinationType, DivinationResponse } from "@/types";

export interface HistoryEntry {
  id: string;
  type: DivinationType;
  raw: DivinationResponse;
  imageBlob: Blob;
  createdAt: number;
}

interface FateDB extends DBSchema {
  history: {
    key: string;
    value: HistoryEntry;
    indexes: { "by-created": number; "by-type": string };
  };
}

let dbPromise: Promise<IDBPDatabase<FateDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FateDB>("fate-wheel", 1, {
      upgrade(db) {
        const store = db.createObjectStore("history", { keyPath: "id" });
        store.createIndex("by-created", "createdAt");
        store.createIndex("by-type", "type");
      },
    });
  }
  return dbPromise;
}

export async function saveHistory(entry: HistoryEntry): Promise<void> {
  const db = await getDB();
  await db.put("history", entry);
}

export async function listHistory(limit = 50): Promise<HistoryEntry[]> {
  const db = await getDB();
  const tx = db.transaction("history", "readonly");
  const index = tx.store.index("by-created");
  const results: HistoryEntry[] = [];
  let cursor = await index.openCursor(null, "prev");
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

export async function getHistoryEntry(id: string): Promise<HistoryEntry | undefined> {
  const db = await getDB();
  return db.get("history", id);
}

export async function deleteHistory(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("history", id);
}

export async function countHistory(): Promise<number> {
  const db = await getDB();
  return db.count("history");
}
