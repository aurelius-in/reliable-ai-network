"use client";

import { useEffect, useState } from "react";
import { NextRevenueMoveCard } from "@/components/NextRevenueMoveCard";
import { deriveNextRevenueMove } from "@/lib/next-revenue-move";
import type {
  BuyerStressTestResult,
  MetricsAnalysis,
  PipelineBoard,
} from "@/types";

/** Loads pipeline (+ optional stress) and ranks the next commercial action. */
export function NextRevenueMoveSmart({
  analysis,
}: {
  analysis?: MetricsAnalysis | null;
}) {
  const [pipeline, setPipeline] = useState<PipelineBoard | null>(null);
  const [stress, setStress] = useState<BuyerStressTestResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pipeRes, stressRes] = await Promise.all([
          fetch("/api/pipeline"),
          fetch("/api/buyer-proof-pack?peek=1").catch(() => null),
        ]);
        if (cancelled) return;
        if (pipeRes.ok) {
          const data = await pipeRes.json();
          setPipeline(data.board ?? null);
        }
        if (stressRes && stressRes.ok) {
          const data = await stressRes.json();
          if (data.stress) setStress(data.stress);
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [analysis]);

  const move = deriveNextRevenueMove({
    metrics: analysis,
    pipeline,
    stress,
  });

  return (
    <NextRevenueMoveCard
      action={move.action}
      why={move.why}
      invalidate={move.invalidate}
      href={move.href}
      cta={move.cta}
      effort={move.effort}
      evidence={move.evidence}
    />
  );
}
