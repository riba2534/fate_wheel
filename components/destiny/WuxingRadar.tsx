"use client";

import type { CompactChart } from "@/types/destiny";

/**
 * 五行雷达图（SVG 自绘）。
 * 五个角分别对应 金木水火土，外环为 50% 基准。
 */
export function WuxingRadar({ compact }: { compact: CompactChart }) {
  const percent = compact.bazi.wuxingPercent;
  const order = ["金", "木", "水", "火", "土"] as const;

  // SVG 坐标参数
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 90;
  // 五边形角度：从顶点开始，每 72° 一个
  const angles = order.map((_, i) => (-Math.PI / 2) + (i * 2 * Math.PI) / 5);

  // 百分比 → 坐标。最大值用 100% 归一化（实际每个单项不太会超 50，视觉上再放大）
  // 实际常见范围 0-50%，我们把 40% 视为 1.0 半径
  const valueRadius = (p: number) => Math.min(1, p / 40) * maxR;

  const points = order.map((w, i) => {
    const r = valueRadius(percent[w] ?? 0);
    return [cx + r * Math.cos(angles[i]), cy + r * Math.sin(angles[i])];
  });

  const pointStr = points.map(([x, y]) => `${x},${y}`).join(" ");

  // 基准环（20%/40%）
  const baselinePoints = (ratio: number) =>
    angles
      .map((a) => {
        const r = maxR * ratio;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      })
      .join(" ");

  // 标签位置
  const labelPositions = order.map((w, i) => {
    const r = maxR + 22;
    return {
      w,
      x: cx + r * Math.cos(angles[i]),
      y: cy + r * Math.sin(angles[i]),
      percent: percent[w] ?? 0,
    };
  });

  // 五行配色
  const wuxingColor: Record<string, string> = {
    金: "#E8D680",
    木: "#6DC985",
    水: "#5BA8E5",
    火: "#E56B5B",
    土: "#C8A064",
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 外环 */}
        <polygon
          points={baselinePoints(1)}
          fill="none"
          stroke="rgba(212,175,55,0.25)"
          strokeWidth="1"
        />
        <polygon
          points={baselinePoints(0.66)}
          fill="none"
          stroke="rgba(212,175,55,0.15)"
          strokeWidth="1"
        />
        <polygon
          points={baselinePoints(0.33)}
          fill="none"
          stroke="rgba(212,175,55,0.1)"
          strokeWidth="1"
        />

        {/* 辐射线 */}
        {angles.map((a, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + maxR * Math.cos(a)}
            y2={cy + maxR * Math.sin(a)}
            stroke="rgba(212,175,55,0.12)"
            strokeWidth="1"
          />
        ))}

        {/* 数据多边形 */}
        <polygon
          points={pointStr}
          fill="rgba(124,58,237,0.25)"
          stroke="rgba(212,175,55,0.7)"
          strokeWidth="1.5"
        />

        {/* 数据点 */}
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            fill={wuxingColor[order[i]]}
            stroke="rgba(10,6,24,0.9)"
            strokeWidth="1.5"
          />
        ))}

        {/* 标签 */}
        {labelPositions.map((l) => (
          <g key={l.w}>
            <text
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[var(--color-text)]"
              fontSize="15"
              fontFamily="var(--font-display)"
            >
              {l.w}
            </text>
            <text
              x={l.x}
              y={l.y + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[var(--color-gold-soft)]"
              fontSize="10"
              fontFamily="var(--font-cinzel)"
            >
              {l.percent.toFixed(1)}%
            </text>
          </g>
        ))}
      </svg>
      <div
        className="mt-2 text-xs text-[var(--color-text-dim)] tracking-widest"
        style={{ fontFamily: "var(--font-cinzel)" }}
      >
        {compact.bazi.strength} · {compact.bazi.dayMaster}
      </div>
    </div>
  );
}
