import type { ToolMemo } from "@/lib/shared-report";
import type {
  AbTestPlan,
  CompetitorAnalysis,
  PricingOptimization,
  RoadmapPlan,
  SiteOptimizeResult,
  StrategyToolId,
} from "@/types";

export function siteOptimizeToMemo(result: SiteOptimizeResult): ToolMemo {
  const top = [...(result.fixes || [])]
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4)
    .map((f) => `#${f.priority} ${f.area}: ${f.fix}`);
  return {
    tool_label: "Site Optimize",
    headline: result.summary || `Site score ${result.score_out_of_10}/10`,
    bullets: [
      result.hero_rewrite?.headline
        ? `Hero: ${result.hero_rewrite.headline}`
        : "",
      ...top,
    ].filter(Boolean),
    next_action:
      result.fixes?.[0]?.fix ||
      "Ship the top conversion fix, then re-check who may pay.",
  };
}

export function strategyToMemo(
  tool: StrategyToolId,
  result:
    | CompetitorAnalysis
    | PricingOptimization
    | RoadmapPlan
    | AbTestPlan
): ToolMemo {
  if (tool === "competitors") {
    const r = result as CompetitorAnalysis;
    return {
      tool_label: "Competitor scan",
      headline: r.market_summary,
      bullets: (r.competitors || [])
        .slice(0, 4)
        .map((c) => `${c.name}: your edge — ${c.your_edge}`),
      next_action:
        r.positioning_moves?.[0] ||
        "Pick one edge and put it in your next outreach.",
    };
  }
  if (tool === "pricing_optimization") {
    const r = result as PricingOptimization;
    return {
      tool_label: "Pricing optimization",
      headline: r.diagnosis || r.recommended_move,
      bullets: [
        r.recommended_move,
        ...(r.experiments || [])
          .slice(0, 3)
          .map((e) => `${e.name}: ${e.change}`),
      ].filter(Boolean),
      next_action:
        r.experiments?.[0]?.change ||
        "Run one pricing conversation this week.",
    };
  }
  if (tool === "roadmap") {
    const r = result as RoadmapPlan;
    const first = r.phases?.[0];
    return {
      tool_label: "Roadmap",
      headline: r.north_star || "Commercial roadmap",
      bullets: (r.phases || [])
        .slice(0, 4)
        .map(
          (p) =>
            `${p.period} · ${p.theme}: ${(p.goals || []).slice(0, 2).join("; ")}`
        ),
      next_action:
        first?.actions?.[0]?.task ||
        first?.goals?.[0] ||
        "Ship the first commercial milestone before more features.",
    };
  }
  const r = result as AbTestPlan;
  return {
    tool_label: "A/B tests",
    headline:
      r.principles?.[0] || "Test what moves paid interest",
    bullets: (r.tests || [])
      .slice(0, 4)
      .map((t) => `${t.name}: ${t.hypothesis}`),
    next_action:
      r.tests?.[0]?.name || "Run one cheap test before another build sprint.",
  };
}
