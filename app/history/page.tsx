"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StarField } from "@/components/backgrounds/StarField";
import { MysticHeader } from "@/components/layout/MysticHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { MysticButton } from "@/components/ui/MysticButton";
import { RuneIcon } from "@/components/ui/RuneIcon";
import { listHistory, deleteHistory, type HistoryEntry } from "@/lib/storage/history";

const TYPE_META: Record<string, { label: string; rune: "wheel" | "moon" | "bagua" }> = {
  wheel: { label: "命运之轮", rune: "wheel" },
  daily: { label: "每日一签", rune: "moon" },
  iching: { label: "周易六十四卦", rune: "bagua" },
};

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const list = await listHistory(30);
      setEntries(list);
      const urls: Record<string, string> = {};
      for (const e of list) {
        urls[e.id] = URL.createObjectURL(e.imageBlob);
      }
      setPreviews(urls);
      setLoading(false);
    })();
    return () => {
      // 清理 URL
      Object.values(previews).forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id: string) => {
    await deleteHistory(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (previews[id]) URL.revokeObjectURL(previews[id]!);
  };

  const getTitle = (e: HistoryEntry): string => {
    if (e.raw.type === "wheel") return e.raw.sector.name;
    if (e.raw.type === "daily") return e.raw.signName;
    if (e.raw.type === "iching") return e.raw.hexagram.name;
    return "—";
  };

  return (
    <>
      <StarField density={60} />
      <MysticHeader showHistory={false} />

      <main className="relative z-10 px-5 md:px-8 pb-20 max-w-4xl mx-auto">
        <section className="text-center pt-4 pb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--color-gold)]" />
            <RuneIcon name="scroll" size={18} className="text-[var(--color-gold-soft)]" />
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--color-gold)]" />
          </div>
          <h1
            className="text-3xl md:text-4xl text-gold-glow tracking-[0.2em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            卦象簿
          </h1>
          <p
            className="mt-2 text-xs tracking-[0.3em] text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            ORACLE ARCHIVE
          </p>
          {!loading && (
            <p className="mt-3 text-xs text-[var(--color-text-dim)]">
              已占卜 {entries.length} 卦 · 仅存于本机
            </p>
          )}
        </section>

        {loading && (
          <GlassCard padding="lg" className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-[var(--color-gold)] border-r-transparent animate-spin mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">翻阅卦象簿中……</p>
          </GlassCard>
        )}

        {!loading && entries.length === 0 && (
          <GlassCard padding="lg" className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(124,58,237,0.15)] flex items-center justify-center mb-5">
              <RuneIcon name="scroll" size={36} className="text-[var(--color-text-dim)]" />
            </div>
            <p
              className="text-base leading-[2] text-[var(--color-text-muted)] mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              卦象簿尚空<br />
              尚无占卜之象，去问天一卦吧
            </p>
            <Link href="/">
              <MysticButton variant="gold" size="md">
                <RuneIcon name="wheel" size={16} />
                开始占卜
              </MysticButton>
            </Link>
          </GlassCard>
        )}

        {!loading && entries.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {entries.map((e) => {
              const meta = TYPE_META[e.type] ?? TYPE_META["wheel"]!;
              const date = new Date(e.createdAt).toLocaleDateString("zh-CN", {
                month: "2-digit",
                day: "2-digit",
              });
              const time = new Date(e.createdAt).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <GlassCard key={e.id} padding="md" className="flex gap-4">
                  {/* 卡片缩略图 */}
                  <div
                    className="relative flex-shrink-0 rounded-lg overflow-hidden border border-[rgba(212,175,55,0.25)] bg-[rgba(10,6,24,0.6)]"
                    style={{ width: "72px", height: "128px" }}
                  >
                    {previews[e.id] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previews[e.id]}
                        alt={getTitle(e)}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
                      <RuneIcon
                        name={meta.rune}
                        size={12}
                        className="text-[var(--color-gold-soft)]"
                      />
                      <span className="tracking-wider">{meta.label}</span>
                      <span>·</span>
                      <span>{date}</span>
                      <span>{time}</span>
                    </div>
                    <h3
                      className="mt-1 text-lg text-gold-glow truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {getTitle(e)}
                    </h3>
                    <p
                      className="mt-1 text-xs leading-[1.7] text-[var(--color-text-muted)] line-clamp-2"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {e.raw.type === "wheel"
                        ? e.raw.reading.summary
                        : e.raw.type === "daily"
                          ? e.raw.reading.summary
                          : e.raw.reading.summary}
                    </p>
                    <div className="mt-auto pt-2 flex items-center gap-3">
                      <a
                        href={previews[e.id]}
                        download={`fate-${e.id.slice(0, 8)}.png`}
                        className="text-xs text-[var(--color-gold-soft)] hover:text-[var(--color-gold)] transition-colors"
                      >
                        下载
                      </a>
                      <Link
                        href={`/r/${e.id}`}
                        className="text-xs text-[var(--color-gold-soft)] hover:text-[var(--color-gold)] transition-colors"
                      >
                        详情
                      </Link>
                      <button
                        onClick={() => remove(e.id)}
                        className="text-xs text-[var(--color-text-dim)] hover:text-[#F5A3B5] transition-colors ml-auto"
                      >
                        焚毁
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
