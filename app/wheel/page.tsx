"use client";

import { useEffect, useRef, useState } from "react";
import { StarField } from "@/components/backgrounds/StarField";
import { MysticHeader } from "@/components/layout/MysticHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { MysticButton } from "@/components/ui/MysticButton";
import { RuneIcon } from "@/components/ui/RuneIcon";
import {
  FortuneWheel,
  type FortuneWheelHandle,
} from "@/components/wheel/FortuneWheel";
import { CardExporter } from "@/components/card/CardExporter";
import { getClientId } from "@/lib/user-id";
import type { WheelResponse, ApiError } from "@/types";

type Stage = "input" | "spinning" | "result" | "error";

export default function WheelPage() {
  const wheelRef = useRef<FortuneWheelHandle>(null);
  const [stage, setStage] = useState<Stage>("input");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<WheelResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const clientIdRef = useRef<string>("");

  useEffect(() => {
    clientIdRef.current = getClientId();
  }, []);

  const handleSpin = async () => {
    const q = question.trim();
    if (q.length < 2) return;

    setStage("spinning");
    setErrorMsg("");
    wheelRef.current?.startSpinning();

    try {
      const resp = await fetch("/api/divine/wheel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": clientIdRef.current,
        },
        body: JSON.stringify({ question: q }),
      });

      if (!resp.ok) {
        const err = (await resp.json()) as ApiError;
        throw new Error(err.error);
      }

      const data = (await resp.json()) as WheelResponse;
      setResult(data);
      await wheelRef.current?.stopAt(data.sectorIndex);
      setStage("result");
    } catch (err) {
      wheelRef.current?.reset();
      setErrorMsg((err as Error).message || "占卜失败，请重试");
      setStage("error");
    }
  };

  const reset = () => {
    setStage("input");
    setResult(null);
    setErrorMsg("");
    wheelRef.current?.reset();
  };

  const hue = result?.sector.hue ?? "purple";
  const levelColor =
    hue === "crimson"
      ? "border-[rgba(220,50,90,0.5)] text-[#F5A3B5]"
      : "border-[rgba(212,175,55,0.5)] text-[var(--color-gold-soft)]";

  return (
    <>
      <StarField density={100} />
      <MysticHeader />

      <main className="relative z-10 px-5 md:px-8 pb-20 max-w-3xl mx-auto">
        {/* 标题 */}
        <section className="text-center pt-4 pb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--color-gold)]" />
            <RuneIcon name="wheel" size={18} className="text-[var(--color-gold-soft)]" />
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--color-gold)]" />
          </div>
          <h1
            className="text-3xl md:text-4xl text-gold-glow tracking-[0.2em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            命运之轮
          </h1>
          <p
            className="mt-2 text-xs tracking-[0.3em] text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            WHEEL OF FATE
          </p>
        </section>

        {/* 轮盘 */}
        <section className="mb-6">
          <FortuneWheel ref={wheelRef} />
        </section>

        {/* 输入/结果区 */}
        <section>
          {stage === "input" && (
            <GlassCard padding="lg" className="text-center">
              <label
                htmlFor="question"
                className="block mb-3 text-sm text-[var(--color-text-muted)] tracking-wider"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                叩问心中所惑
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
                placeholder="今日运势如何？是否应接受这个邀请？..."
                rows={3}
                maxLength={200}
                className="w-full bg-[rgba(10,6,24,0.5)] border border-[rgba(212,175,55,0.2)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
                style={{ fontFamily: "var(--font-serif)" }}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-text-dim)]">
                <span>{question.length}/200</span>
                <span className="tracking-wider">心诚则灵</span>
              </div>
              <div className="mt-6">
                <MysticButton
                  variant="gold"
                  size="lg"
                  onClick={handleSpin}
                  disabled={question.trim().length < 2}
                  className="min-w-[200px]"
                >
                  <RuneIcon name="wheel" size={18} />
                  转动命轮
                </MysticButton>
              </div>
            </GlassCard>
          )}

          {stage === "spinning" && (
            <GlassCard padding="lg" className="text-center">
              <p
                className="text-[var(--color-gold-soft)] tracking-[0.3em] text-sm"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                THE WHEEL TURNS
              </p>
              <p
                className="mt-2 text-lg text-[var(--color-text-muted)] tracking-widest"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                天轮转动 · 命途已启
              </p>
              <p className="mt-3 text-xs text-[var(--color-text-dim)]">
                (山中道人运笔推算中……)
              </p>
            </GlassCard>
          )}

          {stage === "result" && result && (
            <GlassCard
              padding="lg"
              glow={hue === "gold" ? "gold" : "purple"}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              <div className="text-center">
                <span
                  className={`inline-block px-4 py-1 rounded-full text-xs tracking-[0.3em] border ${levelColor}`}
                >
                  {result.sector.level} · {result.sector.score}/10
                </span>
                <h2
                  className="mt-4 text-3xl text-gold-glow tracking-[0.15em]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {result.sector.name}
                </h2>
                <p
                  className="mt-1 text-xs tracking-[0.25em] text-[var(--color-text-muted)]"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {result.sector.nameEn}
                </p>
                <div className="divider-gold my-6 mx-auto max-w-[200px]" />
                <p
                  className="text-base leading-[2] text-[var(--color-text)] text-left"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {result.reading.summary}
                </p>
              </div>

              {/* 四维解读 */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {(
                  [
                    { key: "career", label: "事业", rune: "mountain" },
                    { key: "love", label: "情感", rune: "lotus" },
                    { key: "wealth", label: "财运", rune: "coin" },
                    { key: "health", label: "健康", rune: "sun" },
                  ] as const
                ).map((it) => (
                  <div
                    key={it.key}
                    className="p-3 rounded-lg border border-[rgba(212,175,55,0.15)] bg-[rgba(10,6,24,0.4)]"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <RuneIcon
                        name={it.rune}
                        size={14}
                        className="text-[var(--color-gold-soft)]"
                      />
                      <span className="text-xs text-[var(--color-gold-soft)] tracking-wider">
                        {it.label}
                      </span>
                    </div>
                    <p
                      className="text-xs leading-[1.7] text-[var(--color-text-muted)]"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {result.reading.aspects[it.key]}
                    </p>
                  </div>
                ))}
              </div>

              {/* 幸运元素 */}
              <div className="mt-4 flex items-center justify-around text-center p-3 border-t border-[rgba(212,175,55,0.15)]">
                <div>
                  <p className="text-[10px] text-[var(--color-text-dim)] tracking-wider">幸运色</p>
                  <p
                    className="text-sm text-[var(--color-gold-soft)] mt-0.5"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {result.reading.lucky.color}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-dim)] tracking-wider">数字</p>
                  <p
                    className="text-sm text-[var(--color-gold-soft)] mt-0.5"
                    style={{ fontFamily: "var(--font-cinzel)" }}
                  >
                    {result.reading.lucky.number}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-dim)] tracking-wider">方位</p>
                  <p
                    className="text-sm text-[var(--color-gold-soft)] mt-0.5"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {result.reading.lucky.direction}
                  </p>
                </div>
              </div>

              {/* 行动建议 */}
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
                  再问一次
                </MysticButton>
                <CardExporter data={result} />
              </div>
            </GlassCard>
          )}

          {stage === "error" && (
            <GlassCard padding="lg" className="text-center">
              <div className="text-[#F5A3B5] mb-2">✦ 天机不可泄 ✦</div>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">{errorMsg}</p>
              <MysticButton variant="ghost" size="md" onClick={reset}>
                重新占卜
              </MysticButton>
            </GlassCard>
          )}
        </section>
      </main>
    </>
  );
}
