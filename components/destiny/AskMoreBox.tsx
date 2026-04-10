"use client";

import { useState } from "react";
import { MysticButton } from "@/components/ui/MysticButton";
import { GlassCard } from "@/components/ui/GlassCard";
import type { CompactChart, DestinyReading } from "@/types/destiny";

interface Props {
  sessionToken: string;
  clientId: string;
  onAnswered: (entry: { question: string; reading: DestinyReading; createdAt: number }) => void;
  history: Array<{ question: string; reading: DestinyReading; createdAt: number }>;
  compact: CompactChart;
}

const TOPIC_OPTIONS = [
  { key: "career" as const, label: "事业" },
  { key: "love" as const, label: "感情" },
  { key: "wealth" as const, label: "财运" },
  { key: "health" as const, label: "健康" },
  { key: "study" as const, label: "学业" },
  { key: "overall" as const, label: "综合" },
];

export function AskMoreBox({ sessionToken, clientId, onAnswered, history, compact }: Props) {
  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState<typeof TOPIC_OPTIONS[number]["key"]>("overall");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    const q = question.trim();
    if (q.length < 2) return;
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/divine/destiny/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": clientId,
        },
        body: JSON.stringify({ sessionToken, question: q, topic }),
      });
      if (!resp.ok) {
        const err = (await resp.json()) as { error?: string };
        throw new Error(err.error || "追问失败");
      }
      const data = (await resp.json()) as {
        question: string;
        reading: DestinyReading;
        createdAt: number;
      };
      onAnswered({ question: data.question, reading: data.reading, createdAt: data.createdAt });
      setQuestion("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard padding="lg">
      <div className="flex items-center gap-3 mb-4">
        <span className="h-px flex-1 bg-gradient-to-r from-[rgba(212,175,55,0.4)] to-transparent" />
        <div className="text-center">
          <div
            className="text-base text-[var(--color-gold-soft)] tracking-widest"
            style={{ fontFamily: "var(--font-display)" }}
          >
            再问一事
          </div>
          <div
            className="text-[9px] text-[var(--color-text-dim)] tracking-[0.3em]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            ASK MORE OF THE CHART
          </div>
        </div>
        <span className="h-px flex-1 bg-gradient-to-l from-[rgba(212,175,55,0.4)] to-transparent" />
      </div>

      <p className="text-xs text-[var(--color-text-dim)] mb-3 leading-relaxed">
        本盘 24 小时内有效。可针对当前命盘追问不同主题，山中老儒会以同一命盘的事实再为你解。
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {TOPIC_OPTIONS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTopic(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
              topic === t.key
                ? "border-[var(--color-gold)] bg-[rgba(212,175,55,0.15)] text-[var(--color-gold-soft)]"
                : "border-[rgba(212,175,55,0.2)] text-[var(--color-text-muted)]"
            }`}
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
        placeholder="如：今年下半年是否换城市发展？"
        rows={2}
        maxLength={200}
        className="w-full bg-[rgba(10,6,24,0.5)] border border-[rgba(212,175,55,0.2)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-gold)] resize-none"
        style={{ fontFamily: "var(--font-serif)" }}
      />
      <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-text-dim)]">
        <span>{question.length}/200</span>
        <span className="tracking-wider">心诚则灵</span>
      </div>

      {error && <p className="mt-2 text-sm text-[#F5A3B5] text-center">{error}</p>}

      <div className="mt-4 flex justify-center">
        <MysticButton
          variant="primary"
          size="md"
          onClick={handleAsk}
          loading={loading}
          disabled={question.trim().length < 2}
          className="min-w-[160px]"
        >
          再问此盘
        </MysticButton>
      </div>

      {history.length > 0 && (
        <details className="mt-6">
          <summary className="text-xs text-[var(--color-gold-soft)] cursor-pointer tracking-wider">
            过往追问 · {history.length} 条
          </summary>
          <div className="mt-3 space-y-3">
            {history.map((h, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-[rgba(212,175,55,0.15)] bg-[rgba(10,6,24,0.4)]"
              >
                <div className="text-xs text-[var(--color-gold-soft)] mb-1.5 italic">
                  「{h.question}」
                </div>
                {h.reading.answerToQuestion && (
                  <p
                    className="text-sm leading-[1.8] text-[var(--color-text-muted)]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {h.reading.answerToQuestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      <p className="mt-3 text-[10px] text-[var(--color-text-dim)] text-center">
        当前命盘日主：{compact.bazi.dayMaster}
      </p>
    </GlassCard>
  );
}
