"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MysticButton } from "@/components/ui/MysticButton";
import { PROVINCES } from "@/lib/destiny/geo-longitude";
import type { BirthFormState } from "@/types/destiny";

interface Props {
  onSubmit: (form: BirthFormState) => void;
  loading: boolean;
}

const DEFAULT_STATE: BirthFormState = {
  year: "1995",
  month: "1",
  day: "1",
  hour: "12",
  minute: "0",
  timeMode: "precise",
  timePeriod: "morning",
  gender: "male",
  birthProvince: "",
  topics: ["overall"],
  question: "",
};

const TOPIC_OPTIONS: Array<{ key: BirthFormState["topics"][number]; label: string }> = [
  { key: "overall", label: "综合总论" },
  { key: "career", label: "事业学业" },
  { key: "love", label: "婚恋情感" },
  { key: "wealth", label: "财富机遇" },
  { key: "health", label: "身心健康" },
];

const PERIOD_OPTIONS: Array<{ key: BirthFormState["timePeriod"]; label: string; hint: string }> = [
  { key: "dawn", label: "凌晨", hint: "03-06 时" },
  { key: "morning", label: "上午", hint: "06-12 时" },
  { key: "afternoon", label: "下午", hint: "12-18 时" },
  { key: "evening", label: "夜晚", hint: "18-03 时" },
];

