"use client";

import type { CompactChart } from "@/types/destiny";

/**
 * 八字四柱表。四列（年月日时），每列展示天干/地支/十神/纳音。
 * 日柱高亮（日主）。
 */
export function BaziTable({ compact }: { compact: CompactChart }) {
  const parts = compact.bazi.gz.split("|");
  const columns = [
    { title: "年柱", gz: parts[0], shiShen: compact.bazi.shiShen.year, naYin: compact.bazi.naYin.year },
    { title: "月柱", gz: parts[1], shiShen: compact.bazi.shiShen.month, naYin: compact.bazi.naYin.month },
    { title: "日柱", gz: parts[2], shiShen: "日主", naYin: compact.bazi.naYin.day, isDay: true },
    {
      title: "时柱",
      gz: parts[3],
      shiShen: compact.bazi.shiShen.hour ?? "未知",
      naYin: compact.bazi.naYin.hour ?? "—",
      isUnknown: compact.hourUnknown,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {columns.map((col) => {
        const isUnknown = col.isUnknown;
        const isDay = col.isDay;
        const borderClass = isDay
          ? "border-[var(--color-gold)] shadow-[0_0_18px_rgba(212,175,55,0.25)]"
          : "border-[rgba(212,175,55,0.18)]";

        let gan = col.gz?.[0] ?? "?";
        let zhi = col.gz?.[1] ?? "?";
        if (isUnknown) {
          gan = "?";
          zhi = "?";
        }

        return (
          <div
            key={col.title}
            className={`relative rounded-lg border ${borderClass} bg-[rgba(10,6,24,0.5)] p-3 text-center`}
          >
            <div
              className={`text-[10px] tracking-[0.3em] mb-2 ${
                isDay ? "text-[var(--color-gold)]" : "text-[var(--color-text-dim)]"
              }`}
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              {col.title}
            </div>
            <div
              className={`text-2xl md:text-3xl leading-none mb-1 ${
                isDay ? "text-gold-glow" : "text-[var(--color-text)]"
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {gan}
            </div>
            <div
              className={`text-2xl md:text-3xl leading-none ${
                isDay ? "text-[var(--color-gold-soft)]" : "text-[var(--color-text-muted)]"
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {zhi}
            </div>
            <div
              className={`mt-3 text-[11px] ${
                isDay ? "text-[var(--color-gold)]" : "text-[var(--color-gold-soft)]"
              }`}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {col.shiShen}
            </div>
            <div
              className="mt-1 text-[10px] text-[var(--color-text-dim)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {col.naYin}
            </div>
          </div>
        );
      })}
    </div>
  );
}
