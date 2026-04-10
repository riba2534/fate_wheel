import { Solar } from "lunar-typescript";
import {
  GAN_WUXING,
  ZHI_WUXING,
  type DiZhi,
  type ShiShen,
  type TianGan,
  ZHI_ZODIAC,
} from "./constants";
import type { BaziChart, BirthInput, DaYunStep, Pillar } from "./types";
import { computeWuxingScore, estimateStrength } from "./wuxing-score";
import { applyTrueSolarCorrection } from "./true-solar-time";

/**
 * 从用户输入推出完整八字命盘。
 *
 * - 若 timeMode = "precise"：使用 hour/minute，时柱完整
 * - 若 timeMode = "period"：取时段中点
 * - 若 timeMode = "unknown"：取正午 12:00 占位但标记 hourUnknown，时柱不用于解读
 *
 * 若提供 birthProvince 则做真太阳时校正，可能影响 hour 甚至跨日。
 */
export function buildBaziChart(input: BirthInput): BaziChart {
  const { year, month, day, gender, timeMode, birthProvince } = input;

  // 1. 确定初始小时
  let hour: number;
  let minute: number;
  let hourUnknown = false;

  if (timeMode === "precise") {
    hour = input.hour ?? 12;
    minute = input.minute ?? 0;
  } else if (timeMode === "period") {
    // 时段中点
    const periodMid: Record<NonNullable<BirthInput["timePeriod"]>, [number, number]> = {
      dawn: [4, 30],
      morning: [9, 0],
      afternoon: [15, 0],
      evening: [21, 0],
    };
    const [h, m] = periodMid[input.timePeriod ?? "morning"];
    hour = h;
    minute = m;
  } else {
    // unknown: 占位正午，时柱数据后面会置 null
    hour = 12;
    minute = 0;
    hourUnknown = true;
  }

  // 2. 真太阳时校正（仅 precise/period 有意义；unknown 也校正但时柱仍丢弃）
  const corrected = applyTrueSolarCorrection(year, month, day, hour, minute, birthProvince);

  // 3. 调用 lunar-typescript
  const solar = Solar.fromYmdHms(
    corrected.year,
    corrected.month,
    corrected.day,
    corrected.hour,
    corrected.minute,
    0,
  );
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  const yearPillar = buildPillar("year", ec, "year");
  const monthPillar = buildPillar("month", ec, "month");
  const dayPillar = buildPillar("day", ec, "day");
  const hourPillar = hourUnknown ? null : buildPillar("time", ec, "hour");

  const dayGan = dayPillar.gan;
  const dayWuxing = GAN_WUXING[dayGan];

  // 4. 五行得分
  const gans: TianGan[] = [yearPillar.gan, monthPillar.gan, dayPillar.gan];
  const zhis: DiZhi[] = [yearPillar.zhi, monthPillar.zhi, dayPillar.zhi];
  if (hourPillar) {
    gans.push(hourPillar.gan);
    zhis.push(hourPillar.zhi);
  }
  const { score, percent } = computeWuxingScore(gans, zhis);

  // 5. 大运（需要 iztro 风格的 1/0 gender 参数）
  const yunGender = gender === "male" ? 1 : 0;
  const yun = ec.getYun(yunGender);
  const rawDaYun = yun.getDaYun();
  const daYun: DaYunStep[] = rawDaYun
    .map((dy): DaYunStep => {
      const gz = dy.getGanZhi();
      return {
        ganZhi: gz && gz.length === 2 ? gz : null,
        startAge: dy.getStartAge(),
        endAge: dy.getEndAge(),
        startYear: dy.getStartYear(),
      };
    })
    // 过滤掉童限（无干支）之外的索引，同时填入十神
    .map((step) => {
      if (!step.ganZhi) return step;
      const gan = step.ganZhi[0] as TianGan;
      step.shiShen = shiShenByDay(dayGan, gan);
      return step;
    });

  // 6. 当前大运、当前流年
  const now = new Date();
  const thisYear = now.getFullYear();
  const age = thisYear - year + 1; // 虚岁近似
  const currentDaYun = daYun.find((dy) => age >= dy.startAge && age <= dy.endAge);

  // 流年：用 lunar-typescript 的今年干支
  const nowSolar = Solar.fromYmd(thisYear, 6, 15); // 任意中点避开节气边缘以取年柱
  const nowLunar = nowSolar.getLunar();
  const liuGz = nowLunar.getYearInGanZhi();
  const liuGan = liuGz[0] as TianGan;

  return {
    solarLocal: {
      year: corrected.year,
      month: corrected.month,
      day: corrected.day,
      hour: corrected.hour,
      minute: corrected.minute,
    },
    trueSolarCorrected: corrected.corrected,
    trueSolarOffsetMin: corrected.offsetMin,
    hourUnknown,
    gender,
    zodiac: ZHI_ZODIAC[yearPillar.zhi] ?? "",
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    dayMaster: {
      gan: dayGan,
      wuXing: dayWuxing,
    },
    wuxingScore: score,
    wuxingPercent: percent,
    daYun,
    startLuck: {
      year: yun.getStartYear(),
      month: yun.getStartMonth(),
    },
    currentDaYun,
    currentLiuNian: {
      year: thisYear,
      ganZhi: liuGz,
      shiShen: shiShenByDay(dayGan, liuGan),
    },
  };
}

