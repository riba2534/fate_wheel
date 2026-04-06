"use client";

import type { DailyResponse } from "@/types";

const PREFIX = "fate-wheel:daily:";

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${PREFIX}${y}-${m}-${day}`;
}

export function getDailyCache(): DailyResponse | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(todayKey());
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DailyResponse;
  } catch {
    return null;
  }
}

export function setDailyCache(data: DailyResponse): void {
  if (typeof window === "undefined") return;
  // 清理昨日及更早的缓存
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith(PREFIX) && k !== todayKey()) {
      localStorage.removeItem(k);
    }
  }
  localStorage.setItem(todayKey(), JSON.stringify(data));
}
