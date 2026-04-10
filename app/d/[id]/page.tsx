import { notFound } from "next/navigation";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDestinyShare } from "@/lib/db/d1";
import { StarField } from "@/components/backgrounds/StarField";
import { MysticHeader } from "@/components/layout/MysticHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { RuneIcon } from "@/components/ui/RuneIcon";
import { BaziTable } from "@/components/destiny/BaziTable";
import { WuxingRadar } from "@/components/destiny/WuxingRadar";
import { DaYunTimeline } from "@/components/destiny/DaYunTimeline";
import { ZiweiMobile } from "@/components/destiny/ZiweiMobile";
import { ReadingPanel } from "@/components/destiny/ReadingPanel";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const data = await getDestinyShare(env.DB, id);
  if (!data) return { title: "命盘已散 · 观命" };

  const dm = data.compact.bazi.dayMaster;
  const gz = data.compact.bazi.gz.replace(/\|/g, " ");
  const title = `${dm} · ${gz} · 观命`;
  const desc = data.reading.geju.slice(0, 80);
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function DestinyShareResultPage({ params }: PageProps) {
  const { id } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const data = await getDestinyShare(env.DB, id);
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

      <main className="relative z-10 px-5 md:px-8 pb-20 max-w-3xl mx-auto">
        <section className="text-center pt-4 pb-6">
          <p
            className="text-xs tracking-[0.3em] text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            SHARED CHART · {date}
          </p>
          <h1
            className="mt-3 text-3xl md:text-4xl text-gold-glow tracking-[0.2em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            观 命
          </h1>
        </section>

        <div className="space-y-5">
          <GlassCard padding="lg">
            <SectionHeader title="八字四柱" titleEn="FOUR PILLARS" />
            <BaziTable compact={data.compact} />
            {data.compact.trueSolar && (
              <p className="mt-3 text-[10px] text-[var(--color-text-dim)] text-center">
                {data.compact.trueSolar}
              </p>
            )}
          </GlassCard>

          <GlassCard padding="lg">
            <SectionHeader title="五行偏颇" titleEn="FIVE ELEMENTS" />
            <WuxingRadar compact={data.compact} />
          </GlassCard>

          <GlassCard padding="lg">
            <SectionHeader title="大运行程" titleEn="GRAND LUCK" />
            <DaYunTimeline compact={data.compact} />
          </GlassCard>

          {data.compact.ziwei && (
            <GlassCard padding="lg">
              <SectionHeader title="紫微命盘" titleEn="PURPLE STAR" />
              <ZiweiMobile compact={data.compact} />
            </GlassCard>
          )}

          <GlassCard padding="lg" glow="gold">
            <SectionHeader title="命理解读" titleEn="THE READING" />
            <ReadingPanel reading={data.reading} compact={data.compact} />
          </GlassCard>

          <div className="text-center pt-2">
            <Link
              href="/destiny"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-gold-soft)] hover:text-[var(--color-gold)] transition-colors"
            >
              <RuneIcon name="hexagram" size={16} />
              <span>观我之命</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <p className="text-center mt-6 text-[10px] text-[var(--color-text-dim)] tracking-[0.2em]">
          · 此盘封存 7 日 ·
        </p>
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
