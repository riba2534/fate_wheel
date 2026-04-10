/**
 * 命理学核心常量与查表。纯数据，便于其他模块引用和白名单生成。
 * 所有术语为简体中文，来源：子平八字经典体系。
 */

/** 十天干 */
export const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export type TianGan = (typeof TIAN_GAN)[number];

/** 十二地支 */
export const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export type DiZhi = (typeof DI_ZHI)[number];

/** 五行 */
export const WU_XING = ["金", "木", "水", "火", "土"] as const;
export type WuXing = (typeof WU_XING)[number];

/** 十神 */
export const SHI_SHEN = [
  "比肩", "劫财", "食神", "伤官",
  "偏财", "正财", "七杀", "正官",
  "偏印", "正印",
] as const;
export type ShiShen = (typeof SHI_SHEN)[number];

/** 天干 → 五行 */
export const GAN_WUXING: Record<TianGan, WuXing> = {
  甲: "木", 乙: "木",
  丙: "火", 丁: "火",
  戊: "土", 己: "土",
  庚: "金", 辛: "金",
  壬: "水", 癸: "水",
};

/** 地支 → 本气五行 */
export const ZHI_WUXING: Record<DiZhi, WuXing> = {
  子: "水", 亥: "水",
  寅: "木", 卯: "木",
  巳: "火", 午: "火",
  申: "金", 酉: "金",
  辰: "土", 戌: "土", 丑: "土", 未: "土",
};

/**
 * 十二地支藏干表（本气 / 中气 / 余气，权重 1.0 / 0.5 / 0.3）
 * 源：子平正宗、命理探源通用表
 */
export const ZHI_CANG_GAN: Record<DiZhi, Array<{ gan: TianGan; weight: number }>> = {
  子: [{ gan: "癸", weight: 1.0 }],
  丑: [
    { gan: "己", weight: 1.0 },
    { gan: "癸", weight: 0.5 },
    { gan: "辛", weight: 0.3 },
  ],
  寅: [
    { gan: "甲", weight: 1.0 },
    { gan: "丙", weight: 0.5 },
    { gan: "戊", weight: 0.3 },
  ],
  卯: [{ gan: "乙", weight: 1.0 }],
  辰: [
    { gan: "戊", weight: 1.0 },
    { gan: "乙", weight: 0.5 },
    { gan: "癸", weight: 0.3 },
  ],
  巳: [
    { gan: "丙", weight: 1.0 },
    { gan: "戊", weight: 0.5 },
    { gan: "庚", weight: 0.3 },
  ],
  午: [
    { gan: "丁", weight: 1.0 },
    { gan: "己", weight: 0.5 },
  ],
  未: [
    { gan: "己", weight: 1.0 },
    { gan: "丁", weight: 0.5 },
    { gan: "乙", weight: 0.3 },
  ],
  申: [
    { gan: "庚", weight: 1.0 },
    { gan: "壬", weight: 0.5 },
    { gan: "戊", weight: 0.3 },
  ],
  酉: [{ gan: "辛", weight: 1.0 }],
  戌: [
    { gan: "戊", weight: 1.0 },
    { gan: "辛", weight: 0.5 },
    { gan: "丁", weight: 0.3 },
  ],
  亥: [
    { gan: "壬", weight: 1.0 },
    { gan: "甲", weight: 0.5 },
  ],
};

/** 时辰索引：0 早子 / 1 丑 / 2 寅 / ... / 11 亥 / 12 晚子（iztro 使用） */
export const SHI_CHEN_NAMES = [
  "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥",
] as const;

/** 地支 → 生肖 */
export const ZHI_ZODIAC: Record<DiZhi, string> = {
  子: "鼠", 丑: "牛", 寅: "虎", 卯: "兔",
  辰: "龙", 巳: "蛇", 午: "马", 未: "羊",
  申: "猴", 酉: "鸡", 戌: "狗", 亥: "猪",
};

/** 紫微斗数十四主星 */
export const ZIWEI_MAIN_STARS = [
  "紫微", "天机", "太阳", "武曲", "天同", "廉贞",
  "天府", "太阴", "贪狼", "巨门", "天相", "天梁",
  "七杀", "破军",
] as const;

/** 紫微斗数十二宫名 */
export const ZIWEI_PALACES = [
  "命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄",
  "迁移", "仆役", "官禄", "田宅", "福德", "父母",
] as const;

/** 四化星 */
export const SI_HUA = ["禄", "权", "科", "忌"] as const;
