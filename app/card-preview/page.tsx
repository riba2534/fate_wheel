"use client";

import { DivinationCard } from "@/components/card/DivinationCard";
import type { WheelResponse } from "@/types";

// 测试数据（模拟 wheel API 返回）
const mockData: WheelResponse = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  type: "wheel",
  question: "近期是否适合换工作？",
  sectorIndex: 0,
  sector: {
    name: "紫微临身",
    nameEn: "Imperial Star Descends",
    level: "大吉",
    score: 9,
    symbol: "star",
    hue: "gold",
  },
  rotationDeg: 2175,
  reading: {
    summary:
      "紫微帝星亲临，贵人之象显于卦中。换职之事如大江东去，顺势而为则百川归海，所求必应，勿生犹豫之心。时机将至。",
    aspects: {
      career: "权贵相助，新局已开，大展宏图之时",
      love: "情缘和美，良人暗随，可主动示意",
      wealth: "偏财有兆，决断得宜则金砂入怀",
      health: "精神饱满，宜动不宜静，远足有益",
    },
    lucky: { color: "帝王紫", number: 7, direction: "东南" },
    advice: ["午前决事", "西南行三步"],
  },
  createdAt: Date.now(),
};

export default function CardPreviewPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0A0618",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ transform: "scale(0.35)", transformOrigin: "top center" }}>
        <DivinationCard data={mockData} />
      </div>
    </div>
  );
}
