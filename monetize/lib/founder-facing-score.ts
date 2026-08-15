/**
 * Founder-facing score presentation.
 * Raw analyzer scores can be harsh (2-4). Shared briefs use a 5-10
 * "monetization readiness" band so the number is honest without crushing.
 */

export function toFounderFacingScore(raw: number): {
  display: number;
  band: "early" | "forming" | "proven_path" | "strong";
  label: string;
} {
  const n = Number(raw);
  const clampedRaw = Number.isFinite(n) ? Math.min(10, Math.max(1, n)) : 5;
  // Map 1-10 raw → 5-10 display (floor 5). Preserve ordering.
  const display = Math.round(Math.max(5, 5 + (clampedRaw - 1) * (5 / 9)) * 10) / 10;
  const rounded = Math.round(display * 10) / 10;
  let band: "early" | "forming" | "proven_path" | "strong" = "early";
  if (rounded >= 8.5) band = "strong";
  else if (rounded >= 7) band = "proven_path";
  else if (rounded >= 6) band = "forming";
  const label =
    band === "strong"
      ? "Strong readiness"
      : band === "proven_path"
        ? "Path looking real"
        : band === "forming"
          ? "Forming (needs a paid proof)"
          : "Early (shipped, pay unproven)";
  return { display: rounded, band, label };
}

export function toFounderFacingSurvival(raw: number): number {
  const n = Number(raw);
  const clamped = Number.isFinite(n) ? Math.min(10, Math.max(1, n)) : 5;
  return Math.round(Math.max(5, 5 + (clamped - 1) * (5 / 9)) * 10) / 10;
}

export function scoreScaleNote(): string {
  return "Scores on this brief use a 5-10 monetization readiness scale. 5 means a real product exists but paying demand is still unproven. Scores rise with clearer who-may-pay, a sharp paid wedge, and evidence people will pay.";
}
