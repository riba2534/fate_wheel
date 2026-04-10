import type { DiZhi, ShiShen, TianGan, WuXing } from "./constants";

/** 性别 */
export type Gender = "male" | "female";

/** 时辰输入模式 */
export type TimeMode = "precise" | "period" | "unknown";

/** 大致时段 */
export type TimePeriod = "dawn" | "morning" | "afternoon" | "evening";

/** 用户生辰输入（未排盘前） */
export interface BirthInput {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour?: number; // 0-23，timeMode = precise 时必填
  minute?: number; // 0-59，timeMode = precise 时必填
  timeMode: TimeMode;
  timePeriod?: TimePeriod;
  gender: Gender;
  /** 出生省/地区，可选。若提供则做真太阳时校正 */
  birthProvince?: string;
  /** 主题关注（可多选），影响 LLM 解读详略 */
  topics?: Array<"career" | "love" | "wealth" | "health" | "study" | "overall">;
  /** 自由问题（可选） */
  question?: string;
}

/** 单个柱（年/月/日/时） */
export interface Pillar {
  /** "庚午" */
  ganZhi: string;
  gan: TianGan;
  zhi: DiZhi;
  /** 天干十神（相对日主）；日柱为 "日主" */
  shiShen: ShiShen | "日主";
  /** 地支藏干对应的十神，按本气/中气/余气顺序 */
  zhiShiShen: string[];
  /** 藏干列表 */
  cangGan: TianGan[];
  /** 纳音 */
  naYin: string;
  /** 天干五行 */
  ganWuXing: WuXing;
  /** 地支本气五行 */
  zhiWuXing: WuXing;
}

/** 大运一步 */
export interface DaYunStep {
  /** "庚午"。第一步可能为童限，无干支 */
  ganZhi: string | null;
  startAge: number;
  endAge: number;
  startYear: number;
  /** 相对日主的十神。童限无 */
  shiShen?: string;
}

/** 完整八字命盘 */
export interface BaziChart {
  /** 校正后的本地真太阳时（若做了校正） */
  solarLocal: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  /** 是否做了真太阳时校正 */
  trueSolarCorrected: boolean;
  /** 校正偏移分钟（北京时间 → 真太阳时） */
  trueSolarOffsetMin: number;
  /** 是否缺时柱（time_mode = unknown） */
  hourUnknown: boolean;
  gender: Gender;
  zodiac: string;
  year: Pillar;
  month: Pillar;
  day: Pillar;
  /** 时柱，hourUnknown 时为 null */
  hour: Pillar | null;
  /** 日主 */
  dayMaster: {
    gan: TianGan;
    wuXing: WuXing;
  };
  /** 五行得分（藏干比例法） */
  wuxingScore: Record<WuXing, number>;
  /** 五行归一化百分比，0-100 */
  wuxingPercent: Record<WuXing, number>;
  /** 大运列表 */
  daYun: DaYunStep[];
  /** 起运（岁 + 月） */
  startLuck: { year: number; month: number };
  /** 当前大运（根据今天日期定位） */
  currentDaYun?: DaYunStep;
  /** 当前流年干支 */
  currentLiuNian: {
    year: number;
    ganZhi: string;
    shiShen: string;
  };
}

/** 紫微宫 */
export interface ZiweiPalace {
  /** 宫名，如"命宫" */
  name: string;
  /** "戊寅" */
  ganZhi: string;
  /** 主星，含亮度和四化标记 */
  majorStars: Array<{
    name: string;
    brightness?: string;
    mutagen?: string; // 禄/权/科/忌
  }>;
  minorStars: string[];
  adjStars: string[];
}

/** 紫微命盘 */
export interface ZiweiChart {
  soul: string; // 命主
  body: string; // 身主
  fiveElementsClass: string; // 五行局
  soulPalaceZhi: string; // 命宫地支
  bodyPalaceZhi: string; // 身宫地支
  palaces: ZiweiPalace[];
  /** 当前大限索引（0-11） */
  currentDecadalIndex?: number;
  currentDecadal?: {
    name: string;
    palaceName: string;
    ganZhi: string;
    ageRange: string;
  };
}

/** 完整命盘 */
export interface DestinyChart {
  bazi: BaziChart;
  ziwei: ZiweiChart | null; // hourUnknown 时为 null
  topics: BirthInput["topics"];
  question?: string;
}
