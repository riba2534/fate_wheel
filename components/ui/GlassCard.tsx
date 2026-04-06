import type { ReactNode, HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: "purple" | "gold" | "none";
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function GlassCard({
  children,
  glow = "none",
  padding = "md",
  className = "",
  ...rest
}: GlassCardProps) {
  const glowClass =
    glow === "purple"
      ? "shadow-purple-glow"
      : glow === "gold"
        ? "shadow-gold-glow"
        : "";

  return (
    <div
      className={`glass-mystic rounded-[16px] ${paddingMap[padding]} ${glowClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
