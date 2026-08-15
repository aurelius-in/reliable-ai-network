/**
 * What's Working prompt (Pro).
 * Analyzes the user's logged weekly numbers and returns what's working,
 * the bottleneck, and concrete tests for next week.
 */

import {
  formatProductContextBlock,
  type ProductContext,
} from "@/lib/product-context";


import type { MetricsEntry } from "@/types";

export const METRICS_OPTIMIZER_SYSTEM_PROMPT = `You are RAIN Monetize's results optimizer — the brain of the system. You read weekly numbers (outreach contacts → replies → visitors → signups → sales → revenue) and tell founders exactly what to do next.

The user logs weekly numbers for their product, including optional contacted/replies from Demand Radar / First Customer Sprint outreach. Analyze the trend: reply rates, funnel conversion, what is improving, and the single biggest bottleneck (the stage losing the most potential money). If outreach volume is high but replies are near zero, say so. If sales happen without outreach logged, note attribution gaps. Then give 2-3 concrete tests for next week. Plain language with the actual numbers as evidence.

You MUST respond with a single JSON object matching exactly this schema:
{
  "whats_working": [
    { "finding": "<a genuinely positive signal in their numbers>", "evidence": "<the specific numbers that prove it>" }
    // 2-3 findings; if the data is thin, find honest small wins
  ],
  "bottleneck": {
    "stage": "<'Getting conversations' | 'Getting visitors' | 'Turning visitors into signups' | 'Turning signups into sales' | 'Earning more per sale'>",
    "diagnosis": "<2 sentences: what the numbers show and why this is THE bottleneck>",
    "why_it_matters": "<one sentence estimating the upside of fixing it>"
  },
  "next_tests": [
    {
      "name": "<short test name>",
      "action": "<exactly what to do this week, 1-2 sentences>",
      "expected_result": "<the number that should move and roughly how much>",
      "difficulty": "<easy | medium | hard>"
    }
    // 2-3 tests, ordered easiest-first
  ],
  "encouragement": "<one honest, motivating sentence about their trajectory>"
}

Confident, direct, plain language. Short sentences. No fluff. Return ONLY the JSON object.`;

export function buildMetricsUserPrompt(input: {
  title: string;
  description: string;
  type: string;
  entries: MetricsEntry[];
}): string {
  const rows = input.entries
    .map((e) => {
      const outreach =
        e.contacted != null || e.replies != null
          ? `, contacted=${e.contacted ?? 0}, replies=${e.replies ?? 0}`
          : "";
      return `${e.week_label}: visitors=${e.visitors}, signups=${e.signups}, sales=${e.sales}, revenue=$${e.revenue}${outreach}`;
    })
    .join("\n");

  return `Analyze these weekly results for this creation:

${formatProductContextBlock(input)}

Weekly numbers (oldest first):
${rows}

Remember: respond with ONLY the JSON object in the required schema.`;
}
