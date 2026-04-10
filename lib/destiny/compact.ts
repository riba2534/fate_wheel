import type { BaziChart, DestinyChart, ZiweiChart } from "./types";
import { baziStrength } from "./bazi";

/**
 * 命盘事实压缩：把完整命盘裁剪为 LLM prompt 能安全接收的精简版（目标 < 3KB JSON）。
 * 目的：
 *   1. 控制 token 消耗
 *   2. 明确告诉 LLM "可以引用的事实"，防止它扯未出现的星耀十神
 */
export interface CompactChart {
  gender: "male" | "female";
  zodiac: string;
  hourUnknown: boolean;
  /** 校正说明（解读时可声明） */
  trueSolar?: string;

  bazi: {
    /** "庚午|壬午|辛亥|壬辰"，hourUnknown 时第四段为 "?" */
    gz: string;
    /** 日主 "辛金" */
    dayMaster: string;
    /** 月令 "午火" */
    monthLing: string;
    strength: string;
    /** 四柱十神，hourUnknown 时 hour 为 null */
    shiShen: {
      year: string;
      month: string;
      day: "日主";
      hour: string | null;
    };
    wuxingPercent: Record<string, number>;
    /** 本盘出现的十神集合（去重） */
    presentShiShen: string[];
    /** 纳音 */
    naYin: {
      year: string;
      month: string;
      day: string;
      hour: string | null;
    };
    /** 大运简表（最多 8 步，过滤童限） */
    daYun: Array<{ age: string; gz: string; shiShen?: string }>;
    /** 当前大运 */
    currentDaYun?: { age: string; gz: string; shiShen?: string };
    /** 今年流年 */
    liuNian: { year: number; gz: string; shiShen: string };
  };

  ziwei?: {
    soul: string;
    body: string;
    fiveElementsClass: string;
    soulPalace: string; // 命宫地支
    palaces: Array<{
      name: string;
      zhi: string;
      main: string[]; // 主星名，带四化标记 "紫微(权)"
      minor?: string[]; // 简化展示
    }>;
    currentDecadal?: {
      name: string;
      palace: string;
      ageRange: string;
    };
    presentMainStars: string[];
  };

  topics?: DestinyChart["topics"];
  question?: string;
}

export function compactChart(chart: DestinyChart): CompactChart {
  const { bazi, ziwei } = chart;

  const baziCompact = compactBazi(bazi);
  const ziweiCompact = ziwei ? compactZiwei(ziwei) : undefined;

  return {
    gender: bazi.gender,
    zodiac: bazi.zodiac,
    hourUnknown: bazi.hourUnknown,
    trueSolar: bazi.trueSolarCorrected
      ? `已按真太阳时校正 ${bazi.trueSolarOffsetMin >= 0 ? "+" : ""}${bazi.trueSolarOffsetMin} 分钟`
      : undefined,
    bazi: baziCompact,
    ziwei: ziweiCompact,
    topics: chart.topics,
    question: chart.question,
  };
}

function compactBazi(bazi: BaziChart): CompactChart["bazi"] {
  const presentShiShen = new Set<string>();
  const addSS = (s: string | undefined) => {
    if (s && s !== "日主") presentShiShen.add(s);
  };

  addSS(bazi.year.shiShen);
  addSS(bazi.month.shiShen);
  if (bazi.hour) addSS(bazi.hour.shiShen);
  bazi.year.zhiShiShen.forEach(addSS);
  bazi.month.zhiShiShen.forEach(addSS);
  bazi.day.zhiShiShen.forEach(addSS);
  if (bazi.hour) bazi.hour.zhiShiShen.forEach(addSS);

  const gz = [
    bazi.year.ganZhi,
    bazi.month.ganZhi,
    bazi.day.ganZhi,
    bazi.hour?.ganZhi ?? "?",
  ].join("|");

  // 大运过滤童限并截取前 8 步
  const daYun = bazi.daYun
    .filter((d) => d.ganZhi)
    .slice(0, 8)
    .map((d) => ({
      age: `${d.startAge}-${d.endAge}`,
      gz: d.ganZhi!,
      shiShen: d.shiShen,
    }));

  const currentDaYun = bazi.currentDaYun?.ganZhi
    ? {
        age: `${bazi.currentDaYun.startAge}-${bazi.currentDaYun.endAge}`,
        gz: bazi.currentDaYun.ganZhi,
        shiShen: bazi.currentDaYun.shiShen,
      }
    : undefined;

  return {
    gz,
    dayMaster: `${bazi.dayMaster.gan}${bazi.dayMaster.wuXing}`,
    monthLing: `${bazi.month.zhi}${bazi.month.zhiWuXing}`,
    strength: baziStrength(bazi),
    shiShen: {
      year: bazi.year.shiShen,
      month: bazi.month.shiShen,
      day: "日主",
      hour: bazi.hour ? bazi.hour.shiShen : null,
    },
    wuxingPercent: bazi.wuxingPercent as Record<string, number>,
    presentShiShen: Array.from(presentShiShen),
    naYin: {
      year: bazi.year.naYin,
      month: bazi.month.naYin,
      day: bazi.day.naYin,
      hour: bazi.hour?.naYin ?? null,
    },
    daYun,
    currentDaYun,
    liuNian: {
      year: bazi.currentLiuNian.year,
      gz: bazi.currentLiuNian.ganZhi,
      shiShen: bazi.currentLiuNian.shiShen,
    },
  };
}

function compactZiwei(ziwei: ZiweiChart): CompactChart["ziwei"] {
  const presentMainStars = new Set<string>();
  const palaces = ziwei.palaces.map((p) => {
    const main = p.majorStars.map((s) => {
      presentMainStars.add(s.name);
      return s.mutagen ? `${s.name}(${s.mutagen})` : s.name;
    });
    return {
      name: p.name,
      zhi: p.ganZhi.slice(1),
      main,
      // 只在非"命宫/官禄/财帛/夫妻/迁移"之外的宫省略 minor，控制体积
      minor: ["命宫", "官禄", "财帛", "夫妻", "迁移"].includes(p.name)
        ? p.minorStars.slice(0, 4)
        : undefined,
    };
  });

  return {
    soul: ziwei.soul,
    body: ziwei.body,
    fiveElementsClass: ziwei.fiveElementsClass,
    soulPalace: ziwei.soulPalaceZhi,
    palaces,
    currentDecadal: ziwei.currentDecadal
      ? {
          name: ziwei.currentDecadal.palaceName,
          palace: ziwei.currentDecadal.palaceName,
          ageRange: ziwei.currentDecadal.ageRange,
        }
      : undefined,
    presentMainStars: Array.from(presentMainStars),
  };
}
