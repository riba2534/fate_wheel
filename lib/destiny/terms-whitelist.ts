import { DI_ZHI, SHI_SHEN, TIAN_GAN, ZIWEI_MAIN_STARS, ZIWEI_PALACES, WU_XING } from "./constants";
import type { CompactChart } from "./compact";

/**
 * 基于 compact 命盘生成"本次允许 LLM 引用的术语白名单"。
 * 这个白名单会被写进 prompt 作为硬约束，并在输出时做二次校验。
 */

export interface TermWhitelist {
  /** 允许的十神（本盘出现的） */
  shiShen: Set<string>;
  /** 允许的主星（本盘出现的） */
  zwMainStars: Set<string>;
  /** 允许的干支（四柱 + 大运 + 流年） */
  ganZhi: Set<string>;
  /** 五行（总是 5 个） */
  wuxing: Set<string>;
  /** 紫微十二宫名（总是 12 个，但只在有紫微盘时才算"可引用"） */
  palaces: Set<string>;
  /** 通用中性词：干支、阴阳、命理学基础概念（不需要限制） */
  neutralTerms: Set<string>;
}

/** 命理术语总表（用于输出端扫描"可疑术语"） */
export const ALL_COMMON_TERMS = new Set<string>([
  ...TIAN_GAN, ...DI_ZHI, ...SHI_SHEN, ...WU_XING,
  ...ZIWEI_MAIN_STARS, ...ZIWEI_PALACES,
  // 常见紫微辅星（不强制入白名单，但允许被识别）
  "左辅", "右弼", "文昌", "文曲", "天魁", "天钺",
  "禄存", "天马", "火星", "铃星", "擎羊", "陀罗",
  "地空", "地劫",
  // 四化
  "化禄", "化权", "化科", "化忌",
  // 常见神煞
  "桃花", "天德", "月德", "红鸾", "天喜", "孤辰", "寡宿", "华盖", "驿马",
  // 大运流年等概念词
  "大运", "流年", "命宫", "身宫", "日主", "月令", "日元",
]);

export function buildWhitelist(compact: CompactChart): TermWhitelist {
  const shiShen = new Set<string>(compact.bazi.presentShiShen);
  shiShen.add("比肩"); // 日主本身不纳入 presentShiShen，但解读可以提"日主"

  const zwMainStars = new Set<string>(compact.ziwei?.presentMainStars ?? []);

  // 干支白名单：四柱 + 大运 + 流年
  const ganZhi = new Set<string>();
  for (const part of compact.bazi.gz.split("|")) {
    if (part && part !== "?") ganZhi.add(part);
  }
  for (const dy of compact.bazi.daYun) ganZhi.add(dy.gz);
  if (compact.bazi.currentDaYun) ganZhi.add(compact.bazi.currentDaYun.gz);
  ganZhi.add(compact.bazi.liuNian.gz);

  const wuxing = new Set<string>(WU_XING);
  const palaces = compact.ziwei ? new Set<string>(ZIWEI_PALACES) : new Set<string>();

  const neutralTerms = new Set<string>([
    "日主", "日元", "月令", "大运", "流年", "命宫", "身宫",
    "化禄", "化权", "化科", "化忌",
    "天干", "地支", "纳音", "藏干", "阴阳", "五行", "生克",
  ]);

  return { shiShen, zwMainStars, ganZhi, wuxing, palaces, neutralTerms };
}

/** 格式化白名单为给 LLM 看的提示文本 */
export function renderWhitelistForPrompt(wl: TermWhitelist, hasZiwei: boolean): string {
  const lines: string[] = [];
  lines.push(`允许引用的十神：${[...wl.shiShen].join("、")}`);
  lines.push(`允许引用的干支：${[...wl.ganZhi].join("、")}`);
  if (hasZiwei && wl.zwMainStars.size > 0) {
    lines.push(`允许引用的紫微主星：${[...wl.zwMainStars].join("、")}`);
    lines.push(`允许引用的紫微宫位：${[...wl.palaces].join("、")}`);
  }
  lines.push(`五行：金木水火土`);
  lines.push(`通用词：${[...wl.neutralTerms].join("、")}`);
  return lines.join("\n");
}
