import { astro } from "iztro";
import type { BirthInput, ZiweiChart, ZiweiPalace } from "./types";
import { applyTrueSolarCorrection } from "./true-solar-time";

/**
 * 紫微斗数排盘封装。
 *
 * iztro 的 astro.bySolar(solarDate, timeIndex, gender, fixLeap, lang)：
 *   - solarDate: "YYYY-M-D" 格式（注意 M/D 不补零）
 *   - timeIndex: 0..12，其中 0=早子, 1=丑, ... 11=亥, 12=晚子
 *   - gender: "男" | "女"
 *   - fixLeap: 闰月修正，通常 true
 *
 * 时辰未知时：hourUnknown=true，本函数直接返回 null，由调用方决定是否排盘。
 */
export function buildZiweiChart(input: BirthInput): ZiweiChart | null {
  if (input.timeMode === "unknown") {
    return null;
  }

  // 1. 初始小时
  let hour: number;
  let minute: number;
  if (input.timeMode === "precise") {
    hour = input.hour ?? 12;
    minute = input.minute ?? 0;
  } else {
    const periodMid: Record<NonNullable<BirthInput["timePeriod"]>, [number, number]> = {
      dawn: [4, 30],
      morning: [9, 0],
      afternoon: [15, 0],
      evening: [21, 0],
    };
    const [h, m] = periodMid[input.timePeriod ?? "morning"];
    hour = h;
    minute = m;
  }

  // 2. 真太阳时校正
  const c = applyTrueSolarCorrection(input.year, input.month, input.day, hour, minute, input.birthProvince);

  // 3. 时辰 index
  const timeIndex = hourToTimeIndex(c.hour, c.minute);

  // 4. iztro 排盘
  const gender = input.gender === "male" ? "男" : "女";
  const dateStr = `${c.year}-${c.month}-${c.day}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const astrolabe: any = astro.bySolar(dateStr, timeIndex, gender, true, "zh-CN");

  // 5. 映射宫位
  const palaces: ZiweiPalace[] = astrolabe.palaces.map((p: any) => ({
    name: p.name,
    ganZhi: `${p.heavenlyStem}${p.earthlyBranch}`,
    majorStars: (p.majorStars ?? []).map((s: any) => ({
      name: s.name,
      brightness: s.brightness || undefined,
      mutagen: s.mutagen || undefined,
    })),
    minorStars: (p.minorStars ?? []).map((s: any) => s.name),
    adjStars: (p.adjectiveStars ?? []).map((s: any) => s.name),
  }));

  // 6. 当前大限
  let currentDecadalIndex: number | undefined;
  let currentDecadal: ZiweiChart["currentDecadal"];
  try {
    if (typeof astrolabe.horoscope === "function") {
      const horo = astrolabe.horoscope();
      const decadal = horo?.decadal;
      if (decadal) {
        currentDecadalIndex = decadal.index;
        currentDecadal = {
          name: decadal.name ?? "大限",
          palaceName: decadal.palaceNames?.[0] ?? "",
          ganZhi: `${decadal.heavenlyStem ?? ""}${decadal.earthlyBranch ?? ""}`,
          ageRange: decadal.range ? `${decadal.range[0]}-${decadal.range[1]}岁` : "",
        };
      }
    }
  } catch (err) {
    console.warn("[ziwei] decadal failed:", (err as Error).message);
  }

  return {
    soul: astrolabe.soul,
    body: astrolabe.body,
    fiveElementsClass: astrolabe.fiveElementsClass,
    soulPalaceZhi: astrolabe.earthlyBranchOfSoulPalace,
    bodyPalaceZhi: astrolabe.earthlyBranchOfBodyPalace,
    palaces,
    currentDecadalIndex,
    currentDecadal,
  };
}

/**
 * 将 24 小时制时间映射到 iztro 时辰 index（0-12）：
 * 00:00-00:59 → 0 (早子)
 * 01:00-02:59 → 1 (丑)
 * 03:00-04:59 → 2 (寅)
 * 05:00-06:59 → 3 (卯)
 * 07:00-08:59 → 4 (辰)
 * 09:00-10:59 → 5 (巳)
 * 11:00-12:59 → 6 (午)
 * 13:00-14:59 → 7 (未)
 * 15:00-16:59 → 8 (申)
 * 17:00-18:59 → 9 (酉)
 * 19:00-20:59 → 10 (戌)
 * 21:00-22:59 → 11 (亥)
 * 23:00-23:59 → 12 (晚子)
 */
function hourToTimeIndex(hour: number, _minute: number): number {
  if (hour === 23) return 12;
  if (hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}
