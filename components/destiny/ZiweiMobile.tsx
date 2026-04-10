"use client";

import type { CompactChart } from "@/types/destiny";

/**
 * 紫微十二宫展示。
 * 移动端：12 张卡片纵向列表（默认）
 * 桌面端（md+）：3×4 网格方盘样式
 */
export function ZiweiMobile({ compact }: { compact: CompactChart }) {
  if (!compact.ziwei) return null;
  const zw = compact.ziwei;

  // 将四化标记转颜色
  const mutagenColor = (text: string): string => {
    if (text.includes("(禄)")) return "text-[#6DC985]"; // 绿
    if (text.includes("(权)")) return "text-[#C89BFF]"; // 紫
    if (text.includes("(科)")) return "text-[#5BA8E5]"; // 蓝
    if (text.includes("(忌)")) return "text-[#E56B5B]"; // 红
    return "text-[var(--color-text)]";
  };

  return (
    <div>
      {/* 命主身主概要 */}
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <ZwMeta label="命主" value={zw.soul} />
        <ZwMeta label="身主" value={zw.body} />
        <ZwMeta label="五行局" value={zw.fiveElementsClass} />
      </div>

      {/* 十二宫卡片网格：移动 2 列，md+ 4 列（模拟方盘） */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {zw.palaces.map((p) => {
          const isSoul = p.name === "命宫";
          const borderClass = isSoul
            ? "border-[var(--color-gold)] shadow-[0_0_16px_rgba(212,175,55,0.2)]"
            : "border-[rgba(212,175,55,0.15)]";
          return (
            <div
              key={p.name}
              className={`rounded-lg border ${borderClass} bg-[rgba(10,6,24,0.5)] p-2.5 min-h-[92px] relative`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs ${isSoul ? "text-[var(--color-gold)]" : "text-[var(--color-gold-soft)]"}`}
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {p.name}
                </span>
                <span
                  className="text-[10px] text-[var(--color-text-dim)]"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {p.zhi}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {p.main.length > 0 ? (
                  p.main.map((s) => (
                    <span
                      key={s}
                      className={`text-xs leading-none ${mutagenColor(s)}`}
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-[var(--color-text-dim)]">空宫</span>
                )}
              </div>
              {p.minor && p.minor.length > 0 && (
                <div className="mt-1 text-[10px] text-[var(--color-text-dim)] leading-tight">
                  {p.minor.join("·")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 当前大限 */}
      {zw.currentDecadal && (
        <div className="mt-4 text-center">
          <span
            className="inline-block px-3 py-1.5 rounded-full border border-[rgba(212,175,55,0.4)] text-xs text-[var(--color-gold-soft)] tracking-wider"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            当前大限 · {zw.currentDecadal.palace} · {zw.currentDecadal.ageRange}
          </span>
        </div>
      )}
    </div>
  );
}

function ZwMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[rgba(212,175,55,0.15)] bg-[rgba(10,6,24,0.5)] p-2">
      <div
        className="text-[10px] text-[var(--color-text-dim)] tracking-wider"
        style={{ fontFamily: "var(--font-cinzel)" }}
      >
        {label}
      </div>
      <div
        className="mt-0.5 text-sm text-[var(--color-gold-soft)]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {value}
      </div>
    </div>
  );
}
