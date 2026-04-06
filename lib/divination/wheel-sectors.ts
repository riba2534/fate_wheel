/**
 * 命运之轮 12 扇区数据
 * 每个扇区 30°，从正上方（0°）开始顺时针排列
 * 吉凶分布均衡：大吉1 / 中吉2 / 小吉3 / 平2 / 小凶2 / 中凶1 / 大凶1
 */

export type FortuneLevel =
  | "大吉"
  | "中吉"
  | "小吉"
  | "平"
  | "小凶"
  | "中凶"
  | "大凶";

export interface WheelSector {
  index: number; // 0-11
  name: string; // 中文扇区名
  nameEn: string; // 英文副标
  level: FortuneLevel;
  score: number; // 1-10
  symbol: string; // RuneIcon 键名
  hue: "gold" | "purple" | "neutral" | "crimson"; // 视觉色调
  essence: string; // 核心意象（提示 AI 的关键词）
}

export const WHEEL_SECTORS: WheelSector[] = [
  {
    index: 0,
    name: "紫微临身",
    nameEn: "Imperial Star Descends",
    level: "大吉",
    score: 10,
    symbol: "star",
    hue: "gold",
    essence: "紫微帝星亲临，尊贵之象，所求皆成",
  },
  {
    index: 1,
    name: "天德昭临",
    nameEn: "Heaven's Virtue Arrives",
    level: "中吉",
    score: 8,
    symbol: "sun",
    hue: "gold",
    essence: "天道佑德，有贵人相扶，谋事大吉",
  },
  {
    index: 2,
    name: "月德相映",
    nameEn: "Moon's Grace Reflects",
    level: "小吉",
    score: 7,
    symbol: "moon",
    hue: "purple",
    essence: "月华柔美，阴柔之德显，和合圆融",
  },
  {
    index: 3,
    name: "青龙守位",
    nameEn: "Azure Dragon Abides",
    level: "平",
    score: 5,
    symbol: "water",
    hue: "neutral",
    essence: "静水流深，守正待时，不宜躁动",
  },
  {
    index: 4,
    name: "文昌耀命",
    nameEn: "Scholar Star Shines",
    level: "小吉",
    score: 7,
    symbol: "scroll",
    hue: "gold",
    essence: "学业文思通达，思路清明，创作有成",
  },
  {
    index: 5,
    name: "朱雀鸣梁",
    nameEn: "Vermilion Bird Sings",
    level: "小凶",
    score: 4,
    symbol: "fire",
    hue: "crimson",
    essence: "口舌是非起，慎言慎行，少争为宜",
  },
  {
    index: 6,
    name: "天狗食月",
    nameEn: "Celestial Dog Devours Moon",
    level: "中凶",
    score: 2,
    symbol: "moon",
    hue: "crimson",
    essence: "阴影遮蔽，暂避锋芒，勿做重大决策",
  },
  {
    index: 7,
    name: "白虎守垣",
    nameEn: "White Tiger Guards Gate",
    level: "平",
    score: 5,
    symbol: "mountain",
    hue: "neutral",
    essence: "威严自守，不动则不失，宜蛰伏内省",
  },
  {
    index: 8,
    name: "破军犯本",
    nameEn: "Pojun Star Invades",
    level: "大凶",
    score: 1,
    symbol: "thunder",
    hue: "crimson",
    essence: "变数猛烈，破旧立新前必有阵痛，需忍耐",
  },
  {
    index: 9,
    name: "玄武藏珠",
    nameEn: "Black Tortoise Hides Pearl",
    level: "小凶",
    score: 4,
    symbol: "water",
    hue: "crimson",
    essence: "财星隐匿，破财小灾，守好本分是正途",
  },
  {
    index: 10,
    name: "福星高照",
    nameEn: "Lucky Star High",
    level: "中吉",
    score: 8,
    symbol: "sun",
    hue: "gold",
    essence: "福气盈门，喜事将近，心之所向皆通达",
  },
  {
    index: 11,
    name: "喜神入户",
    nameEn: "Joy Spirit Enters",
    level: "小吉",
    score: 7,
    symbol: "lotus",
    hue: "purple",
    essence: "喜气临门，情缘和美，良配可期",
  },
];

/** 扇区中心角度（0 = 正上方，顺时针） */
export function sectorCenterAngle(index: number): number {
  return index * 30 + 15;
}

/** 根据 sectorIndex 计算轮子最终旋转角度（预旋转 6 圈 + 停到扇区） */
export function computeWheelRotation(sectorIndex: number): number {
  // 指针固定在顶端 0°，轮子逆向旋转使目标扇区落到指针下方
  const targetAngle = sectorCenterAngle(sectorIndex);
  return 360 * 6 + (360 - targetAngle);
}

export function getSector(index: number): WheelSector {
  return WHEEL_SECTORS[index] ?? WHEEL_SECTORS[0]!;
}
