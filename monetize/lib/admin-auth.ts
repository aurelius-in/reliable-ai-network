/**
 * Shared secret gate for founder-only admin routes (signup counter, etc.).
 * Pass via ?key=... or Authorization: Bearer ...
 */
export function assertAdminSecret(
  key: string | null | undefined
): { ok: true } | { ok: false; status: number; error: string } {
  const expected = process.env.ADMIN_STATS_SECRET?.trim();
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "ADMIN_STATS_SECRET is not configured",
    };
  }
  if (!key || key !== expected) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true };
}

export function adminKeyFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("key");
  if (fromQuery) return fromQuery;

  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}
