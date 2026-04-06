import type { WheelReading, DailyReading, IChingReading } from "@/lib/deepseek/schemas";
import type { FortuneLevel } from "@/lib/divination/wheel-sectors";

export type DivinationType = "wheel" | "daily" | "iching";

export interface WheelResponse {
  id: string;
  type: "wheel";
  question: string;
  sectorIndex: number;
  sector: {
    name: string;
    nameEn: string;
    level: FortuneLevel;
    score: number;
    symbol: string;
    hue: string;
  };
  rotationDeg: number;
  reading: WheelReading;
  createdAt: number;
}

export interface DailyResponse {
  id: string;
  type: "daily";
  date: string; // YYYY-MM-DD
  signNumber: number;
  signName: string;
  signText: string; // 古文签文
  level: FortuneLevel;
  reading: DailyReading;
  createdAt: number;
}

export interface IChingResponse {
  id: string;
  type: "iching";
  question: string;
  hexagramIndex: number;
  hexagram: {
    name: string;
    symbol: string; // 卦象（如 ䷀）
    text: string; // 卦辞
  };
  changedLines: number[];
  changedHexagram?: {
    name: string;
    symbol: string;
  };
  reading: IChingReading;
  createdAt: number;
}

export type DivinationResponse = WheelResponse | DailyResponse | IChingResponse;

export interface ApiError {
  error: string;
  code: "rate_limit" | "invalid_input" | "upstream_failed" | "server_error";
  retryAfter?: number;
}
