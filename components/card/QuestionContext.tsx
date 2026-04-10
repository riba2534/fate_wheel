import { truncateQuestion } from "@/lib/format";

interface QuestionContextProps {
  question: string | undefined | null;
  maxChars?: number;
  className?: string;
}

export function QuestionContext({
  question,
  maxChars = 80,
  className = "",
}: QuestionContextProps) {
  const q = truncateQuestion(question, maxChars);
  if (!q) return null;

  return (
    <div
      className={`px-4 py-3 rounded-lg border border-[rgba(212,175,55,0.2)] bg-[rgba(10,6,24,0.4)] ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className="text-[var(--color-gold)] text-xl leading-none flex-shrink-0"
          style={{ fontFamily: "var(--font-display)" }}
          aria-hidden
        >
          「
        </span>
        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] text-[var(--color-text-muted)] tracking-[0.3em] mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            所 问
          </div>
          <p
            className="text-sm leading-relaxed text-[var(--color-text)] break-words"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {q}
          </p>
        </div>
        <span
          className="text-[var(--color-gold)] text-xl leading-none flex-shrink-0 self-end"
          style={{ fontFamily: "var(--font-display)" }}
          aria-hidden
        >
          」
        </span>
      </div>
    </div>
  );
}
