"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import gsap from "gsap";
import { WHEEL_SECTORS, computeWheelRotation } from "@/lib/divination/wheel-sectors";

const SIZE = 360;
const CENTER = SIZE / 2;
const OUTER_R = 168;
const INNER_R = 64;
const LABEL_R = 118;
const SECTOR_ANGLE = 30;

// 将极坐标转为笛卡尔坐标（0°=正上方，顺时针）
function polar(angleDeg: number, radius: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(a), y: CENTER + radius * Math.sin(a) };
}

// 生成扇区路径（donut 楔形）
function sectorPath(startDeg: number, endDeg: number) {
  const outer1 = polar(startDeg, OUTER_R);
  const outer2 = polar(endDeg, OUTER_R);
  const inner1 = polar(endDeg, INNER_R);
  const inner2 = polar(startDeg, INNER_R);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${outer1.x} ${outer1.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${outer2.x} ${outer2.y}`,
    `L ${inner1.x} ${inner1.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${large} 0 ${inner2.x} ${inner2.y}`,
    "Z",
  ].join(" ");
}

// 根据 hue 返回填充色
const HUE_FILL: Record<string, string> = {
  gold: "rgba(212,175,55,0.22)",
  purple: "rgba(124,58,237,0.28)",
  neutral: "rgba(160,154,184,0.15)",
  crimson: "rgba(159,18,57,0.28)",
};
const HUE_STROKE: Record<string, string> = {
  gold: "rgba(240,217,139,0.6)",
  purple: "rgba(167,139,250,0.6)",
  neutral: "rgba(160,154,184,0.4)",
  crimson: "rgba(220,50,90,0.6)",
};

export interface FortuneWheelHandle {
  /** 开始空转（等待结果） */
  startSpinning: () => void;
  /** 停到指定扇区（减速收尾） */
  stopAt: (sectorIndex: number) => Promise<void>;
  /** 重置到初始位置 */
  reset: () => void;
}

export const FortuneWheel = forwardRef<FortuneWheelHandle, { onStopped?: (idx: number) => void }>(
  function FortuneWheel({ onStopped }, ref) {
    const wheelRef = useRef<SVGGElement>(null);
    const spinTweenRef = useRef<gsap.core.Tween | null>(null);
    const currentRotationRef = useRef(0);

    useImperativeHandle(ref, () => ({
      startSpinning: () => {
        if (!wheelRef.current) return;
        spinTweenRef.current?.kill();
        const from = currentRotationRef.current;
        spinTweenRef.current = gsap.to(wheelRef.current, {
          rotation: from + 360,
          duration: 2.5,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            const t = gsap.getProperty(wheelRef.current, "rotation") as number;
            currentRotationRef.current = t;
          },
        });
      },
      stopAt: (sectorIndex: number) => {
        return new Promise<void>((resolve) => {
          if (!wheelRef.current) return resolve();
          spinTweenRef.current?.kill();
          const from = currentRotationRef.current;
          const baseTarget = computeWheelRotation(sectorIndex);
          // 让轮子从当前角度继续旋转到 target（保证向前旋转）
          const currentMod = ((from % 360) + 360) % 360;
          const targetMod = ((baseTarget % 360) + 360) % 360;
          let delta = targetMod - currentMod;
          if (delta < 0) delta += 360;
          const target = from + 360 * 3 + delta; // 继续转 3 圈再停
          gsap.to(wheelRef.current, {
            rotation: target,
            duration: 3.8,
            ease: "power4.out",
            onUpdate: () => {
              const t = gsap.getProperty(wheelRef.current, "rotation") as number;
              currentRotationRef.current = t;
            },
            onComplete: () => {
              onStopped?.(sectorIndex);
              resolve();
            },
          });
        });
      },
      reset: () => {
        if (!wheelRef.current) return;
        spinTweenRef.current?.kill();
        gsap.set(wheelRef.current, { rotation: 0 });
        currentRotationRef.current = 0;
      },
    }));

    useEffect(() => {
      const el = wheelRef.current;
      if (!el) return;
      gsap.set(el, { transformOrigin: `${CENTER}px ${CENTER}px`, rotation: 0 });
      // 入场呼吸动画
      const idle = gsap.to(el, {
        rotation: "+=4",
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      return () => {
        idle.kill();
        spinTweenRef.current?.kill();
      };
    }, []);

    return (
      <div className="wheel-glow relative w-full max-w-[360px] aspect-square mx-auto">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
          <defs>
            <radialGradient id="wheel-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1A0F3A" />
              <stop offset="100%" stopColor="#0A0618" />
            </radialGradient>
            <linearGradient id="gold-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0D98B" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8B6914" />
            </linearGradient>
            <filter id="pointer-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 外圈装饰 */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={OUTER_R + 12}
            fill="url(#wheel-bg)"
            stroke="url(#gold-stroke)"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={OUTER_R + 6}
            fill="none"
            stroke="url(#gold-stroke)"
            strokeWidth="0.8"
            opacity="0.4"
          />

          {/* 旋转组 */}
          <g ref={wheelRef}>
            {WHEEL_SECTORS.map((s) => {
              const start = s.index * SECTOR_ANGLE;
              const end = start + SECTOR_ANGLE;
              const labelAngle = start + SECTOR_ANGLE / 2;
              const labelPos = polar(labelAngle, LABEL_R);
              return (
                <g key={s.index}>
                  <path
                    d={sectorPath(start, end)}
                    fill={HUE_FILL[s.hue]}
                    stroke={HUE_STROKE[s.hue]}
                    strokeWidth="0.8"
                  />
                  {/* 扇区名（旋转对齐径向） */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    transform={`rotate(${labelAngle} ${labelPos.x} ${labelPos.y})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fill={s.hue === "crimson" ? "#F5F3FF" : "#F0D98B"}
                    fontFamily="var(--font-display)"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    {s.name}
                  </text>
                </g>
              );
            })}
            {/* 中心圆 */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={INNER_R}
              fill="#0A0618"
              stroke="url(#gold-stroke)"
              strokeWidth="1.5"
            />
            <text
              x={CENTER}
              y={CENTER + 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="36"
              fill="url(#gold-stroke)"
              fontFamily="var(--font-display)"
            >
              命
            </text>
            {/* 放射线 */}
            {WHEEL_SECTORS.map((s) => {
              const angle = s.index * SECTOR_ANGLE;
              const p1 = polar(angle, INNER_R);
              const p2 = polar(angle, OUTER_R);
              return (
                <line
                  key={`line-${s.index}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="rgba(212,175,55,0.3)"
                  strokeWidth="0.6"
                />
              );
            })}
          </g>

          {/* 固定指针（顶部向下） */}
          <g filter="url(#pointer-glow)">
            <polygon
              points={`${CENTER},${CENTER - OUTER_R - 18} ${CENTER - 10},${CENTER - OUTER_R + 2} ${CENTER + 10},${CENTER - OUTER_R + 2}`}
              fill="url(#gold-stroke)"
              stroke="#F0D98B"
              strokeWidth="1"
            />
            <circle
              cx={CENTER}
              cy={CENTER - OUTER_R - 10}
              r="4"
              fill="#D4AF37"
            />
          </g>
        </svg>
      </div>
    );
  },
);
