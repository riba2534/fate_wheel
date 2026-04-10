import Link from "next/link";
import { StarField } from "@/components/backgrounds/StarField";
import { MysticHeader } from "@/components/layout/MysticHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { RuneIcon, type RuneKey } from "@/components/ui/RuneIcon";

interface Portal {
  href: string;
  title: string;
  titleEn: string;
  rune: RuneKey;
  description: string;
  hint: string;
  glow: "purple" | "gold";
}

const DESTINY_PORTAL: Portal = {
  href: "/destiny",
  title: "观命",
  titleEn: "OBSERVE FATE",
  rune: "hexagram",
  description: "以生辰为钥，排八字四柱紫微十二宫。以真数入局，非空言浮语。",
  hint: "严肃命理",
  glow: "gold",
};

const LIGHT_PORTALS: Portal[] = [
  {
    href: "/wheel",
    title: "命运之轮",
    titleEn: "WHEEL OF FATE",
    rune: "wheel",
    description: "叩问心事，转动天轮，窥见命途所向。",
    hint: "输入你的问题",
    glow: "purple",
  },
  {
    href: "/daily",
    title: "每日一签",
    titleEn: "DAILY ORACLE",
    rune: "moon",
    description: "一日一签，顺天而行，观己之所宜所忌。",
    hint: "今日已备",
    glow: "gold",
  },
  {
    href: "/iching",
    title: "周易六十四卦",
    titleEn: "I-CHING",
    rune: "bagua",
    description: "三次摇卦，起卦问卜，察事业感情财运健康。",
    hint: "古法摇卦",
    glow: "purple",
  },
];

export default function HomePage() {
  return (
    <>
      <StarField density={140} />
      <MysticHeader showHistory />

      <main className="relative z-10 flex flex-col items-center px-5 md:px-8 pt-4 pb-20">
        {/* 品牌主视觉 */}
        <section className="text-center pt-8 pb-14 md:pt-16 md:pb-20 max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[var(--color-gold)]" />
            <RuneIcon
              name="hexagram"
              size={20}
              className="text-[var(--color-gold-soft)]"
            />
            <span
              className="text-xs tracking-[0.4em] text-[var(--color-gold-soft)] uppercase"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Divine the Unseen
            </span>
            <RuneIcon
              name="hexagram"
              size={20}
              className="text-[var(--color-gold-soft)]"
            />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[var(--color-gold)]" />
          </div>

          <h1
            className="text-[clamp(3rem,10vw,5.5rem)] leading-[1.1] text-gold-glow tracking-[0.15em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            命 · 轮
          </h1>

          <p
            className="mt-3 text-sm md:text-base tracking-[0.3em] text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            F A T E W H E E L
          </p>

          <div className="divider-gold mt-8 mx-auto max-w-[260px]" />

          <p
            className="mt-8 text-base md:text-lg leading-[2] text-[var(--color-text-muted)] max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            天道有常，人事无常。<br />
            以古法观世，以星辰问心。
          </p>
        </section>

        {/* 严肃命理 · 观命（主推） */}
        <section className="w-full max-w-5xl mb-10">
          <div className="flex items-center gap-3 mb-5 justify-center">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[var(--color-gold)]" />
            <span
              className="text-[11px] tracking-[0.4em] text-[var(--color-gold-soft)]"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              SERIOUS · 严肃命理
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[var(--color-gold)]" />
          </div>
          <Link
            href={DESTINY_PORTAL.href}
            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded-[20px]"
          >
            <GlassCard
              glow="gold"
              padding="lg"
              className="relative flex flex-col md:flex-row md:items-center gap-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:border-[rgba(212,175,55,0.6)]"
            >
              <div className="flex-shrink-0 mx-auto md:mx-0 w-20 h-20 rounded-full flex items-center justify-center border border-[rgba(212,175,55,0.4)] bg-gradient-to-br from-[rgba(212,175,55,0.3)] to-[rgba(159,18,57,0.2)] group-hover:scale-110 transition-transform duration-500">
                <RuneIcon name={DESTINY_PORTAL.rune} size={40} className="text-[var(--color-gold-soft)]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2
                  className="text-3xl md:text-4xl text-gold-glow tracking-[0.15em]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {DESTINY_PORTAL.title}
                </h2>
                <p
                  className="mt-1 text-[11px] tracking-[0.3em] text-[var(--color-gold-soft)]"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {DESTINY_PORTAL.titleEn}
                </p>
                <p
                  className="mt-4 text-sm md:text-base leading-[1.9] text-[var(--color-text-muted)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {DESTINY_PORTAL.description}
                </p>
              </div>
              <div className="flex items-center justify-center md:justify-end gap-1 text-[var(--color-gold-soft)] text-sm tracking-wider group-hover:gap-2 transition-all">
                enter<span aria-hidden>→</span>
              </div>
            </GlassCard>
          </Link>
        </section>

        <div className="flex items-center gap-3 mb-5 w-full max-w-5xl justify-center">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-[rgba(212,175,55,0.5)]" />
          <span
            className="text-[11px] tracking-[0.4em] text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            LIGHT · 轻度占卜
          </span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-[rgba(212,175,55,0.5)]" />
        </div>

        {/* 轻度三门 */}
        <section className="w-full max-w-5xl grid gap-5 md:gap-6 md:grid-cols-3">
          {LIGHT_PORTALS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded-[16px]"
            >
              <GlassCard
                glow={p.glow}
                padding="lg"
                className="h-full flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:border-[rgba(212,175,55,0.5)]"
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border border-[rgba(212,175,55,0.3)] bg-gradient-to-br ${
                      p.glow === "purple"
                        ? "from-[rgba(124,58,237,0.25)] to-[rgba(35,24,67,0.4)]"
                        : "from-[rgba(212,175,55,0.2)] to-[rgba(159,18,57,0.15)]"
                    } group-hover:scale-110 transition-transform duration-500`}
                  >
                    <RuneIcon
                      name={p.rune}
                      size={28}
                      className="text-[var(--color-gold-soft)]"
                    />
                  </div>
                  <span className="text-[10px] tracking-[0.2em] text-[var(--color-text-dim)]">
                    {p.hint}
                  </span>
                </div>

                <h2
                  className="text-2xl text-[var(--color-text)] tracking-wider mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.title}
                </h2>
                <p
                  className="text-[10px] tracking-[0.25em] text-[var(--color-gold-soft)] mb-4"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {p.titleEn}
                </p>

                <p
                  className="text-sm leading-[1.8] text-[var(--color-text-muted)] flex-1"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {p.description}
                </p>

                <div className="mt-5 pt-4 border-t border-[rgba(212,175,55,0.15)] flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-dim)]">
                    入此门
                  </span>
                  <span className="flex items-center gap-1 text-[var(--color-gold-soft)] group-hover:gap-2 transition-all">
                    <span className="text-xs tracking-wider">enter</span>
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </section>

        {/* 底部印记 */}
        <footer className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--color-text-dim)] text-xs tracking-[0.2em]">
            <span>庚寅年</span>
            <span className="text-[var(--color-gold)]">✦</span>
            <span
              style={{ fontFamily: "var(--font-cinzel)" }}
              className="uppercase"
            >
              {new Date().getFullYear()}
            </span>
            <span className="text-[var(--color-gold)]">✦</span>
            <span>于此问天</span>
          </div>
        </footer>
      </main>
    </>
  );
}
