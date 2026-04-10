"use client";

import type { CompactChart } from "@/types/destiny";

export function DaYunTimeline({ compact }: { compact: CompactChart }) {
  const current = compact.bazi.currentDaYun;
  return (
    <div className="overflow-x-auto -mx-5 px-5 pb-2">
      <div className="flex gap-2 min-w-max">
        {compact.bazi.daYun.map((step) => {
          const active = current && step.gz === current.gz;
          return (
            <div
              key={step.age + step.gz}
              className={`flex-shrink-0 w-[88px] rounded-lg border p-2.5 text-center transition-all ${
                active
                  ? "border-[var(--color-gold)] bg-[rgba(212,175,55,0.12)] shadow-[0_0_14px_rgba(212,175,55,0.2)]"
                  : "border-[rgba(212,175,55,0.18)] bg-[rgba(10,6,24,0.5)]"
              }`}
            >
              <div
                className="text-[10px] text-[var(--color-text-dim)]"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                {step.age}
              </div>
              <div
                className={`mt-1.5 text-xl ${active ? "text-gold-glow" : "text-[var(--color-text)]"}`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.gz}
              </div>
              <div
                className={`mt-1 text-[10px] ${
                  active ? "text-[var(--color-gold)]" : "text-[var(--color-gold-soft)]"
                }`}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {step.shiShen ?? "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
