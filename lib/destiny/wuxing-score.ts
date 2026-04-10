import {
  GAN_WUXING,
  ZHI_CANG_GAN,
  ZHI_WUXING,
  WU_XING,
  type DiZhi,
  type TianGan,
  type WuXing,
} from "./constants";

/**
 * 藏干比例法五行得分。
 *
 * 算法：
 * - 四天干：每干按其所属五行 +1.0 分
 * - 四地支：按藏干权重分配
 *     本气 weight=1.0 → +1.2 分
 *     中气 weight=0.5 → +0.6 分
 *     余气 weight=0.3 → +0.36 分
 *   地支加权基数略高于天干，反映地支"气"的强度。
 * - 时柱缺失时只算 3 干 3 支。
 *
 * 返回：每个五行的绝对得分 + 归一化百分比。
 */
export function computeWuxingScore(
  gans: TianGan[],
  zhis: DiZhi[],
): {
  score: Record<WuXing, number>;
  percent: Record<WuXing, number>;
} {
  const score: Record<WuXing, number> = {
    金: 0, 木: 0, 水: 0, 火: 0, 土: 0,
  };

  for (const gan of gans) {
    score[GAN_WUXING[gan]] += 1.0;
  }

  for (const zhi of zhis) {
    const cangList = ZHI_CANG_GAN[zhi];
    for (const { gan, weight } of cangList) {
      score[GAN_WUXING[gan]] += weight * 1.2;
    }
  }

  const total = WU_XING.reduce((a, b) => a + score[b], 0);
  const percent: Record<WuXing, number> = {
    金: 0, 木: 0, 水: 0, 火: 0, 土: 0,
  };
  if (total > 0) {
    for (const w of WU_XING) {
      percent[w] = Math.round((score[w] / total) * 1000) / 10; // 保留一位小数
    }
  }

  // 保留两位小数精度的 score
  for (const w of WU_XING) {
    score[w] = Math.round(score[w] * 100) / 100;
  }

  return { score, percent };
}

/**
 * 判定日主身强身弱（初级版本）。
 * 真正的强弱判定涉及得令得地得势四要素，这里只做"日主同党占比"启发式：
 *   同党 = 日主五行 + 生日主的五行（印星）
 *   若同党占比 ≥ 0.45 → 身强
 *   0.35–0.45 → 中和偏强
 *   0.25–0.35 → 中和偏弱
 *   < 0.25  → 身弱
 *
 * 后续 V2 可接入得令判定和大运流年扶抑。
 */
export function estimateStrength(
  dayMasterWuxing: WuXing,
  percent: Record<WuXing, number>,
): "身强" | "偏强" | "偏弱" | "身弱" {
  const shengMe: Record<WuXing, WuXing> = {
    金: "土", 木: "水", 水: "金", 火: "木", 土: "火",
  };
  const allies = percent[dayMasterWuxing] + percent[shengMe[dayMasterWuxing]];
  if (allies >= 45) return "身强";
  if (allies >= 35) return "偏强";
  if (allies >= 25) return "偏弱";
  return "身弱";
}
