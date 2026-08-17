/** Only allow same-origin relative paths after signup/login. */

const BLOCKED_PREFIXES = ["/auth", "/api", "/login", "/signup"];

export function safeInternalNext(
  raw: string | null | undefined,
  fallback: string
): string {
  if (!raw) return fallback;
  const next = raw.trim();
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  const pathOnly = next.split("?")[0] || next;
  if (BLOCKED_PREFIXES.some((p) => pathOnly === p || pathOnly.startsWith(`${p}/`))) {
    return fallback;
  }
  return next;
}
