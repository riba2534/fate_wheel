"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { MysticButton } from "@/components/ui/MysticButton";
import { RuneIcon } from "@/components/ui/RuneIcon";
import { DestinyCard } from "@/components/card/DestinyCard";
import { getClientId } from "@/lib/user-id";
import type { CompactChart, DestinyReading } from "@/types/destiny";

interface Props {
  compact: CompactChart;
  reading: DestinyReading;
  gender: "male" | "female";
}

export function DestinyShareBox({ compact, reading, gender }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const date = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const filename = `observe-fate-${compact.bazi.dayMaster}-${Date.now()}.png`;

  const shareLink = async () => {
    if (sharing) return;
    setSharing(true);
    setMessage(null);
    try {
      const resp = await fetch("/api/share/destiny", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": getClientId(),
        },
        body: JSON.stringify({
          compact,
          reading,
          gender,
          question: compact.question,
        }),
      });
      if (!resp.ok) throw new Error("分享失败");
      const { shareId } = (await resp.json()) as { shareId: string };
      const url = `${window.location.origin}/d/${shareId}`;

      const text = compact.question
        ? `我问：${compact.question.slice(0, 40)}`
        : "来自观命的命盘";

      if (navigator.share) {
        try {
          await navigator.share({ title: "观命 · 命盘", text, url });
          setMessage("已分享");
          return;
        } catch {}
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
      await document.fonts.ready;
      const canvas = await html2canvas(cardRef.current, {
        width: 1080,
        height: 1920,
        scale: 1,
        backgroundColor: "#0A0618",
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 0.95),
      );
      if (!blob) throw new Error("截图失败");

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
            title: "观命 · 命盘卡片",
          });
          setMessage("已分享");
        } catch {
          downloadBlob(blob, filename);
          setMessage("已保存至下载");
        }
      } else {
        downloadBlob(blob, filename);
        setMessage("卡片已保存");
      }
    } catch (err) {
      console.error("destiny card export failed:", err);
      setMessage(`保存失败：${(err as Error).message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3 flex-wrap justify-center">
        <MysticButton variant="gold" size="md" onClick={exportCard} loading={saving}>
          <RuneIcon name="scroll" size={16} />
          保存卡片
        </MysticButton>
        <MysticButton variant="ghost" size="md" onClick={shareLink} loading={sharing}>
          <RuneIcon name="wind" size={16} />
          分享链接
        </MysticButton>
      </div>
      {message && (
        <span className="text-xs text-[var(--color-gold-soft)] animate-in fade-in">{message}</span>
      )}

      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          pointerEvents: "none",
        }}
      >
        <DestinyCard ref={cardRef} compact={compact} reading={reading} date={date} />
      </div>
    </div>
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
