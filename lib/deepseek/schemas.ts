import { z } from "zod";

/** 命运之轮 AI 生成的解读结构 */
export const WheelReadingSchema = z.object({
  summary: z.string().min(30).max(140),
  aspects: z.object({
    // 按主次维度变化：主维度可至 45+ 字，次维度 10-18 字
    career: z.string().min(6).max(90),
    love: z.string().min(6).max(90),
    wealth: z.string().min(6).max(90),
    health: z.string().min(6).max(90),
  }),
  lucky: z.object({
    color: z.string().min(1).max(10),
    number: z.number().int().min(0).max(99),
    direction: z.string().min(1).max(8),
  }),
  advice: z.array(z.string().min(4).max(24)).min(1).max(4),
});
export type WheelReading = z.infer<typeof WheelReadingSchema>;

/** 每日一签 AI 生成结构 */
export const DailyReadingSchema = z.object({
  summary: z.string().min(30).max(120),
  advice: z.string().min(10).max(40),
  lucky: z.object({
    color: z.string().min(1).max(10),
    number: z.number().int().min(0).max(99),
  }),
});
export type DailyReading = z.infer<typeof DailyReadingSchema>;

/** 周易六十四卦 AI 生成结构 */
export const IChingReadingSchema = z.object({
  summary: z.string().min(40).max(200),
  career: z.string().min(8).max(100),
  love: z.string().min(8).max(100),
  wealth: z.string().min(8).max(100),
  health: z.string().min(8).max(100),
  advice: z.array(z.string().min(4).max(28)).min(1).max(4),
  lucky: z.object({
    color: z.string().min(1).max(10),
    number: z.number().int().min(0).max(99),
    direction: z.string().min(1).max(8),
  }),
});
export type IChingReading = z.infer<typeof IChingReadingSchema>;