// -- 内部工具 --

/** 从 lunar-typescript 的 EightChar 抽取一柱 */
function buildPillar(
  role: "year" | "month" | "day" | "time",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ec: any,
  label: "year" | "month" | "day" | "hour",
): Pillar {
  const gzMap = {
    year: ec.getYear(),
    month: ec.getMonth(),
    day: ec.getDay(),
    time: ec.getTime(),
  } as const;
  const gz: string = gzMap[role];
  const gan = gz[0] as TianGan;
  const zhi = gz[1] as DiZhi;

  const shiShenGan: Record<typeof role, string> = {
    year: ec.getYearShiShenGan(),
    month: ec.getMonthShiShenGan(),
    day: "日主",
    time: ec.getTimeShiShenGan(),
  };
  const shiShenZhi: Record<typeof role, string[]> = {
    year: ec.getYearShiShenZhi(),
    month: ec.getMonthShiShenZhi(),
    day: ec.getDayShiShenZhi(),
    time: ec.getTimeShiShenZhi(),
  };
  const hideGan: Record<typeof role, TianGan[]> = {
    year: ec.getYearHideGan(),
    month: ec.getMonthHideGan(),
    day: ec.getDayHideGan(),
    time: ec.getTimeHideGan(),
  };
  const naYin: Record<typeof role, string> = {
    year: ec.getYearNaYin(),
    month: ec.getMonthNaYin(),
    day: ec.getDayNaYin(),
    time: ec.getTimeNaYin(),
  };

  void label;

  return {
    ganZhi: gz,
    gan,
    zhi,
    shiShen: (shiShenGan[role] as ShiShen) ?? "日主",
    zhiShiShen: shiShenZhi[role] ?? [],
    cangGan: hideGan[role] ?? [],
    naYin: naYin[role],
    ganWuXing: GAN_WUXING[gan],
    zhiWuXing: ZHI_WUXING[zhi],
  };
}

/** 以日主为我，计算另一天干相对的十神名 */
function shiShenByDay(dayGan: TianGan, otherGan: TianGan): string {
  // 十天干序列，阳干偶数 index（0,2,4,6,8），阴干奇数 index（1,3,5,7,9）
  const order = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const me = order.indexOf(dayGan);
  const other = order.indexOf(otherGan);
  if (me < 0 || other < 0) return "";

  const meWuxing = GAN_WUXING[dayGan];
  const otherWuxing = GAN_WUXING[otherGan];

  // 同性：me % 2 === other % 2
  const sameYinYang = me % 2 === other % 2;

  // 五行生克关系
  // 同五行 → 比肩/劫财
  // 我生 → 食神/伤官
  // 我克 → 偏财/正财
  // 克我 → 七杀/正官
  // 生我 → 偏印/正印
  const sheng: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  const ke: Record<string, string> = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };

  if (meWuxing === otherWuxing) return sameYinYang ? "比肩" : "劫财";
  if (sheng[meWuxing] === otherWuxing) return sameYinYang ? "食神" : "伤官";
  if (ke[meWuxing] === otherWuxing) return sameYinYang ? "偏财" : "正财";
  if (ke[otherWuxing] === meWuxing) return sameYinYang ? "七杀" : "正官";
  if (sheng[otherWuxing] === meWuxing) return sameYinYang ? "偏印" : "正印";
  return "";
}

/** 日主强弱判定（导出便于 compact 引用） */
export function baziStrength(chart: BaziChart): string {
  return estimateStrength(chart.dayMaster.wuXing, chart.wuxingPercent);
}
