import { getProvinceByCode } from "./geo-longitude";

/**
 * 真太阳时校正。
 *
 * 原理：命理按真太阳时取柱。北京时间是 120°E 的平太阳时，
 * 出生地经度不同，需做经度时差修正；另外真太阳时相对平太阳时还有
 * 季节性的均时差（±16 分钟）。
 *
 * 精度：本实现采用常用近似均时差公式（Spencer 1971 简化版），
 * 对于命理用途误差 < 1 分钟，足以支撑时柱判定。
 */

interface Correction {
  totalOffsetMin: number;
  longitudeOffsetMin: number;
  eotMin: number;
  corrected: boolean;
}

/**
 * 返回真太阳时相对北京时间（CST, UTC+8）的总偏移（分钟）。
 * 正值表示真太阳时晚于北京时间，需加。
 * 未提供省份时返回 { corrected: false, totalOffsetMin: 0 }。
 */
export function trueSolarCorrection(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  provinceCode?: string,
): Correction {
  if (!provinceCode) {
    return { totalOffsetMin: 0, longitudeOffsetMin: 0, eotMin: 0, corrected: false };
  }
  const province = getProvinceByCode(provinceCode);
  if (!province) {
    return { totalOffsetMin: 0, longitudeOffsetMin: 0, eotMin: 0, corrected: false };
  }

  // 1. 经度时差：真太阳时相对平太阳时的偏移
  //    longitude_offset_min = (longitude - 120) * 4
  //    例：北京 116.41 → -14.36，即真太阳时比北京时间晚约 14 分钟
  const longitudeOffsetMin = (province.longitude - 120) * 4;

  // 2. 均时差（equation of time）
  //    B = 2π * (day_of_year - 81) / 365
  //    EOT = 9.87 sin(2B) - 7.53 cos(B) - 1.5 sin(B)  单位：分钟
  const doy = dayOfYear(birthYear, birthMonth, birthDay);
  const B = (2 * Math.PI * (doy - 81)) / 365;
  const eotMin = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  const totalOffsetMin = longitudeOffsetMin + eotMin;

  return {
    totalOffsetMin,
    longitudeOffsetMin,
    eotMin,
    corrected: true,
  };
}

/**
 * 将北京时间（year/month/day/hour/minute）经过真太阳时校正后返回本地真太阳时。
 * 可能跨日。
 */
export function applyTrueSolarCorrection(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  provinceCode?: string,
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  corrected: boolean;
  offsetMin: number;
} {
  const c = trueSolarCorrection(year, month, day, provinceCode);
  if (!c.corrected) {
    return { year, month, day, hour, minute, corrected: false, offsetMin: 0 };
  }
  const d = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  d.setUTCMinutes(d.getUTCMinutes() + Math.round(c.totalOffsetMin));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    corrected: true,
    offsetMin: Math.round(c.totalOffsetMin),
  };
}

function dayOfYear(y: number, m: number, d: number): number {
  const start = Date.UTC(y, 0, 1);
  const cur = Date.UTC(y, m - 1, d);
  return Math.floor((cur - start) / 86400000) + 1;
}
