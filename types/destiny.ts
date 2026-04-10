/**
 * 观命前端共享类型（仅客户端使用；服务端保留 lib/destiny/types.ts 为权威来源）。
 */
import type { CompactChart } from "@/lib/destiny/compact";
import type { DestinyReading } from "@/lib/deepseek/schemas";

export type { CompactChart, DestinyReading };

export interface DestinyResponse {
  id: string;
  type: "destiny";
  sessionToken: string;
  compact: CompactChart;
  reading: DestinyReading;
  createdAt: number;
  llmFailed?: boolean;
}

/** 表单输入（仅客户端状态） */
export interface BirthFormState {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  timeMode: "precise" | "period" | "unknown";
  timePeriod: "dawn" | "morning" | "afternoon" | "evening";
  gender: "male" | "female";
  birthProvince: string; // 省份 code
  topics: Array<"career" | "love" | "wealth" | "health" | "study" | "overall">;
  question: string;
}
