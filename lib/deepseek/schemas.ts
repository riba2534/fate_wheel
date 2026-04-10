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

/** 观命 · 命盘解读结构（八字 + 紫微联合解读） */
export const DestinyReadingSchema = z.object({
  /** 格局总评，必引用日主与月令或主星 */
  geju: z.string().min(40).max(220),
  /** 性格总纲 */
  xingge: z.string().min(60).max(260),
  /** 按宫位/主题的分段解读 */
  career: z.string().min(30).max(320),
  love: z.string().min(30).max(320),
  wealth: z.string().min(30).max(320),
  health: z.string().min(30).max(320),
  /** 当前大运解读 */
  daYunSummary: z.string().min(40).max(260),
  /** 今年流年提示 */
  liuNianSummary: z.string().min(30).max(220),
  /** 用户若有提问则针对提问作答 */
  answerToQuestion: z.string().min(30).max(400).optional().nullable(),
  /** 3-6 条具体行动建议 */
  advice: z.array(z.string().min(4).max(40)).min(3).max(6),
  /** 引用事实追踪：LLM 必须列出本次用到的盘中事实指针 */
  factRefs: z.array(z.string().min(2).max(30)).min(3).max(30),
});
export type DestinyReading = z.infer<typeof DestinyReadingSchema>;
