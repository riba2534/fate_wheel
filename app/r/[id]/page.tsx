import { notFound } from "next/navigation";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getShare } from "@/lib/db/d1";
import { StarField } from "@/components/backgrounds/StarField";
import { MysticHeader } from "@/components/layout/MysticHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { RuneIcon } from "@/components/ui/RuneIcon";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const data = await getShare(env.DB, id);
  if (!data) return { title: "卦象已散 · 命轮" };

  let title = "命轮之卦";
  let desc = "一卦一运，知命而行";
  if (data.type === "wheel") {
    title = `${data.sector.name} · ${data.sector.level} · 命轮`;
    desc = data.reading.summary;
  } else if (data.type === "daily") {
    title = `${data.signName} · 每日一签`;
    desc = data.reading.summary;
  } else if (data.type === "iching") {
    title = `${data.hexagram.name} · 周易`;
    desc = data.reading.summary;
  }

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function ShareResultPage({ params }: PageProps) {
  const { id } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const data = await getShare(env.DB, id);
  if (!data) notFound();

  const date = new Date(data.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <StarField density={80} />
      <MysticHeader showHistory={false} />

      <main className="relative z-10 px-5 md:px-8 pb-20 max-w-2xl mx-auto">
        <section className="text-center pt-4 pb-6">
          <p
            className="text-xs tracking-[0.3em] text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            SHARED ORACLE · {date}
          </p>
        </section>

        <GlassCard padding="lg" glow="purple">
          {data.type === "wheel" && (
            <div>
              <div className="text-center mb-5">
                <span className="inline-block px-4 py-1 rounded-full text-xs tracking-[0.3em] border border-[rgba(212,175,55,0.5)] text-[var(--color-gold-soft)]">
                  {data.sector.level} · {data.sector.score}/10
                </span>
                <h1
                  className="mt-4 text-3xl text-gold-glow tracking-[0.15em]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {data.sector.name}
                </h1>
                <p
                  className="mt-1 text-xs tracking-[0.25em] text-[var(--color-text-muted)]"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {data.sector.nameEn}
                </p>
              </div>
              <p
                className="text-base leading-[2] text-[var(--color-text)] mb-6"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {data.reading.summary}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {(
                  [
                    { key: "career", label: "事业" },
                    { key: "love", label: "情感" },
                    { key: "wealth", label: "财运" },
                    { key: "health", label: "健康" },
                  ] as const
                ).map((it) => (
                  <div
                    key={it.key}
                    className="p-3 rounded-lg border border-[rgba(212,175,55,0.15)] bg-[rgba(10,6,24,0.4)]"
                  >
                    <div className="text-xs text-[var(--color-gold-soft)] tracking-wider mb-1">
                      {it.label}
                    </div>
                    <p
                      className="text-xs leading-[1.7] text-[var(--color-text-muted)]"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {data.reading.aspects[it.key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.type === "daily" && (
            <div>
              <div className="text-center mb-5">
                <span className="inline-block px-4 py-1 rounded-full text-xs tracking-[0.3em] border border-[rgba(212,175,55,0.5)] text-[var(--color-gold-soft)]">
                  第 {data.signNumber} 签 · {data.level}
                </span>
                <h1
                  className="mt-4 text-4xl text-gold-glow tracking-[0.15em]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {data.signName}
                </h1>
                <p
                  className="mt-3 text-sm leading-[2] text-[var(--color-text-muted)] italic whitespace-pre-line"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {data.signText.replace(/。/g, "。\n").trim()}
                </p>
              </div>
              <p
                className="text-base leading-[2] text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {data.reading.summary}
              </p>
            </div>
          )}

          {data.type === "iching" && (
            <div>
              <div className="text-center mb-5">
                <div
                  className="text-[72px] leading-none text-[var(--color-gold-soft)] mb-3"
                  style={{ fontFamily: "serif" }}
                >
                  {data.hexagram.symbol}
                </div>
                <h1
                  className="text-3xl text-gold-glow tracking-[0.1em]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {data.hexagram.name}
                </h1>
                <p
                  className="mt-3 text-sm leading-[2] text-[var(--color-text-muted)] italic"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {data.hexagram.text}
                </p>
              </div>
              <p
                className="text-base leading-[2] text-[var(--color-text)] mb-4"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {data.reading.summary}
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[rgba(212,175,55,0.15)] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-gold-soft)] hover:text-[var(--color-gold)] transition-colors"
            >
              <RuneIcon name="wheel" size={16} />
              <span>问我一卦</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </GlassCard>

        <p className="text-center mt-6 text-[10px] text-[var(--color-text-dim)] tracking-[0.2em]">
          · 此卦封存 7 日 ·
        </p>
      </main>
    </>
  );
}
