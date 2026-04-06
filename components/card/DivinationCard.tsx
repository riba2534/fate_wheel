"use client";

import { forwardRef } from "react";
import { RuneIcon, type RuneKey } from "@/components/ui/RuneIcon";
import type { WheelResponse, DailyResponse, IChingResponse } from "@/types";

interface CardData {
  level: string;
  score?: number;
  titleZh: string;
  titleEn: string;
  symbol: RuneKey;
  summary: string;
  aspects?: { career: string; love: string; wealth: string; health: string };
  lucky: { color: string; number: number; direction?: string };
  advice: string[];
  hue: "gold" | "purple" | "crimson" | "neutral";
  question?: string;
  date: string;
}

function toCardData(data: WheelResponse | DailyResponse | IChingResponse): CardData {
  const date = new Date(data.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  if (data.type === "wheel") {
    return {
      level: data.sector.level,
      score: data.sector.score,
      titleZh: data.sector.name,
      titleEn: data.sector.nameEn,
      symbol: data.sector.symbol as RuneKey,
      summary: data.reading.summary,
      aspects: data.reading.aspects,
      lucky: data.reading.lucky,
      advice: data.reading.advice,
      hue: (data.sector.hue as CardData["hue"]) ?? "gold",
      question: data.question,
      date,
    };
  }
  if (data.type === "daily") {
    return {
      level: data.level,
      titleZh: data.signName,
      titleEn: "DAILY ORACLE",
      symbol: "moon",
      summary: data.reading.summary,
      lucky: { color: data.reading.lucky.color, number: data.reading.lucky.number },
      advice: [data.reading.advice],
      hue: "gold",
      date,
    };
  }
  // iching
  return {
    level: "—",
    titleZh: data.hexagram.name,
    titleEn: "I-CHING",
    symbol: "bagua",
    summary: data.reading.summary,
    aspects: {
      career: data.reading.career,
      love: data.reading.love,
      wealth: data.reading.wealth,
      health: data.reading.health,
    },
    lucky: data.reading.lucky,
    advice: data.reading.advice,
    hue: "purple",
    question: data.question,
    date,
  };
}

function scoreStars(score: number | undefined) {
  if (!score) return null;
  const filled = Math.round((score / 10) * 10);
  return (
    <div className="flex gap-[3px] items-center justify-center">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={`w-[14px] text-center text-[18px] leading-none ${
            i < filled ? "text-[#D4AF37]" : "text-[#3A2D5C]"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

interface DivinationCardProps {
  data: WheelResponse | DailyResponse | IChingResponse;
}

/**
 * 占卜结果卡片（用于截图导出）
 * 固定尺寸 1080×1920，展示时通过 transform scale 缩放
 */
export const DivinationCard = forwardRef<HTMLDivElement, DivinationCardProps>(
  function DivinationCard({ data }, ref) {
    const card = toCardData(data);
    const accentColor =
      card.hue === "crimson"
        ? "#E05277"
        : card.hue === "purple"
          ? "#A78BFA"
          : "#F0D98B";

    return (
      <div
        ref={ref}
        id="divination-card"
        className="relative overflow-hidden"
        style={{
          width: "1080px",
          height: "1920px",
          background:
            "radial-gradient(ellipse at 50% 30%, #2A1658 0%, #13082E 45%, #0A0618 100%)",
          fontFamily: 'var(--font-serif), "Noto Serif SC", serif',
          color: "#F5F3FF",
        }}
      >
        {/* 背景星星 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(2px 2px at 20% 20%, rgba(240,217,139,0.6), transparent), radial-gradient(1.5px 1.5px at 80% 15%, rgba(167,139,250,0.5), transparent), radial-gradient(1px 1px at 35% 35%, rgba(240,217,139,0.4), transparent), radial-gradient(1px 1px at 60% 50%, rgba(255,255,255,0.3), transparent), radial-gradient(2px 2px at 90% 70%, rgba(240,217,139,0.5), transparent), radial-gradient(1px 1px at 15% 80%, rgba(167,139,250,0.4), transparent)",
          }}
        />

        {/* 外边框 */}
        <div
          className="absolute"
          style={{
            top: "48px",
            left: "48px",
            right: "48px",
            bottom: "48px",
            border: "2px solid rgba(212,175,55,0.35)",
            borderRadius: "24px",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "58px",
            left: "58px",
            right: "58px",
            bottom: "58px",
            border: "1px solid rgba(212,175,55,0.15)",
            borderRadius: "18px",
          }}
        />

        {/* 内容区 */}
        <div
          className="absolute flex flex-col"
          style={{ top: "96px", left: "96px", right: "96px", bottom: "96px" }}
        >
          {/* 顶部：品牌 + 日期 */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  border: "2px solid #D4AF37",
                  background: "rgba(124,58,237,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RuneIcon name="wheel" size={32} className="text-[#F0D98B]" />
              </div>
              <div className="flex flex-col">
                <span
                  style={{
                    fontFamily: 'var(--font-display), "Noto Serif SC", serif',
                    fontSize: "36px",
                    color: "#F0D98B",
                    letterSpacing: "0.15em",
                    lineHeight: 1,
                  }}
                >
                  命 轮
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-cinzel), serif',
                    fontSize: "14px",
                    color: "#A09AB8",
                    letterSpacing: "0.3em",
                    marginTop: "4px",
                  }}
                >
                  FATEWHEEL
                </span>
              </div>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-cinzel), serif',
                fontSize: "22px",
                color: "#A09AB8",
                letterSpacing: "0.1em",
              }}
            >
              {card.date}
            </div>
          </header>

          {/* 分隔线 */}
          <div
            style={{
              height: "1px",
              marginTop: "32px",
              background:
                "linear-gradient(90deg, transparent, rgba(212,175,55,0.6) 50%, transparent)",
            }}
          />

          {/* 主体 - 象征符号 */}
          <div className="flex flex-col items-center" style={{ marginTop: "60px" }}>
            <div
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                border: "3px solid #D4AF37",
                background:
                  "radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(10,6,24,0.8) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 60px rgba(212,175,55,0.3)",
              }}
            >
              <RuneIcon name={card.symbol} size={96} className="text-[#F0D98B]" strokeWidth={1.2} />
            </div>

            {/* 等级徽章 */}
            <div
              style={{
                marginTop: "28px",
                padding: "6px 24px",
                borderRadius: "999px",
                border: `2px solid ${accentColor}`,
                color: accentColor,
                fontSize: "20px",
                letterSpacing: "0.3em",
                fontFamily: 'var(--font-display), "Noto Serif SC", serif',
              }}
            >
              {card.level}
              {card.score ? ` · ${card.score}/10` : ""}
            </div>

            {/* 扇区名/卦名 */}
            <h1
              style={{
                marginTop: "24px",
                fontSize: "84px",
                fontFamily: 'var(--font-display), "Noto Serif SC", serif',
                color: "#F0D98B",
                textShadow: "0 0 40px rgba(212,175,55,0.4)",
                letterSpacing: "0.1em",
                lineHeight: 1.1,
              }}
            >
              {card.titleZh}
            </h1>
            <p
              style={{
                marginTop: "12px",
                fontSize: "18px",
                fontFamily: 'var(--font-cinzel), serif',
                color: "#A09AB8",
                letterSpacing: "0.3em",
              }}
            >
              {card.titleEn}
            </p>

            {/* 评分 */}
            {card.score && <div style={{ marginTop: "28px" }}>{scoreStars(card.score)}</div>}
          </div>

          {/* 核心解读 */}
          <div
            style={{
              marginTop: "48px",
              padding: "28px 36px",
              background: "rgba(10,6,24,0.5)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "16px",
            }}
          >
            <p
              style={{
                fontSize: "26px",
                lineHeight: 2,
                color: "#F5F3FF",
                fontFamily: 'var(--font-serif), "Noto Serif SC", serif',
                textAlign: "justify",
              }}
            >
              {card.summary}
            </p>
          </div>

          {/* 四维解读 */}
          {card.aspects && (
            <div style={{ marginTop: "32px" }}>
              <div className="grid grid-cols-2" style={{ gap: "16px" }}>
                {(
                  [
                    { key: "career" as const, label: "事 业" },
                    { key: "love" as const, label: "情 感" },
                    { key: "wealth" as const, label: "财 运" },
                    { key: "health" as const, label: "健 康" },
                  ]
                ).map((it) => (
                  <div
                    key={it.key}
                    style={{
                      padding: "20px 24px",
                      borderRadius: "12px",
                      border: "1px solid rgba(212,175,55,0.18)",
                      background: "rgba(35,24,67,0.4)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        color: accentColor,
                        letterSpacing: "0.25em",
                        marginBottom: "8px",
                        fontFamily: 'var(--font-display), "Noto Serif SC", serif',
                      }}
                    >
                      {it.label}
                    </div>
                    <p
                      style={{
                        fontSize: "19px",
                        lineHeight: 1.7,
                        color: "#D4D0E0",
                        fontFamily: 'var(--font-serif), "Noto Serif SC", serif',
                      }}
                    >
                      {card.aspects![it.key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 幸运元素 + 行动建议 */}
          <div style={{ marginTop: "32px", flex: 1, display: "flex", flexDirection: "column" }}>
            <div className="flex items-center justify-around"
              style={{
                padding: "20px 0",
                borderTop: "1px solid rgba(212,175,55,0.2)",
                borderBottom: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              <div className="text-center">
                <div style={{ fontSize: "13px", color: "#6B6487", letterSpacing: "0.2em" }}>幸 运 色</div>
                <div style={{ fontSize: "22px", color: "#F0D98B", marginTop: "6px" }}>
                  {card.lucky.color}
                </div>
              </div>
              <div className="text-center">
                <div style={{ fontSize: "13px", color: "#6B6487", letterSpacing: "0.2em" }}>数 字</div>
                <div
                  style={{
                    fontSize: "28px",
                    color: "#F0D98B",
                    fontFamily: 'var(--font-cinzel), serif',
                    marginTop: "2px",
                  }}
                >
                  {card.lucky.number}
                </div>
              </div>
              {card.lucky.direction && (
                <div className="text-center">
                  <div style={{ fontSize: "13px", color: "#6B6487", letterSpacing: "0.2em" }}>方 位</div>
                  <div style={{ fontSize: "22px", color: "#F0D98B", marginTop: "6px" }}>
                    {card.lucky.direction}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: "24px" }}>
              <div
                style={{
                  fontSize: "16px",
                  color: accentColor,
                  letterSpacing: "0.3em",
                  marginBottom: "16px",
                  fontFamily: 'var(--font-display), "Noto Serif SC", serif',
                }}
              >
                ⟡ 今 日 宜 ⟡
              </div>
              <div className="flex flex-wrap" style={{ gap: "12px" }}>
                {card.advice.map((a, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "10px 22px",
                      borderRadius: "999px",
                      border: "1px solid rgba(212,175,55,0.35)",
                      background: "rgba(124,58,237,0.15)",
                      fontSize: "20px",
                      color: "#F5F3FF",
                      fontFamily: 'var(--font-serif), "Noto Serif SC", serif',
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 底部印章区 */}
          <footer className="flex items-end justify-between" style={{ marginTop: "auto" }}>
            <div className="flex items-center" style={{ gap: "16px" }}>
              {/* 印章"命" */}
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "8px",
                  background: "#9F1239",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  color: "#F5F3FF",
                  fontFamily: 'var(--font-display), "Noto Serif SC", serif',
                  transform: "rotate(-4deg)",
                  boxShadow: "0 0 20px rgba(159,18,57,0.3)",
                }}
              >
                命
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: "14px", color: "#6B6487", letterSpacing: "0.1em" }}>
                  fate.red
                </span>
                <span style={{ fontSize: "12px", color: "#6B6487", marginTop: "4px" }}>
                  · 此卦应心诚者 ·
                </span>
              </div>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#6B6487",
                letterSpacing: "0.15em",
                fontFamily: 'var(--font-cinzel), serif',
                textAlign: "right",
              }}
            >
              {data.id.slice(0, 8).toUpperCase()}
            </div>
          </footer>
        </div>
      </div>
    );
  },
);
