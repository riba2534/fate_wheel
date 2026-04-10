"use client";

import { forwardRef } from "react";
import type { CompactChart, DestinyReading } from "@/types/destiny";

interface Props {
  compact: CompactChart;
  reading: DestinyReading;
  date: string;
}

/**
 * 观命分享卡片，固定 1080×1920 离屏渲染。
 * 视觉：深紫银白色，区别于命轮的金紫。
 */
export const DestinyCard = forwardRef<HTMLDivElement, Props>(
  ({ compact, reading, date }, ref) => {
    const parts = compact.bazi.gz.split("|");
    const dm = compact.bazi.dayMaster;
    const monthLing = compact.bazi.monthLing;
    const strength = compact.bazi.strength;
    const wuxing = compact.bazi.wuxingPercent;

    const ziweiSoulPalace = compact.ziwei?.palaces.find((p) => p.name === "命宫");
    const adviceList = reading.advice.slice(0, 4);

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1920,
          background: "linear-gradient(180deg, #0A0618 0%, #19103A 50%, #0A0618 100%)",
          color: "#E5DCFF",
          fontFamily: '"Noto Serif SC", "Songti SC", serif',
          padding: "80px 70px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 顶部装饰 */}
        <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.5em",
              color: "#D4AF37",
              fontFamily: '"Cinzel", serif',
            }}
          >
            ✦  OBSERVE FATE  ✦
          </div>
        </div>

        {/* 主标题 */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <div
            style={{
              fontSize: 96,
              letterSpacing: "0.3em",
              color: "#F5EAB8",
              fontFamily: '"ZCOOL XiaoWei", "Noto Serif SC", serif',
              textShadow: "0 0 30px rgba(212,175,55,0.4)",
            }}
          >
            观 命
          </div>
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.4em",
              color: "#A89BCC",
              marginTop: 12,
              fontFamily: '"Cinzel", serif',
            }}
          >
            FATEWHEEL · OBSERVE FATE
          </div>
        </div>

        {/* 八字四柱 */}
        <div style={{ marginTop: 80, display: "flex", gap: 18, justifyContent: "center" }}>
          {[
            { title: "年柱", gz: parts[0], naYin: compact.bazi.naYin.year },
            { title: "月柱", gz: parts[1], naYin: compact.bazi.naYin.month },
            { title: "日柱", gz: parts[2], naYin: compact.bazi.naYin.day, isDay: true },
            { title: "时柱", gz: parts[3] === "?" ? "??" : parts[3], naYin: compact.bazi.naYin.hour ?? "—" },
          ].map((c) => {
            const gan = c.gz?.[0] ?? "?";
            const zhi = c.gz?.[1] ?? "?";
            return (
              <div
                key={c.title}
                style={{
                  flex: 1,
                  border: c.isDay
                    ? "2px solid #D4AF37"
                    : "1.5px solid rgba(212,175,55,0.25)",
                  borderRadius: 14,
                  padding: "30px 20px",
                  textAlign: "center",
                  background: c.isDay
                    ? "rgba(212,175,55,0.10)"
                    : "rgba(10,6,24,0.5)",
                  boxShadow: c.isDay
                    ? "0 0 30px rgba(212,175,55,0.25)"
                    : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    letterSpacing: "0.3em",
                    color: c.isDay ? "#D4AF37" : "#8B7BB8",
                    fontFamily: '"Cinzel", serif',
                  }}
                >
                  {c.title}
                </div>
                <div
                  style={{
                    fontSize: 78,
                    lineHeight: 1.1,
                    marginTop: 14,
                    color: c.isDay ? "#F5EAB8" : "#E5DCFF",
                    fontFamily: '"ZCOOL XiaoWei", "Noto Serif SC", serif',
                  }}
                >
                  {gan}
                </div>
                <div
                  style={{
                    fontSize: 78,
                    lineHeight: 1.1,
                    color: c.isDay ? "#F5EAB8" : "#A89BCC",
                    fontFamily: '"ZCOOL XiaoWei", "Noto Serif SC", serif',
                  }}
                >
                  {zhi}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "#8B7BB8",
                    marginTop: 14,
                  }}
                >
                  {c.naYin}
                </div>
              </div>
            );
          })}
        </div>

        {/* 日主 + 五行偏 */}
        <div
          style={{
            marginTop: 50,
            padding: "26px 36px",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: 14,
            background: "rgba(10,6,24,0.4)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 16, color: "#8B7BB8", letterSpacing: "0.2em" }}>
                日 主 · DAY MASTER
              </div>
              <div
                style={{
                  fontSize: 44,
                  marginTop: 6,
                  color: "#F5EAB8",
                  fontFamily: '"ZCOOL XiaoWei", serif',
                }}
              >
                {dm} · {strength}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, color: "#8B7BB8", letterSpacing: "0.2em" }}>
                月 令 · MONTH
              </div>
              <div style={{ fontSize: 36, marginTop: 8, color: "#E5DCFF" }}>{monthLing}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            {(["金", "木", "水", "火", "土"] as const).map((w) => (
              <div key={w} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 22, color: "#A89BCC" }}>{w}</div>
                <div style={{ fontSize: 26, color: "#F5EAB8", marginTop: 4 }}>
                  {(wuxing[w] ?? 0).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 紫微命宫摘要（若有） */}
        {ziweiSoulPalace && (
          <div
            style={{
              marginTop: 30,
              padding: "20px 30px",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: 12,
              background: "rgba(10,6,24,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div style={{ fontSize: 16, color: "#8B7BB8", letterSpacing: "0.2em" }}>命宫</div>
            <div style={{ fontSize: 26, color: "#F5EAB8", fontFamily: '"ZCOOL XiaoWei", serif' }}>
              {ziweiSoulPalace.zhi} · {ziweiSoulPalace.main.join(" ")}
            </div>
          </div>
        )}

        {/* 一句断语：geju */}
        <div style={{ marginTop: 38 }}>
          <div
            style={{
              fontSize: 16,
              color: "#D4AF37",
              letterSpacing: "0.3em",
              marginBottom: 12,
              fontFamily: '"Cinzel", serif',
            }}
          >
            ★ 格 局 · GEJU ★
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.85,
              color: "#E5DCFF",
              padding: "20px 24px",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: 12,
              background: "rgba(212,175,55,0.06)",
            }}
          >
            {reading.geju}
          </div>
        </div>

        {/* 行动建议 */}
        <div style={{ marginTop: 36 }}>
          <div
            style={{
              fontSize: 16,
              color: "#D4AF37",
              letterSpacing: "0.3em",
              marginBottom: 14,
              fontFamily: '"Cinzel", serif',
            }}
          >
            ⟡ 行 动 · ADVICE ⟡
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {adviceList.map((a, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 24px",
                  border: "1px solid rgba(212,175,55,0.4)",
                  borderRadius: 999,
                  background: "rgba(124,58,237,0.15)",
                  fontSize: 24,
                  color: "#F5EAB8",
                }}
              >
                {a}
              </div>
            ))}
          </div>
        </div>

        {/* 底部 */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 70,
            right: 70,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 24,
            borderTop: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 18,
                color: "#D4AF37",
                letterSpacing: "0.3em",
                fontFamily: '"Cinzel", serif',
              }}
            >
              FATE.RED · 观命
            </div>
            <div style={{ fontSize: 14, color: "#8B7BB8", marginTop: 4 }}>{date}</div>
          </div>
          <div style={{ fontSize: 14, color: "#8B7BB8", textAlign: "right" }}>
            八字紫微同参<br />以真数入局
          </div>
        </div>
      </div>
    );
  },
);

DestinyCard.displayName = "DestinyCard";
