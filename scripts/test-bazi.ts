#!/usr/bin/env node
// Phase 2 黄金测试：验证 bazi.ts 的输出是否与手工计算 / 权威工具一致
// 使用 tsx 跑：npx tsx scripts/test-bazi.mjs
import { buildBaziChart } from "../lib/destiny/bazi";

const cases = [
  {
    name: "1990-06-15 08:30 男 北京（已冒烟验证）",
    input: {
      year: 1990, month: 6, day: 15, hour: 8, minute: 30,
      timeMode: "precise", gender: "male", birthProvince: "BJ",
    },
    expect: {
      baziGz: "庚午|壬午|辛亥|壬辰",
      dayMaster: "辛金",
    },
  },
  {
    name: "2000-01-01 00:00 女 北京（早子时）",
    input: {
      year: 2000, month: 1, day: 1, hour: 0, minute: 0,
      timeMode: "precise", gender: "female", birthProvince: "BJ",
    },
  },
  {
    name: "1985-05-20 14:00 男 乌鲁木齐（真太阳时偏差大）",
    input: {
      year: 1985, month: 5, day: 20, hour: 14, minute: 0,
      timeMode: "precise", gender: "male", birthProvince: "XJ",
    },
  },
  {
    name: "1995-08-15 12:00 男（时辰未知）",
    input: {
      year: 1995, month: 8, day: 15,
      timeMode: "unknown", gender: "male",
    },
  },
];

for (const c of cases) {
  console.log(`\n=== ${c.name} ===`);
  try {
    const chart = buildBaziChart(c.input);
    const baziGz = [chart.year.ganZhi, chart.month.ganZhi, chart.day.ganZhi, chart.hour?.ganZhi ?? "?"].join("|");
    console.log(`八字: ${baziGz}`);
    console.log(`日主: ${chart.dayMaster.gan}${chart.dayMaster.wuXing}`);
    console.log(`生肖: ${chart.zodiac}`);
    console.log(`真太阳时: corrected=${chart.trueSolarCorrected} offset=${chart.trueSolarOffsetMin}min`);
    console.log(`校正后时间: ${chart.solarLocal.year}-${chart.solarLocal.month}-${chart.solarLocal.day} ${chart.solarLocal.hour}:${String(chart.solarLocal.minute).padStart(2, "0")}`);
    console.log(`hourUnknown: ${chart.hourUnknown}`);
    console.log(`十神(年月时): ${chart.year.shiShen} / ${chart.month.shiShen} / ${chart.hour?.shiShen ?? "N/A"}`);
    console.log(`五行得分: ${JSON.stringify(chart.wuxingScore)}`);
    console.log(`五行百分比: ${JSON.stringify(chart.wuxingPercent)}`);
    console.log(`起运: ${chart.startLuck.year}岁${chart.startLuck.month}月`);
    console.log(`大运前3步:`);
    for (const dy of chart.daYun.slice(0, 3)) {
      console.log(`  ${dy.startAge}-${dy.endAge}岁  ${dy.ganZhi ?? "(童限)"}  十神:${dy.shiShen ?? "-"}`);
    }
    console.log(`当前大运: ${chart.currentDaYun?.ganZhi ?? "-"} ${chart.currentDaYun?.shiShen ?? ""}`);
    console.log(`今年流年: ${chart.currentLiuNian.year} ${chart.currentLiuNian.ganZhi} ${chart.currentLiuNian.shiShen}`);

    if (c.expect) {
      if (c.expect.baziGz && baziGz !== c.expect.baziGz) {
        console.error(`❌ 八字不符：期望 ${c.expect.baziGz} 实得 ${baziGz}`);
      } else if (c.expect.baziGz) {
        console.log(`✅ 八字核对通过`);
      }
      if (c.expect.dayMaster && `${chart.dayMaster.gan}${chart.dayMaster.wuXing}` !== c.expect.dayMaster) {
        console.error(`❌ 日主不符：期望 ${c.expect.dayMaster}`);
      }
    }
  } catch (e) {
    console.error("❌ 抛异常:", e.message);
    console.error(e.stack);
  }
}
console.log("\n=== 完成 ===");
