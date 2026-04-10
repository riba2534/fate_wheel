"use client";

import { useEffect, useState } from "react";
import { StarField } from "@/components/backgrounds/StarField";
import { MysticHeader } from "@/components/layout/MysticHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { MysticButton } from "@/components/ui/MysticButton";
import { RuneIcon } from "@/components/ui/RuneIcon";
import { CardExporter } from "@/components/card/CardExporter";
import { getClientId } from "@/lib/user-id";
import { getDailyCache, setDailyCache } from "@/lib/storage/daily-cache";
import type { DailyResponse, ApiError } from "@/types";

type Stage = "idle" | "drawing" | "ready" | "error";

const LEVEL_COLORS: Record<string, string> = {
  大吉: "border-[rgba(240,217,139,0.6)] text-[#F0D98B]",
  中吉: "border-[rgba(212,175,55,0.5)] text-[var(--color-gold-soft)]",
  小吉: "border-[rgba(167,139,250,0.5)] text-[#A78BFA]",
  平: "border-[rgba(160,154,184,0.4)] text-[var(--color-text-muted)]",
  小凶: "border-[rgba(220,50,90,0.4)] text-[#F5A3B5]",
  中凶: "border-[rgba(220,50,90,0.5)] text-[#F5A3B5]",
  大凶: "border-[rgba(220,50,90,0.6)] text-[#FA7299]",
};

export default function DailyPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<DailyResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // 先尝试读客户端缓存
    const cached = getDailyCache();
    if (cached) {
      setResult(cached);
      setStage("ready");
    }
  }, []);

  const draw = async () => {
    setStage("drawing");
    setError("");
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-client-id": getClientId(),
      };
      try {
        const dm = localStorage.getItem("fw:day-master");
        if (dm) headers["x-day-master"] = encodeURIComponent(dm);
      } catch {}
      const resp = await fetch("/api/divine/daily", {
        method: "POST",
        headers,
        body: "{}",
      });
      if (!resp.ok) {
        const err = (await resp.json()) as ApiError;
        throw new Error(err.error);
      }
      const data = (await resp.json()) as DailyResponse;
      setResult(data);
      setDailyCache(data);
      setStage("ready");
    } catch (err) {
      setError((err as Error).message);
      setStage("error");
    }
  };

  const levelClass = result ? LEVEL_COLORS[result.level] ?? LEVEL_COLORS["平"]! : "";

  return (
    <>
      <StarField density={80} />
      <MysticHeader />
      <main className="relative z-10 px-5 md:px-8 pb-20 max-w-2xl mx-auto">
        <section className="text-center pt-4 pb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--color-gold)]" />
            <RuneIcon name="moon" size={18} className="text-[var(--color-gold-soft)]" />
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--color-gold)]" />
          </div>
          <h1
            className="text-3xl md:text-4xl text-gold-glow tracking-[0.2em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            每日一签
          </h1>
          <p
            className="mt-2 text-xs tracking-[0.3em] text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            DAILY ORACLE
          </p>
        </section>

        {stage === "idle" && (
          <GlassCard padding="lg" className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(124,58,237,0.15)] flex items-center justify-center mb-5">
              <RuneIcon name="moon" size={36} className="text-[var(--color-gold-soft)]" />
            </div>
            <p
              className="text-base leading-[2] text-[var(--color-text-muted)] mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              今日天机未启<br />
              合掌净心，一签定今日之宜
            </p>
            <MysticButton variant="gold" size="lg" onClick={draw}>
              <RuneIcon name="scroll" size={18} />
              抽今日签
            </MysticButton>
          </GlassCard>
        )}

        {stage === "drawing" && (
          <GlassCard padding="lg" className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-[var(--color-gold)] border-r-transparent animate-spin mb-4" />
            <p
              className="text-[var(--color-gold-soft)] tracking-[0.3em] text-sm"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              DRAWING THE SIGN
            </p>
            <p
              className="mt-2 text-lg text-[var(--color-text-muted)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              摇签问天 · 请静心
            </p>
          </GlassCard>
        )}

        {stage === "ready" && result && (
          <GlassCard
            padding="lg"
            glow={result.level === "大吉" || result.level === "中吉" ? "gold" : "purple"}
            className="animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <div className="text-center">
              <div
                className={`inline-block px-4 py-1 rounded-full text-xs tracking-[0.3em] border ${levelClass}`}
              >
                第 {result.signNumber} 签 · {result.level}
              </div>
              <h2
                className="mt-4 text-4xl text-gold-glow tracking-[0.15em]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {result.signName}
              </h2>
              <div className="divider-gold my-6 mx-auto max-w-[200px]" />
              <div
                className="text-[var(--color-text-muted)] italic leading-[2.2] text-base whitespace-pre-line"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {result.signText.replace(/。/g, "。\n").trim()}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg border border-[rgba(212,175,55,0.15)] bg-[rgba(10,6,24,0.4)]">
              <p
                className="text-base leading-[2] text-[var(--color-text)] text-justify"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {result.reading.summary}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-around p-3 border-t border-b border-[rgba(212,175,55,0.15)]">
              <div className="text-center">
                <p className="text-[10px] text-[var(--color-text-dim)] tracking-wider">幸运色</p>
                <p className="text-sm text-[var(--color-gold-soft)] mt-0.5">
                  {result.reading.lucky.color}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[var(--color-text-dim)] tracking-wider">数字</p>
                <p
                  className="text-sm text-[var(--color-gold-soft)] mt-0.5"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {result.reading.lucky.number}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[var(--color-gold)]">⟡</span>
                <span className="text-xs text-[var(--color-gold-soft)] tracking-[0.25em]">今日宜</span>
              </div>
              <span
                className="inline-block px-4 py-2 text-sm border border-[rgba(212,175,55,0.3)] rounded-full bg-[rgba(124,58,237,0.1)] text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {result.reading.advice}
              </span>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <CardExporter data={result} />
            </div>

            <p className="mt-6 text-center text-[10px] text-[var(--color-text-dim)] tracking-[0.2em]">
              · 今签自今晨起，至明日晨时失效 ·
            </p>
          </GlassCard>
        )}

        {stage === "error" && (
          <GlassCard padding="lg" className="text-center">
            <p className="text-[#F5A3B5] mb-2">✦ 天机难窥 ✦</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">{error}</p>
            <MysticButton variant="ghost" size="md" onClick={() => setStage("idle")}>
              重新抽签
            </MysticButton>
          </GlassCard>
        )}
      </main>
    </>
  );
}
