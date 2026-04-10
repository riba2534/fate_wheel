"use client";

import { useEffect, useRef, useState } from "react";
import { StarField } from "@/components/backgrounds/StarField";
import { MysticHeader } from "@/components/layout/MysticHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { MysticButton } from "@/components/ui/MysticButton";
import { RuneIcon } from "@/components/ui/RuneIcon";
import { BirthForm } from "@/components/destiny/BirthForm";
import { BaziTable } from "@/components/destiny/BaziTable";
import { WuxingRadar } from "@/components/destiny/WuxingRadar";
import { DaYunTimeline } from "@/components/destiny/DaYunTimeline";
import { ZiweiMobile } from "@/components/destiny/ZiweiMobile";
import { ReadingPanel } from "@/components/destiny/ReadingPanel";
import { AskMoreBox } from "@/components/destiny/AskMoreBox";
import { DestinyShareBox } from "@/components/destiny/DestinyShareBox";
import { getClientId } from "@/lib/user-id";
import type { BirthFormState, DestinyResponse, DestinyReading } from "@/types/destiny";
import type { ApiError } from "@/types";

type Stage = "input" | "casting" | "result" | "error";

interface AskHistoryEntry {
  question: string;
  reading: DestinyReading;
  createdAt: number;
}

export default function DestinyPage() {
  const [stage, setStage] = useState<Stage>("input");
  const [result, setResult] = useState<DestinyResponse | null>(null);
  const [askHistory, setAskHistory] = useState<AskHistoryEntry[]>([]);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [errorMsg, setErrorMsg] = useState("");
  const clientIdRef = useRef<string>("");

  useEffect(() => {
    clientIdRef.current = getClientId();
  }, []);

  const handleSubmit = async (form: BirthFormState) => {
    setStage("casting");
    setErrorMsg("");
    setAskHistory([]);
    setGender(form.gender);

    const payload = {
      year: parseInt(form.year, 10),
      month: parseInt(form.month, 10),
      day: parseInt(form.day, 10),
      hour: form.timeMode === "precise" ? parseInt(form.hour, 10) : undefined,
      minute: form.timeMode === "precise" ? parseInt(form.minute, 10) : undefined,
      timeMode: form.timeMode,
      timePeriod: form.timeMode === "period" ? form.timePeriod : undefined,
      gender: form.gender,
      birthProvince: form.birthProvince || undefined,
      topics: form.topics,
      question: form.question.trim() || undefined,
    };

    try {
      const resp = await fetch("/api/divine/destiny", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": clientIdRef.current,
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const err = (await resp.json()) as ApiError;
        throw new Error(err.error);
      }
      const data = (await resp.json()) as DestinyResponse;
      setResult(data);
      setStage("result");

      // 把日主写入 IndexedDB 以便旧模式微增强（Phase 6 使用）
      try {
        localStorage.setItem(
          "fw:day-master",
          `${data.compact.bazi.dayMaster}`,
        );
      } catch {}
    } catch (err) {
      setErrorMsg((err as Error).message || "观命失败，请重试");
      setStage("error");
    }
  };

  const reset = () => {
    setStage("input");
    setResult(null);
    setAskHistory([]);
    setErrorMsg("");
  };

  const handleAskAnswered = (entry: AskHistoryEntry) => {
    setAskHistory((prev) => [...prev, entry]);
  };

  return (
    <>
      <StarField density={120} />
      <MysticHeader />

      <main className="relative z-10 px-5 md:px-8 pb-20 max-w-4xl mx-auto">
        {/* 标题 */}
        <section className="text-center pt-4 pb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--color-gold)]" />
            <RuneIcon name="hexagram" size={18} className="text-[var(--color-gold-soft)]" />
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--color-gold)]" />
          </div>
          <h1
            className="text-3xl md:text-5xl text-gold-glow tracking-[0.2em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            观 命
          </h1>
          <p
            className="mt-2 text-xs tracking-[0.3em] text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            OBSERVE FATE · 八字紫微同参
          </p>
          <p
            className="mt-4 text-sm text-[var(--color-text-dim)] leading-[1.9] max-w-md mx-auto"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            以生辰为钥，排八字四柱紫微十二宫。<br />
            以真数入局，非空言浮语。
          </p>
        </section>

        {/* 主内容 */}
        <section>
          {stage === "input" && <BirthForm onSubmit={handleSubmit} loading={false} />}

          {stage === "casting" && (
            <GlassCard padding="lg" className="text-center">
              <p
                className="text-[var(--color-gold-soft)] tracking-[0.3em] text-sm"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                CASTING THE CHART
              </p>
              <p
                className="mt-2 text-lg text-[var(--color-text-muted)] tracking-widest"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                排盘推演 · 命途初现
              </p>
              <p className="mt-3 text-xs text-[var(--color-text-dim)]">
                (天干地支已定，山中老儒运笔推演中……)
              </p>
              <div className="mt-6 flex justify-center">
                <div className="w-10 h-10 border-2 border-[var(--color-gold)] border-r-transparent rounded-full animate-spin" />
              </div>
            </GlassCard>
          )}

          {stage === "result" && result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* 八字四柱 */}
              <GlassCard padding="lg">
                <SectionHeader title="八字四柱" titleEn="FOUR PILLARS" />
                <BaziTable compact={result.compact} />
                {result.compact.trueSolar && (
                  <p className="mt-3 text-[10px] text-[var(--color-text-dim)] text-center">
                    {result.compact.trueSolar}
                  </p>
                )}
              </GlassCard>

              {/* 五行 */}
              <GlassCard padding="lg">
                <SectionHeader title="五行偏颇" titleEn="FIVE ELEMENTS" />
                <WuxingRadar compact={result.compact} />
              </GlassCard>

              {/* 大运 */}
              <GlassCard padding="lg">
                <SectionHeader title="大运行程" titleEn="GRAND LUCK" />
                <DaYunTimeline compact={result.compact} />
                <p className="mt-2 text-[10px] text-[var(--color-text-dim)] text-center">
                  起运 {result.compact.bazi.daYun[0]?.age}，每步十年。当前大运高亮。
                </p>
              </GlassCard>

              {/* 紫微 */}
              {result.compact.ziwei && (
                <GlassCard padding="lg">
                  <SectionHeader title="紫微命盘" titleEn="PURPLE STAR" />
                  <ZiweiMobile compact={result.compact} />
                </GlassCard>
              )}

              {result.compact.hourUnknown && (
                <div className="text-center text-xs text-[var(--color-text-dim)] italic">
                  因时辰未知，紫微盘已省去，时柱亦不入解读。
                </div>
              )}

              {/* LLM 解读 */}
              <GlassCard padding="lg" glow="gold">
                <SectionHeader title="命理解读" titleEn="THE READING" />
                <ReadingPanel
                  reading={result.reading}
                  compact={result.compact}
                  llmFailed={result.llmFailed}
                />
              </GlassCard>

              {/* 分享卡片 */}
              <DestinyShareBox
                compact={result.compact}
                reading={result.reading}
                gender={gender}
              />

              {/* 同盘追问 */}
              {result.sessionToken && (
                <AskMoreBox
                  sessionToken={result.sessionToken}
                  clientId={clientIdRef.current}
                  onAnswered={handleAskAnswered}
                  history={askHistory}
                  compact={result.compact}
                />
              )}

              <div className="flex justify-center gap-3 flex-wrap pt-2">
                <MysticButton variant="ghost" size="md" onClick={reset}>
                  重新观命
                </MysticButton>
              </div>
            </div>
          )}

          {stage === "error" && (
            <GlassCard padding="lg" className="text-center">
              <div className="text-[#F5A3B5] mb-2">✦ 天机不可泄 ✦</div>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">{errorMsg}</p>
              <MysticButton variant="ghost" size="md" onClick={reset}>
                重新观命
              </MysticButton>
            </GlassCard>
          )}
        </section>
      </main>
    </>
  );
}

function SectionHeader({ title, titleEn }: { title: string; titleEn: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="h-px flex-1 bg-gradient-to-r from-[rgba(212,175,55,0.4)] to-transparent" />
      <div className="text-center">
        <div
          className="text-base text-[var(--color-gold-soft)] tracking-widest"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </div>
        <div
          className="text-[9px] text-[var(--color-text-dim)] tracking-[0.3em]"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          {titleEn}
        </div>
      </div>
      <span className="h-px flex-1 bg-gradient-to-l from-[rgba(212,175,55,0.4)] to-transparent" />
    </div>
  );
}
