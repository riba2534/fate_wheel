import { SHI_SHEN, ZIWEI_MAIN_STARS } from "./constants";
import type { TermWhitelist } from "./terms-whitelist";

/**
 * 扫描 LLM 返回的文本，检测是否引用了命盘之外的十神/主星。
 * 返回违禁词列表，空数组表示通过。
 *
 * 做法：
 * - 对"十神"整体做白名单检查：只能出现 compact.presentShiShen 中的十神
 * - 对"紫微主星"同理：只能出现 compact.presentMainStars 中的主星
 * - 天干/地支不检查（现代人名字就可能撞干支，误报率太高）
 */
export function validateReadingText(
  text: string,
  whitelist: TermWhitelist,
  hasZiwei: boolean,
): string[] {
  const violations: string[] = [];

  for (const ss of SHI_SHEN) {
    if (text.includes(ss) && !whitelist.shiShen.has(ss)) {
      violations.push(`十神外扯：${ss}`);
    }
  }

  if (hasZiwei) {
    for (const star of ZIWEI_MAIN_STARS) {
      if (text.includes(star) && !whitelist.zwMainStars.has(star)) {
        violations.push(`主星外扯：${star}`);
      }
    }
  } else {
    // 没有紫微盘时，14 主星一律不允许出现
    for (const star of ZIWEI_MAIN_STARS) {
      if (text.includes(star)) {
        violations.push(`无紫微盘却引用主星：${star}`);
      }
    }
  }

  return violations;
}

/** 把解读 JSON 的所有字符串字段拼起来做一次扫描 */
export function extractReadingText(reading: unknown): string {
  if (!reading || typeof reading !== "object") return "";
  const parts: string[] = [];
  const visit = (v: unknown) => {
    if (typeof v === "string") parts.push(v);
    else if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === "object") Object.values(v).forEach(visit);
  };
  visit(reading);
  return parts.join(" \n ");
}
