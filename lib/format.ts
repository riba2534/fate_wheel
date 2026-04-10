export function truncateQuestion(
  q: string | undefined | null,
  maxChars: number,
): string | null {
  if (!q) return null;
  const clean = q.trim().replace(/\s+/g, " ");
  if (!clean) return null;
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars - 1) + "…";
}
