"use client";

/** 匿名客户端 UUID 管理（localStorage 持久化） */

const KEY = "fate-wheel:client-id";

export function getClientId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
