#!/usr/bin/env node
// Phase 2+3 黄金测试：验证八字+紫微整体集成
import { buildDestiny } from "../lib/destiny";
import type { BirthInput } from "../lib/destiny/types";

const cases: Array<{ name: string; input: BirthInput }> = [
  {
    name: "1990-06-15 08:30 男 北京 问事业",
    input: {
      year: 1990, month: 6, day: 15, hour: 8, minute: 30,
      timeMode: "precise", gender: "male", birthProvince: "BJ",
      topics: ["career"], question: "今年换工作时机如何",
    },
  },
  {
    name: "1995-08-15 时辰未知 男",
    input: {
      year: 1995, month: 8, day: 15,
      timeMode: "unknown", gender: "male",
      topics: ["overall"],
    },
  },
];

for (const c of cases) {
  console.log(`\n=== ${c.name} ===`);
  try {
    const d = buildDestiny(c.input);
    const comp = d.compact;
    console.log(`八字: ${comp.bazi.gz}`);
    console.log(`日主: ${comp.bazi.dayMaster}`);
    console.log(`月令: ${comp.bazi.monthLing}`);
    console.log(`强弱: ${comp.bazi.strength}`);
    console.log(`四柱十神: 年${comp.bazi.shiShen.year} 月${comp.bazi.shiShen.month} 日${comp.bazi.shiShen.day} 时${comp.bazi.shiShen.hour ?? "(未知)"}`);
    console.log(`五行%: ${JSON.stringify(comp.bazi.wuxingPercent)}`);
    console.log(`当前大运: ${comp.bazi.currentDaYun?.gz ?? "-"} (${comp.bazi.currentDaYun?.shiShen ?? "-"})`);
    console.log(`今年流年: ${comp.bazi.liuNian.gz} (${comp.bazi.liuNian.shiShen})`);
    console.log(`本盘十神集: [${comp.bazi.presentShiShen.join(",")}]`);

    if (comp.ziwei) {
      console.log(`\n紫微:`);
      console.log(`  命主:${comp.ziwei.soul} 身主:${comp.ziwei.body} 五行局:${comp.ziwei.fiveElementsClass}`);
      console.log(`  命宫地支:${comp.ziwei.soulPalace}`);
      console.log(`  主星集: [${comp.ziwei.presentMainStars.join(",")}]`);
      console.log(`  十二宫摘要:`);
      for (const p of comp.ziwei.palaces) {
        console.log(`    ${p.name}[${p.zhi}] 主星:[${p.main.join(",")}]${p.minor ? " 辅:[" + p.minor.join(",") + "]" : ""}`);
      }
      console.log(`  当前大限: ${comp.ziwei.currentDecadal?.palace ?? "-"} ${comp.ziwei.currentDecadal?.ageRange ?? ""}`);
    } else {
      console.log(`\n紫微: (未排，时辰未知)`);
    }

    console.log(`\n白名单尺寸:`);
    console.log(`  十神: ${d.whitelist.shiShen.size}`);
    console.log(`  主星: ${d.whitelist.zwMainStars.size}`);
    console.log(`  干支: ${d.whitelist.ganZhi.size}`);

    const compactSize = JSON.stringify(comp).length;
    console.log(`\ncompact JSON 字节数: ${compactSize}`);
    console.log(`预估 token: ~${Math.round(compactSize / 2)}`);
  } catch (e) {
    console.error("❌ 抛异常:", (e as Error).message);
    console.error((e as Error).stack);
  }
}
console.log("\n=== 完成 ===");
