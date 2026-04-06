"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
}

interface Shooting {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const STAR_COLORS = ["#F5F3FF", "#F0D98B", "#A78BFA", "#D4AF37"];

export function StarField({ density = 120 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<Shooting[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 尊重用户减弱动效偏好
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 按屏幕面积调整星星数量
      const area = w * h;
      const target = Math.min(
        density,
        Math.floor((area / (1920 * 1080)) * density) + 40,
      );
      const stars: Star[] = [];
      for (let i = 0; i < target; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.3,
          baseOpacity: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]!,
        });
      }
      starsRef.current = stars;
    };

    resize();
    window.addEventListener("resize", resize);

    let lastShoot = performance.now();

    const tick = (t: number) => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      // 深紫星空渐变背景（略带径向发光）
      const grad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.4,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.8,
      );
      grad.addColorStop(0, "#1A0F3A");
      grad.addColorStop(0.5, "#0E0726");
      grad.addColorStop(1, "#050212");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 绘制星星
      for (const s of starsRef.current) {
        const twinkle =
          Math.sin(t * s.twinkleSpeed + s.phase) * 0.4 + 0.6;
        const op = s.baseOpacity * twinkle;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = op;
        ctx.fill();

        // 大星星加十字光
        if (s.r > 1.2) {
          ctx.globalAlpha = op * 0.4;
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3, s.y);
          ctx.lineTo(s.x + s.r * 3, s.y);
          ctx.moveTo(s.x, s.y - s.r * 3);
          ctx.lineTo(s.x, s.y + s.r * 3);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // 偶尔出现的流星
      if (!reduced && t - lastShoot > 6000 + Math.random() * 8000) {
        const startX = Math.random() * w;
        const startY = Math.random() * h * 0.4;
        shootingRef.current.push({
          x: startX,
          y: startY,
          vx: (Math.random() * 3 + 4) * (Math.random() > 0.5 ? 1 : -1),
          vy: Math.random() * 3 + 3,
          life: 0,
          maxLife: 60,
        });
        lastShoot = t;
      }

      for (const m of shootingRef.current) {
        m.life += 1;
        m.x += m.vx;
        m.y += m.vy;
        const alpha = 1 - m.life / m.maxLife;
        const tailLen = 60;
        const tx = m.x - m.vx * tailLen * 0.4;
        const ty = m.y - m.vy * tailLen * 0.4;
        const grd = ctx.createLinearGradient(tx, ty, m.x, m.y);
        grd.addColorStop(0, "rgba(212,175,55,0)");
        grd.addColorStop(1, `rgba(240,217,139,${alpha})`);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
      }
      shootingRef.current = shootingRef.current.filter(
        (m) => m.life < m.maxLife && m.x > -100 && m.x < w + 100 && m.y < h + 100,
      );

      if (!reduced) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
