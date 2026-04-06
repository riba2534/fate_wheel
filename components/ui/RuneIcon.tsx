// 神秘符号 SVG 库 - 塔罗元素、八卦、月相、星辰、中国传统符号
// 全部 24x24 viewBox，stroke-based，响应 currentColor

type RuneKey =
  | "wheel" // 命运之轮
  | "moon" // 月亮
  | "sun" // 太阳
  | "star" // 星星
  | "bagua" // 八卦
  | "yin-yang" // 阴阳
  | "coin" // 铜钱
  | "hexagram" // 六芒星
  | "eye" // 荷鲁斯之眼
  | "scroll" // 卷轴
  | "lotus" // 莲花
  | "mountain" // 山
  | "water" // 水
  | "fire" // 火
  | "wind" // 风
  | "thunder"; // 雷

const RUNE_PATHS: Record<RuneKey, React.ReactNode> = {
  wheel: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
    </>
  ),
  moon: <path d="M20 14A8 8 0 019.9 3.9a8 8 0 1010.1 10.1z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  star: (
    <path d="M12 2l2.6 6.9L22 9.3l-5.5 5.1 1.6 7.6L12 18.3 5.9 22l1.6-7.6L2 9.3l7.4-.4z" />
  ),
  bagua: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M7.76 7.76l8.49 8.49M3 12h18M7.76 16.24l8.49-8.49" />
    </>
  ),
  "yin-yang": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a4.5 4.5 0 010 9 4.5 4.5 0 000 9 9 9 0 010-18z" />
      <circle cx="12" cy="7.5" r="0.9" fill="currentColor" />
      <circle cx="12" cy="16.5" r="0.9" fill="none" stroke="currentColor" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <rect x="9" y="9" width="6" height="6" />
    </>
  ),
  hexagram: (
    <path d="M12 2l5.2 9h-10.4zM12 22l-5.2-9h10.4z" />
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  scroll: (
    <>
      <path d="M6 4h12a2 2 0 012 2v13a2 2 0 01-2 2H8a2 2 0 01-2-2V4z" />
      <path d="M6 4a2 2 0 00-2 2v3h2M10 9h6M10 13h6M10 17h4" />
    </>
  ),
  lotus: (
    <>
      <path d="M12 22c-5 0-9-3-9-7 0 0 3 1 6 0-1-2-1-4 0-6 1 2 3 3 3 3s2-1 3-3c1 2 1 4 0 6 3 1 6 0 6 0 0 4-4 7-9 7z" />
      <path d="M12 12c0-3 2-6 5-7-1 3-2 6-5 7zM12 12c0-3-2-6-5-7 1 3 2 6 5 7z" />
    </>
  ),
  mountain: <path d="M3 20l5-10 4 6 3-4 6 8z" />,
  water: (
    <path d="M12 3s7 8 7 13a7 7 0 11-14 0c0-5 7-13 7-13z" />
  ),
  fire: (
    <path d="M12 2c0 5 4 5 4 10a4 4 0 11-8 0c0-3 2-3 2-6 2 1 2 3 2 3s0-4 0-7z" />
  ),
  wind: (
    <path d="M3 8h11a3 3 0 100-6M3 16h15a3 3 0 110 6M3 12h7" />
  ),
  thunder: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
};

interface RuneIconProps {
  name: RuneKey;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function RuneIcon({
  name,
  size = 24,
  className = "",
  strokeWidth = 1.5,
}: RuneIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {RUNE_PATHS[name]}
    </svg>
  );
}

export type { RuneKey };
