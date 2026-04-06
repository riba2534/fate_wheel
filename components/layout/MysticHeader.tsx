import Link from "next/link";
import { RuneIcon } from "@/components/ui/RuneIcon";

interface MysticHeaderProps {
  showHistory?: boolean;
}

export function MysticHeader({ showHistory = true }: MysticHeaderProps) {
  return (
    <header className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8 md:py-6">
      <Link
        href="/"
        className="flex items-center gap-2.5 group"
        aria-label="返回首页"
      >
        <span className="w-9 h-9 rounded-full flex items-center justify-center border border-[rgba(212,175,55,0.4)] bg-[rgba(124,58,237,0.15)] group-hover:bg-[rgba(124,58,237,0.25)] transition-all">
          <RuneIcon
            name="wheel"
            size={22}
            className="text-[var(--color-gold-soft)]"
          />
        </span>
        <span className="flex flex-col leading-none">
          <span
            className="text-xl tracking-wider text-gold-glow"
            style={{ fontFamily: "var(--font-display)" }}
          >
            命轮
          </span>
          <span
            className="text-[10px] tracking-[0.2em] text-[var(--color-text-muted)] mt-0.5"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            FATEWHEEL
          </span>
        </span>
      </Link>

      {showHistory && (
        <Link
          href="/history"
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-gold-soft)] transition-colors rounded-full border border-transparent hover:border-[rgba(212,175,55,0.2)]"
        >
          <RuneIcon name="scroll" size={16} />
          <span className="hidden sm:inline">记</span>
        </Link>
      )}
    </header>
  );
}
