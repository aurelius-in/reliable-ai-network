/**
 * First-run success criterion (market intelligence 2026-08-08):
 * Founder leaves with buyer + unproven assumption + price hypothesis +
 * one real-world action — not merely "analysis generated."
 */

import type { IdeaAnalysis } from "@/types";

export const FIRST_RUN_STORAGE_KEY = "rain_first_run_complete";

export type FirstRunItem = {
  id: "buyer" | "assumption" | "price" | "action";
  label: string;
  value: string;
};

export function buildFirstRunItems(analysis: IdeaAnalysis): FirstRunItem[] {
  const ca = analysis.commercial_answer;
  const buyer =
    ca?.primary_buyer?.trim() ||
    "Primary buyer still vague — re-run with a product URL.";
  const assumption =
    ca?.what_would_disprove?.trim() ||
    ca?.honesty_note?.trim() ||
    analysis.assumptions?.[0]?.trim() ||
    "Name one assumption that would kill this path if false.";
  const price =
    ca?.smallest_paid_offer?.trim() ||
    analysis.recommended_paths?.[0]?.name?.trim() ||
    "Pick a smallest paid offer to test.";
  const action =
    analysis.validation_plan?.[0]?.trim() ||
    analysis.quick_wins?.[0]?.trim() ||
    "List 5 people who already know you and may fit the buyer, then message one today.";

  return [
    { id: "buyer", label: "Plausible buyer", value: buyer },
    { id: "assumption", label: "Still unproven", value: assumption },
    { id: "price", label: "Price / offer to test", value: price },
    { id: "action", label: "Real-world next move", value: action },
  ];
}

export function markFirstRunComplete(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FIRST_RUN_STORAGE_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function hasFirstRunComplete(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(FIRST_RUN_STORAGE_KEY));
  } catch {
    return false;
  }
}
