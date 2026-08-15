"use client";

import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";

/**
 * Next Revenue Move — single highest-value commercial action.
 */
export function NextRevenueMoveCard({
  action,
  why,
  invalidate,
  href = "/dashboard?tab=buyers",
  cta = "Do this next",
  effort,
  evidence,
}: {
  action?: string;
  why?: string;
  invalidate?: string;
  href?: string;
  cta?: string;
  effort?: "low" | "medium" | "high";
  evidence?: string[];
}) {
  const resolvedAction =
    action?.trim() ||
    "List 5 people who already know you and may fit your buyer — then message one today.";
  const resolvedWhy =
    why?.trim() ||
    "First paying customers usually come from warm networks, not another post. One real conversation beats ten drafts.";
  const resolvedInvalidate =
    invalidate?.trim() ||
    "If nobody replies after 10 warm messages, revisit who may pay and the offer — not another feature.";

  return (
    <div className="rounded-2xl border border-rain/40 bg-gradient-to-br from-rain/15 via-night-800 to-night-800 p-5">
      <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-rain-bright">
        <Target size={14} aria-hidden /> Next revenue move
        {effort ? (
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-normal text-slate-400">
            {effort} effort
          </span>
        ) : null}
      </p>
      <h3 className="mt-2 text-lg font-black text-white">{resolvedAction}</h3>
      <p className="mt-2 text-sm text-slate-300">{resolvedWhy}</p>
      {evidence && evidence.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
          {evidence.map((e) => (
            <li key={e}>· {e}</li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-slate-500">
        Kill signal: {resolvedInvalidate}
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-aqua hover:text-aqua-bright"
      >
        {cta} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