export function BirthForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<BirthFormState>(DEFAULT_STATE);
  const [error, setError] = useState("");

  const update = <K extends keyof BirthFormState>(key: K, value: BirthFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const toggleTopic = (topic: BirthFormState["topics"][number]) => {
    setForm((prev) => {
      const has = prev.topics.includes(topic);
      return {
        ...prev,
        topics: has ? prev.topics.filter((t) => t !== topic) : [...prev.topics, topic],
      };
    });
  };

  const handleSubmit = () => {
    // 校验
    const y = parseInt(form.year, 10);
    const m = parseInt(form.month, 10);
    const d = parseInt(form.day, 10);
    if (isNaN(y) || y < 1900 || y > 2100) return setError("年份无效");
    if (isNaN(m) || m < 1 || m > 12) return setError("月份无效");
    if (isNaN(d) || d < 1 || d > 31) return setError("日期无效");

    if (form.timeMode === "precise") {
      const h = parseInt(form.hour, 10);
      const mn = parseInt(form.minute, 10);
      if (isNaN(h) || h < 0 || h > 23) return setError("小时无效");
      if (isNaN(mn) || mn < 0 || mn > 59) return setError("分钟无效");
    }

    if (form.topics.length === 0) return setError("请选择至少一个关注主题");
    onSubmit(form);
  };

  return (
    <GlassCard padding="lg" className="space-y-6">
      {/* 公历生辰 */}
      <div>
        <Label>公历生辰</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <NumberInput value={form.year} onChange={(v) => update("year", v)} placeholder="年" />
          <NumberInput value={form.month} onChange={(v) => update("month", v)} placeholder="月" />
          <NumberInput value={form.day} onChange={(v) => update("day", v)} placeholder="日" />
        </div>
      </div>

      {/* 时辰模式 */}
      <div>
        <Label>出生时辰</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["precise", "period", "unknown"] as const).map((mode) => (
            <ModeToggle
              key={mode}
              active={form.timeMode === mode}
              label={mode === "precise" ? "精确时辰" : mode === "period" ? "大致时段" : "不知道"}
              onClick={() => update("timeMode", mode)}
            />
          ))}
        </div>

        {form.timeMode === "precise" && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <NumberInput value={form.hour} onChange={(v) => update("hour", v)} placeholder="时 0-23" />
            <NumberInput value={form.minute} onChange={(v) => update("minute", v)} placeholder="分 0-59" />
          </div>
        )}

        {form.timeMode === "period" && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.key}
                onClick={() => update("timePeriod", p.key)}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  form.timePeriod === p.key
                    ? "border-[var(--color-gold)] bg-[rgba(212,175,55,0.12)] text-[var(--color-gold-soft)]"
                    : "border-[rgba(212,175,55,0.2)] text-[var(--color-text-muted)] hover:border-[rgba(212,175,55,0.4)]"
                }`}
              >
                <div style={{ fontFamily: "var(--font-serif)" }}>{p.label}</div>
                <div className="text-[10px] opacity-60 mt-0.5">{p.hint}</div>
              </button>
            ))}
          </div>
        )}

        {form.timeMode === "unknown" && (
          <p className="mt-3 text-xs text-[var(--color-text-dim)] leading-relaxed">
            仅以年月日三柱论命，紫微盘将被跳过。时运细节不可尽言，但格局性情仍可窥其八九。
          </p>
        )}
      </div>

      {/* 性别 */}
      <div>
        <Label>性别</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <ModeToggle active={form.gender === "male"} label="男 · 乾" onClick={() => update("gender", "male")} />
          <ModeToggle active={form.gender === "female"} label="女 · 坤" onClick={() => update("gender", "female")} />
        </div>
      </div>

      {/* 出生地 */}
      <div>
        <Label>
          出生地 <span className="text-[10px] text-[var(--color-text-dim)]">（可选 · 用于真太阳时校正）</span>
        </Label>
        <select
          value={form.birthProvince}
          onChange={(e) => update("birthProvince", e.target.value)}
          className="mt-2 w-full bg-[rgba(10,6,24,0.5)] border border-[rgba(212,175,55,0.2)] rounded-lg px-4 py-2.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
        >
          <option value="">— 不校正（用北京时间）—</option>
          {PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name} · {p.capital}
            </option>
          ))}
        </select>
      </div>

      {/* 关注主题 */}
      <div>
        <Label>关注主题（可多选）</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((t) => {
            const active = form.topics.includes(t.key);
            return (
              <button
                key={t.key}
                onClick={() => toggleTopic(t.key)}
                className={`px-4 py-2 rounded-full border text-sm transition-all ${
                  active
                    ? "border-[var(--color-gold)] bg-[rgba(212,175,55,0.15)] text-[var(--color-gold-soft)]"
                    : "border-[rgba(212,175,55,0.2)] text-[var(--color-text-muted)]"
                }`}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 具体问题 */}
      <div>
        <Label>
          具体所问 <span className="text-[10px] text-[var(--color-text-dim)]">（可选）</span>
        </Label>
        <textarea
          value={form.question}
          onChange={(e) => update("question", e.target.value.slice(0, 200))}
          placeholder="如：今年换工作时机如何？近一年婚姻走向？"
          rows={2}
          maxLength={200}
          className="mt-2 w-full bg-[rgba(10,6,24,0.5)] border border-[rgba(212,175,55,0.2)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-gold)] resize-none"
          style={{ fontFamily: "var(--font-serif)" }}
        />
        <div className="text-xs text-[var(--color-text-dim)] mt-1 text-right">{form.question.length}/200</div>
      </div>

      {error && <p className="text-sm text-[#F5A3B5] text-center">{error}</p>}

      <div className="flex justify-center pt-2">
        <MysticButton variant="gold" size="lg" onClick={handleSubmit} loading={loading} className="min-w-[220px]">
          观命 · Observe Fate
        </MysticButton>
      </div>

      <p className="text-center text-[10px] text-[var(--color-text-dim)] leading-relaxed pt-2">
        生辰信息仅用于排盘，不会入库。命盘一经生成，仅以干支脱敏形式存储。
      </p>
    </GlassCard>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-sm text-[var(--color-gold-soft)] tracking-wider"
      style={{ fontFamily: "var(--font-serif)" }}
    >
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[rgba(10,6,24,0.5)] border border-[rgba(212,175,55,0.2)] rounded-lg px-3 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-gold)] text-center"
      style={{ fontFamily: "var(--font-cinzel)" }}
    />
  );
}

function ModeToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2.5 rounded-lg border text-sm transition-all ${
        active
          ? "border-[var(--color-gold)] bg-[rgba(212,175,55,0.12)] text-[var(--color-gold-soft)]"
          : "border-[rgba(212,175,55,0.2)] text-[var(--color-text-muted)] hover:border-[rgba(212,175,55,0.4)]"
      }`}
      style={{ fontFamily: "var(--font-serif)" }}
    >
      {label}
    </button>
  );
}
