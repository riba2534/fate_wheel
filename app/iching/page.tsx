"use client";

import { useRef, useState } from "react";
import { StarField } from "@/components/backgrounds/StarField";
import { MysticHeader } from "@/components/layout/MysticHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { MysticButton } from "@/components/ui/MysticButton";
import { RuneIcon } from "@/components/ui/RuneIcon";
import { CoinToss, type CoinTossHandle } from "@/components/iching/CoinToss";
import { CardExporter } from "@/components/card/CardExporter";
import { QuestionContext } from "@/components/card/QuestionContext";
import { getClientId } from "@/lib/user-id";
import type { IChingResponse, ApiError } from "@/types";

type Stage = "input" | "tossing" | "calling" | "result" | "error";

export default function IChingPage() {
  const coinRef = useRef<CoinTossHandle>(null);
  const [stage, setStage] = useState<Stage>("input");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<IChingResponse | null>(null);
  const [error, setError] = useState("");

  const divine = async () => {
    const q = question.trim();
    if (q.length < 2) return;
    setStage("tossing");
    setError("");
    try {
      const lines = (await coinRef.current?.toss()) ?? [];
      if (lines.length !== 6) throw new Error("摇卦未完成");

      setStage("calling");
      const resp = await fetch("/api/divine/iching", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": getClientId(),
        },
        body: JSON.stringify({ question: q, lines }),
      });
      if (!resp.ok) {
        const err = (await resp.json()) as ApiError;
        throw new Error(err.error);
      }
      const data = (await resp.json()) as IChingResponse;
      setResult(data);
      setStage("result");
    } catch (err) {
      setError((err as Error).message);
      setStage("error");
    }
  };

  const reset = () => {
    setStage("input");
    setResult(null);
    setError("");
    coinRef.current?.reset();
  };

  return (
    <>
      <StarField density={80} />
      <MysticHeader />
      <main className="relative z-10 px-5 md:px-8 pb-20 max-w-2xl mx-auto">
        <section className="text-center pt-4 pb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--color-gold)]" />
            <RuneIcon name="bagua" size={18} className="text-[var(--color-gold-soft)]" />
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--color-gold)]" />
          </div>
          <h1
            className="text-3xl md:text-4xl text-gold-glow tracking-[0.2em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            周易六十四卦
          </h1>
          <p
            className="mt-2 text-xs tracking-[0.3em] text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            I-CHING
          </p>
        </section>

        {(stage === "input" || stage === "tossing" || stage === "calling") && (
          <>
            <GlassCard padding="lg" className="mb-4">
              <CoinToss ref={coinRef} />
            </GlassCard>

            {stage === "input" && (
              <GlassCard padding="lg" className="text-center">
                <label
                  htmlFor="iching-question"
                  className="block mb-3 text-sm text-[var(--color-text-muted)] tracking-wider"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  心中默念所问之事
                </label>
                <textarea
                  id="iching-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
                  placeholder="今年事业能否更上一层？..."
                  rows={3}
                  maxLength={200}
                  className="w-full bg-[rgba(10,6,24,0.5)] border border-[rgba(212,175,55,0.2)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
                  style={{ fontFamily: "var(--font-serif)" }}
                />
                <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-text-dim)]">
                  <span>{question.length}/200</span>
                  <span className="tracking-wider">铜钱三掷，六爻成卦</span>
                </div>
                <div className="mt-6">
                  <MysticButton
                    variant="gold"
                    size="lg"
                    onClick={divine}
                    disabled={question.trim().length < 2}
                  >
                    <RuneIcon name="coin" size={18} />
                    摇卦问天
                  </MysticButton>
                </div>
              </GlassCard>
            )}

            {stage === "tossing" && (
              <GlassCard padding="md" className="text-center">
                <p
                  className="text-[var(--color-gold-soft)] tracking-[0.3em] text-sm"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  CASTING COINS
                </p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  铜钱落卦，心念专一
                </p>
              </GlassCard>
            )}

            {stage === "calling" && (
              <GlassCard padding="md" className="text-center">
                <p
                  className="text-[var(--color-gold-soft)] tracking-[0.3em] text-sm"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  INTERPRETING
                </p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  六爻成象 · 正在解卦
                </p>
              </GlassCard>
            )}
          </>
        )}

        {stage === "result" && result && (
          <GlassCard
            padding="lg"
            glow="purple"
            className="animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            {result.question && (
              <QuestionContext question={result.question} className="mb-5" />
            )}
            <div className="text-center">
              <div
                className="text-[72px] leading-none text-[var(--color-gold-soft)] mb-3"
                style={{ fontFamily: "serif" }}
              >
                {result.hexagram.symbol}
              </div>
              <h2
                className="text-3xl text-gold-glow tracking-[0.1em]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {result.hexagram.name}
              </h2>
              <p
                className="mt-3 text-sm leading-[2] text-[var(--color-text-muted)] italic"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {result.hexagram.text}
              </p>
              {result.changedHexagram && (
                <p className="mt-3 text-xs text-[var(--color-text-dim)] tracking-wider">
                  变卦：{result.changedHexagram.name} {result.changedHexagram.symbol}
                </p>
              )}
              <div className="divider-gold my-5 mx-auto max-w-[200px]" />
              <p
                className="text-base leading-[2] text-[var(--color-text)] text-justify"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {result.reading.summary}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {(
                [
                  { key: "career" as const, label: "事业", rune: "mountain" as const },
                  { key: "love" as const, label: "情感", rune: "lotus" as const },
                  { key: "wealth" as const, label: "财运", rune: "coin" as const },
                  { key: "health" as const, label: "健康", rune: "sun" as const },
                ]
              ).map((it) => (
                <div
                  key={it.key}
                  className="p-3 rounded-lg border border-[rgba(212,175,55,0.15)] bg-[rgba(10,6,24,0.4)]"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <RuneIcon name={it.rune} size={14} className="text-[var(--color-gold-soft)]" />
                    <span className="text-xs text-[var(--color-gold-soft)] tracking-wider">
                      {it.label}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-[1.7] text-[var(--color-text-muted)]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {result.reading[it.key]}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-around p-3 border-t border-b border-[rgba(212,175,55,0.15)]">
              <div className="text-center">
                <p className="text-[10px] text-[var(--color-text-dim)]">幸运色</p>
                <p className="text-sm text-[var(--color-gold-soft)]">{result.reading.lucky.color}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[var(--color-text-dim)]">数字</p>
                <p
                  className="text-sm text-[var(--color-gold-soft)]"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {result.reading.lucky.number}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[var(--color-text-dim)]">方位</p>
                <p className="text-sm text-[var(--color-gold-soft)]">{result.reading.lucky.direction}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[var(--color-gold)]">⟡</span>
                <span className="text-xs text-[var(--color-gold-soft)] tracking-[0.25em]">今日宜</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.reading.advice.map((a, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-sm border border-[rgba(212,175,55,0.3)] rounded-full bg-[rgba(124,58,237,0.1)] text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <MysticButton variant="ghost" size="md" onClick={reset}>
                再摇一卦
              </MysticButton>
              <CardExporter data={result} />
            </div>
          </GlassCard>
        )}

        {stage === "error" && (
          <GlassCard padding="lg" className="text-center">
            <p className="text-[#F5A3B5] mb-2">✦ 天机不宜泄 ✦</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">{error}</p>
            <MysticButton variant="ghost" size="md" onClick={reset}>
              重新摇卦
            </MysticButton>
          </GlassCard>
        )}
      </main>
    </>
  );
}
