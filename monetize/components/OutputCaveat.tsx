"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/track";
import {
  evidenceLevel,
  evidenceLevelLabel,
  loadEvidenceAnswers,
  suggestNextTest,
  type EvidenceLevel,
} from "@/lib/evidence-quality";

const FEEDBACK_OPTIONS: { id: string; label: string }[] = [
  { id: "useful", label: "Useful" },
  { id: "wrong_assumption", label: "Wrong assumption" },
  { id: "missing_evidence", label: "Needs evidence" },
  { id: "too_generic", label: "Too generic" },
];

/**
 * Honesty strip + next test + lightweight feedback under AI outputs.
 */
export function OutputCaveat({
  tool,
  className = "",
}: {
  tool: string;
  className?: string;
}) {
  const [level, setLevel] = useState<EvidenceLevel>("thin");
  const [nextTest, setNextTest] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    const answers = loadEvidenceAnswers();
    setLevel(evidenceLevel(answers));
    setNextTest(suggestNextTest(answers));
  }, []);

  function sendFeedback(id: string) {
    setPicked(id);
    track("output_feedback", { tool, rating: id, evidence_level: level });
  }

  return (
    <div
      className={`rounded-xl border border-white/10 bg-night-800/80 px-4 py-3 text-left ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        How to read this
      </p>
      <p className="mt-1 text-sm text-slate-300">
        {evidenceLevelLabel(level)}. Recommendations get stronger when you add
        real customer, competitor, pricing, and traction evidence — they are not
        independent market validation.
      </p>
      {nextTest && (
        <p className="mt-2 text-sm text-slate-300">
          <span className="font-semibold text-aqua-bright">Suggested next test:</span>{" "}
          {nextTest}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {FEEDBACK_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => sendFeedback(opt.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              picked === opt.id
                ? "bg-aqua/20 text-aqua-bright ring-1 ring-aqua/40"
                : "bg-night-700 text-slate-400 ring-1 ring-night-600 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {picked && (
        <p className="mt-2 text-xs text-slate-500">Thanks — that helps us improve.</p>
      )}
    </div>
  );
}
