import { SELECT_VARIANTS, type SelectVariant } from "./config";

export function normalizeSelectVariant(raw: string | null | undefined): SelectVariant | null {
  const v = (raw ?? "").trim().toLowerCase();
  return SELECT_VARIANTS.includes(v as SelectVariant) ? (v as SelectVariant) : null;
}

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function variantFromVisitorId(visitorId: string): SelectVariant {
  return SELECT_VARIANTS[hashId(visitorId) % SELECT_VARIANTS.length];
}

export function newVisitorId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
