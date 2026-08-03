"use client";

import { useEffect, useState } from "react";
import {
  EVIDENCE_ITEMS,
  loadEvidenceAnswers,
  saveEvidenceAnswers,
  type EvidenceAnswer,
  type EvidenceAnswers,
  type EvidenceItemId,
} from "@/lib/evidence-quality";
import { track } from "@/lib/track";

const OPTIONS: { value: EvidenceAnswer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

/** Optional checklist — improves honesty labels, never blocks the flow. */
export function EvidenceChecklist({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [answers, setAnswers] = useState<EvidenceAnswers>({});
  const [open, setOpen] = useState(!compact);

  useEffect(() => {
    setAnswers(loadEvidenceAnswers());
  }, []);

  function setAnswer(id: EvidenceItemId, value: EvidenceAnswer) {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    saveEvidenceAnswers(next);
    track("evidence_checklist_answer", { item: id, value });
  }

  return (
    <div className="rounded-xl border border-white/10 bg-night-800/60 px-4 py-3 text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-white">
            Evidence checklist{" "}
            <span className="font-normal text-slate-500">(optional)</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Sent into Analyzer on each run so confidence and citations reflect
            what you have actually verified.
          </p>
        </div>
        <span className="text-aqua">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul className="mt-3 space-y-3">
          {EVIDENCE_ITEMS.map((item) => (
            <li key={item.id}>
              <p className="text-sm text-slate-300">{item.label}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer(item.id, opt.value)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      answers[item.id] === opt.value
                        ? "bg-aqua/20 text-aqua-bright ring-1 ring-aqua/40"
                        : "bg-night-700 text-slate-400 ring-1 ring-night-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
