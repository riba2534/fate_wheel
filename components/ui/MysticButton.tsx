"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface MysticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function MysticButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...rest
}: MysticButtonProps) {
  const sizeClass = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }[size];

  const variantClass = {
    primary:
      "bg-gradient-to-br from-[var(--color-purple)] to-[#5B21B6] text-white border border-[rgba(212,175,55,0.3)] hover:shadow-purple-glow",
    ghost:
      "bg-transparent text-[var(--color-text)] border border-[rgba(212,175,55,0.4)] hover:bg-[rgba(212,175,55,0.08)]",
    gold: "bg-gradient-to-br from-[var(--color-gold)] to-[#B8860B] text-[var(--color-void)] font-semibold hover:shadow-gold-glow",
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-2
        rounded-full font-medium
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        min-h-[44px]
        ${sizeClass} ${variantClass} ${className}
      `}
      {...rest}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
