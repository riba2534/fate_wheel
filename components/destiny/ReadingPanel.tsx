"use client";

import type { CompactChart, DestinyReading } from "@/types/destiny";

interface Props {
  reading: DestinyReading;
  compact: CompactChart;
  llmFailed?: boolean;
}

export function ReadingPanel({ reading, compact, llmFailed }: Props) {
  const sections: Array<{ key: keyof DestinyReading; label: string; emoji?: string }> = [
    { key: "geju", label: "格局总评" },
    { key: "xingge", label: "性格总纲" },
    { key: "career", label: "事业学业" },
    { key: "love", label: "婚恋情感" },
    { key: "wealth", label: "财富机遇" },
    { key: "health", label: "身心健康" },
    { key: "daYunSummary", label: `当前大运 · ${compact.bazi.currentDaYun?.gz ?? ""}` },
    { key: "liuNianSummary", label: `今年流年 · ${compact.bazi.liuNian.gz}` },
  ];

  return (
    <div className="space-y-5">
      {llmFailed && (
        <div className="p-3 rounded-lg border border-[rgba(220,120,60,0.4)] bg-[rgba(220,120,60,0.08)] text-xs text-[#F5B58F] text-center">
          上游解读失败，以下为降级文案，可稍后重试观命获得完整解读
        </div>
      )}

      {/* 若有所问，先答所问 */}
      {compact.question && reading.answerToQuestion && (
        <div className="rounded-lg border border-[var(--color-gold)] bg-[rgba(212,175,55,0.08)] p-5">
          <div
            className="text-[11px] text-[var(--color-gold)] tracking-[0.3em] mb-2"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            TO YOUR QUESTION
          </div>
          <div
            className="text-sm text-[var(--color-text-muted)] mb-3 italic"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            「{compact.question}」
          </div>
          <p
            className="text-base leading-[2] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {reading.answerToQuestion}
          </p>
        </div>
      )}

      {/* 分段解读 */}
      {sections.map((sec) => {
        const text = reading[sec.key];
        if (typeof text !== "string" || !text) return null;
        return (
          <div key={sec.key as string} className="border-l-2 border-[rgba(212,175,55,0.35)] pl-4">
            <div
              className="text-[11px] text-[var(--color-gold-soft)] tracking-[0.3em] mb-2"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              {sec.label}
            </div>
            <p
              className="text-sm md:text-base leading-[1.9] text-[var(--color-text-muted)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {text}
            </p>
          </div>
        );
      })}

      {/* 行动建议 */}
      {reading.advice && reading.advice.length > 0 && (
        <div className="pt-4 border-t border-[rgba(212,175,55,0.15)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--color-gold)]">⟡</span>
            <span
              className="text-[11px] text-[var(--color-gold-soft)] tracking-[0.3em]"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              ADVICE
            </span>
          </div>
          <ul className="space-y-2">
            {reading.advice.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                <span className="text-[var(--color-gold)] mt-1">✦</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* factRefs 只作审计用，debug 时在底部小字显示 */}
      {reading.factRefs && reading.factRefs.length > 0 && (
        <details className="pt-3">
          <summary className="text-[10px] text-[var(--color-text-dim)] cursor-pointer tracking-wider">
            命盘引用（审计）
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {reading.factRefs.map((f, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[10px] text-[var(--color-text-dim)] border border-[rgba(212,175,55,0.15)] rounded"
              >
                {f}
              </span>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
