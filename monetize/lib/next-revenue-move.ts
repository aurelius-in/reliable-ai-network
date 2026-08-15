import type {
  BuyerStressTestResult,
  MetricsAnalysis,
  PipelineBoard,
  PipelineContact,
} from "@/types";

export type NextRevenueMove = {
  action: string;
  why: string;
  invalidate: string;
  href: string;
  cta: string;
  effort: "low" | "medium" | "high";
  evidence: string[];
};

function stageCounts(contacts: PipelineContact[]) {
  const counts: Record<string, number> = {};
  for (const c of contacts) {
    counts[c.stage] = (counts[c.stage] || 0) + 1;
  }
  return counts;
}

/**
 * Rank the single highest-value commercial action from live evidence.
 */
export function deriveNextRevenueMove(input: {
  metrics?: MetricsAnalysis | null;
  pipeline?: PipelineBoard | null;
  stress?: BuyerStressTestResult | null;
}): NextRevenueMove {
  const evidence: string[] = [];
  const contacts = input.pipeline?.contacts ?? [];
  const counts = stageCounts(contacts);
  const drafted = counts.drafted || 0;
  const sent = counts.sent || 0;
  const replied = counts.replied || 0;
  const meeting = counts.meeting || 0;
  const won = counts.won || 0;
  const identified = counts.identified || 0;
  const pendingDrafts = contacts.filter(
    (c) =>
      c.draft &&
      (c.draft_status === "pending" ||
        (!c.draft_status && ["identified", "drafted"].includes(c.stage)))
  ).length;

  if (input.stress?.verdict === "dies" || input.stress?.verdict === "fragile") {
    evidence.push(`Stress: ${input.stress.verdict} — ${input.stress.verdict_line}`);
    return {
      action:
        input.stress.offer_rewrite?.smallest_paid_offer
          ? `Rewrite and re-test the offer: ${input.stress.offer_rewrite.smallest_paid_offer}`
          : "Re-run Buyer Stress Test on a narrower paid offer before more outreach",
      why: "Outreach volume will not fix an offer that dies under hostile buyers.",
      invalidate:
        "If a revised offer survives Stress Test and one warm buyer pays, move to pipeline work.",
      href: "/dashboard?tab=analyzer",
      cta: "Fix the offer",
      effort: "medium",
      evidence,
    };
  }

  if (pendingDrafts > 0) {
    evidence.push(`${pendingDrafts} draft(s) waiting for approve/send`);
    return {
      action: `Approve and send ${Math.min(pendingDrafts, 5)} drafted outreach message${pendingDrafts === 1 ? "" : "s"}`,
      why: "Drafts that sit unsent teach you nothing. Outcome memory starts after send.",
      invalidate: "If nobody replies after 10 approved sends, revisit who may pay and the offer.",
      href: "/dashboard?tab=results",
      cta: "Open pipeline",
      effort: "low",
      evidence,
    };
  }

  if (replied + meeting > 0 && won === 0) {
    evidence.push(
      `Pipeline: ${replied} replied, ${meeting} meeting, ${won} won`
    );
    return {
      action:
        "Build a Buyer Proof Pack for the hottest conversation and ask for a clear yes/no",
      why: "Interest without a forwardable justification often dies in silence or CFO veto.",
      invalidate:
        "If they still cannot decide after a proof pack, log the objection and revise the offer.",
      href: "/dashboard?tab=results",
      cta: "Build proof pack",
      effort: "medium",
      evidence,
    };
  }

  if (sent >= 5 && replied === 0) {
    evidence.push(`Pipeline: ${sent} sent, 0 replies`);
    return {
      action:
        "Stop spraying. Re-check who may pay and rewrite the opener with Buyer Stress Test language",
      why: "Sends without replies usually mean wrong buyer or weak opening, not bad luck.",
      invalidate:
        "If a rewritten opener gets 2+ replies from a narrower list, scale that message.",
      href: "/dashboard?tab=buyers",
      cta: "Find who may pay",
      effort: "medium",
      evidence,
    };
  }

  if (identified + drafted === 0 && sent === 0) {
    evidence.push("Pipeline empty");
    return {
      action:
        "List 5 people who already know you and may fit your buyer, then draft one message",
      why: "First paying customers usually come from warm networks, not another post.",
      invalidate:
        "If nobody replies after 10 warm messages, revisit who may pay and the offer.",
      href: "/dashboard?tab=buyers",
      cta: "Find who may pay",
      effort: "low",
      evidence,
    };
  }

  if (input.metrics?.next_tests?.[0]) {
    const t = input.metrics.next_tests[0];
    evidence.push(
      input.metrics.bottleneck
        ? `Bottleneck: ${input.metrics.bottleneck.stage}`
        : "From weekly results analysis"
    );
    return {
      action: t.action,
      why: input.metrics.bottleneck
        ? `${input.metrics.bottleneck.stage}: ${input.metrics.bottleneck.diagnosis}`
        : t.name,
      invalidate: t.expected_result,
      href: "/dashboard?tab=results",
      cta: "Do this next",
      effort: t.difficulty === "hard" ? "high" : t.difficulty === "medium" ? "medium" : "low",
      evidence,
    };
  }

  if (input.stress?.verdict === "survives" && sent < 5) {
    evidence.push("Stress: survives");
    return {
      action: "Send 5 approved messages using the stress-tested DM opener",
      why: "The offer survived. Evidence now comes from real replies, not more planning.",
      invalidate:
        "If replies are polite but unpaid, tighten the paid offer and proof.",
      href: "/dashboard?tab=results",
      cta: "Open pipeline",
      effort: "low",
      evidence,
    };
  }

  return {
    action:
      "Log this week's contacted/replies, then run Results analysis so the next move follows evidence",
    why: "Without reply outcomes, the system cannot rank what to do next.",
    invalidate: "After one honest weekly log, follow the ranked next test.",
    href: "/dashboard?tab=results",
    cta: "Log results",
    effort: "low",
    evidence: evidence.length ? evidence : ["No strong signals yet"],
  };
}
