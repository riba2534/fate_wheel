"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { DivinationCard } from "./DivinationCard";
import { MysticButton } from "@/components/ui/MysticButton";
import { RuneIcon } from "@/components/ui/RuneIcon";
import { saveHistory } from "@/lib/storage/history";
import { getClientId } from "@/lib/user-id";
import { truncateQuestion } from "@/lib/format";
import type { WheelResponse, DailyResponse, IChingResponse } from "@/types";

interface CardExporterProps {
  data: WheelResponse | DailyResponse | IChingResponse;
}

/**
 * 卡片导出器
 * - 卡片以 1080x1920 离屏渲染
 * - 点击保存：html2canvas 截图 → 下载 / Web Share
 * - 同时存入 IndexedDB
 */
export function CardExporter({ data }: CardExporterProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filename = `fate-wheel-${data.id.slice(0, 8)}.png`;

  const userQuestion =
    data.type !== "daily" ? truncateQuestion(data.question, 60) : null;
  const shareText = userQuestion ? `我问：${userQuestion}` : "来自命轮的一卦";

  const shareLink = async () => {
    if (sharing) return;
    setSharing(true);
    setMessage(null);
    try {
      const resp = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": getClientId(),
        },
        body: JSON.stringify(data),
      });
      if (!resp.ok) throw new Error("分享失败");
      const { shareId } = (await resp.json()) as { shareId: string };
      const url = `${window.location.origin}/r/${shareId}`;

      // 尝试 Web Share API，失败则复制到剪贴板
      if (navigator.share) {
        try {
          await navigator.share({ title: "命轮占卜", text: shareText, url });
          setMessage("已分享");
          return;
        } catch {
          // 用户取消，继续复制
        }
      }
      await navigator.clipboard.writeText(url);
      setMessage("链接已复制");
    } catch (err) {
      setMessage(`分享失败：${(err as Error).message}`);
    } finally {
      setSharing(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const exportCard = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    setMessage(null);

    try {
      // 等待字体加载
      await document.fonts.ready;

      const canvas = await html2canvas(cardRef.current, {
        width: 1080,
        height: 1920,
        scale: 1, // DOM 已是 1080x1920 尺寸
        backgroundColor: "#0A0618",
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 0.95),
      );
      if (!blob) throw new Error("截图失败");

      // 保存到 IndexedDB
      await saveHistory({
        id: data.id,
        type: data.type,
        raw: data,
        imageBlob: blob,
        createdAt: data.createdAt,
      });

      // 优先 Web Share API（移动端）
      const canShareFile =
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({
          files: [new File([blob], filename, { type: "image/png" })],
        });

      if (canShareFile) {
        try {
          await navigator.share({
            files: [new File([blob], filename, { type: "image/png" })],
            title: "命轮占卜卡片",
            text: shareText,
          });
          setMessage("已分享");
        } catch (e) {
          // 用户取消分享，走下载
          downloadBlob(blob, filename);
          setMessage("已保存至下载");
        }
      } else {
        downloadBlob(blob, filename);
        setMessage("卡片已保存");
      }
    } catch (err) {
      console.error("card export failed:", err);
      setMessage(`保存失败：${(err as Error).message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  return (
    <>
      <MysticButton variant="gold" size="md" onClick={exportCard} loading={saving}>
        <RuneIcon name="scroll" size={16} />
        保存卡片
      </MysticButton>
      <MysticButton variant="ghost" size="md" onClick={shareLink} loading={sharing}>
        <RuneIcon name="wind" size={16} />
        分享链接
      </MysticButton>
      {message && (
        <span className="w-full text-center text-xs text-[var(--color-gold-soft)] mt-2 animate-in fade-in">
          {message}
        </span>
      )}

      {/* 离屏卡片，仅用于截图 */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          pointerEvents: "none",
        }}
      >
        <DivinationCard ref={cardRef} data={data} />
      </div>
    </>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
