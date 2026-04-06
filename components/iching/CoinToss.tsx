"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 每爻由三枚铜钱决定（正=3, 反=2）
// 和值：6=老阴（变），7=少阳，8=少阴，9=老阳（变）
function tossLine(): number {
  let sum = 0;
  for (let i = 0; i < 3; i++) {
    sum += globalThis.crypto.getRandomValues(new Uint8Array(1))[0]! % 2 === 0 ? 2 : 3;
  }
  return sum; // 6/7/8/9
}

// 爻渲染：阳爻（少阳7, 老阳9）一横线；阴爻（少阴8, 老阴6）两短线
function LineBar({ value, variant }: { value: number; variant: "ben" | "bian" }) {
  const isYang = value === 7 || value === 9;
  const isChanged = value === 6 || value === 9;

  // 变卦时爻值反转
  const displayYang = variant === "bian" && isChanged ? !isYang : isYang;

  return (
    <div className="flex items-center gap-3 relative">
      <div className="flex items-center h-3" style={{ width: 80 }}>
        {displayYang ? (
          <div className="w-full h-2 bg-gradient-to-r from-[#8B6914] via-[#D4AF37] to-[#8B6914] rounded-[1px]" />
        ) : (
          <>
            <div className="w-[36px] h-2 bg-gradient-to-r from-[#8B6914] to-[#D4AF37] rounded-[1px]" />
            <div className="w-[8px]" />
            <div className="w-[36px] h-2 bg-gradient-to-r from-[#D4AF37] to-[#8B6914] rounded-[1px]" />
          </>
        )}
      </div>
      {variant === "ben" && isChanged && (
        <span className="absolute -right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#E05277]">
          ◆
        </span>
      )}
    </div>
  );
}

export interface CoinTossHandle {
  toss: () => Promise<number[]>; // 返回六爻数组（下到上）
  reset: () => void;
}

export const CoinToss = forwardRef<CoinTossHandle>(function CoinToss(_, ref) {
  const [lines, setLines] = useState<number[]>([]);
  const [tossing, setTossing] = useState(false);

  useImperativeHandle(ref, () => ({
    toss: async () => {
      setTossing(true);
      setLines([]);
      const result: number[] = [];
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => setTimeout(r, 650)); // 每爻间隔
        const v = tossLine();
        result.push(v);
        setLines((prev) => [...prev, v]);
      }
      await new Promise((r) => setTimeout(r, 400));
      setTossing(false);
      return result;
    },
    reset: () => {
      setLines([]);
      setTossing(false);
    },
  }));

  return (
    <div className="flex flex-col items-center">
      {/* 铜钱动画 */}
      <div className="flex items-center gap-4 mb-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={
              tossing
                ? {
                    rotateY: [0, 360, 720, 1080],
                    y: [0, -20, 0, -20, 0],
                  }
                : { rotateY: 0, y: 0 }
            }
            transition={{
              duration: 0.65,
              repeat: tossing ? Infinity : 0,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
            className="w-14 h-14 rounded-full relative"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #F0D98B, #D4AF37 40%, #8B6914)",
              border: "2px solid #6B4A0A",
              boxShadow: "0 4px 12px rgba(212,175,55,0.4)",
            }}
          >
            <div
              className="absolute inset-[30%] rounded-[2px] border-2"
              style={{ borderColor: "#6B4A0A", background: "#2A1658" }}
            />
          </motion.div>
        ))}
      </div>

      {/* 卦象显示（从上到下，但数组是下到上） */}
      <div className="flex flex-col gap-2 items-center min-h-[120px] justify-center">
        <AnimatePresence>
          {[...lines].reverse().map((v, reversedIdx) => {
            const originalIdx = lines.length - 1 - reversedIdx;
            return (
              <motion.div
                key={`${originalIdx}-${v}`}
                initial={{ opacity: 0, scale: 0.5, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LineBar value={v} variant="ben" />
              </motion.div>
            );
          })}
        </AnimatePresence>
        {lines.length < 6 && !tossing && (
          <p className="text-xs text-[var(--color-text-dim)] tracking-wider">
            · 卦象虚位以待 ·
          </p>
        )}
        {tossing && (
          <p className="text-xs text-[var(--color-gold-soft)] tracking-[0.3em] mt-2">
            {lines.length}/6 爻
          </p>
        )}
      </div>
    </div>
  );
});
