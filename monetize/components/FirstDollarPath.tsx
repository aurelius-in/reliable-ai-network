"use client";

import { ArrowRight, DollarSign } from "lucide-react";
import { CopyButton, DownloadButton } from "@/components/ui";

export type FirstDollarSteps = {
  offer: string;
  price: string;
  who: string;
  channel: string;
  ask: string;
  pay_how: string;
  this_week: string[];
};

/** Shared “path to first dollar” card used across monetization tools. */
export function FirstDollarPath({
  steps,
  onJump,
}: {
  steps: FirstDollarSteps;
  onJump?: (tab: string) => void;
}) {
  const md = [
    `# First-dollar path`,
    ``,
    `**Offer:** ${steps.offer}`,
    `**Price:** ${steps.price}`,
    `**Who to ask:** ${steps.who}`,
    `**Where:** ${steps.channel}`,
    `**The ask:** ${steps.ask}`,
    `**How they pay:** ${steps.pay_how}`,
    ``,
    `## This week`,
    ...steps.this_week.map((s, i) => `${i + 1}. ${s}`),
  ].join("\n");

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-night-800 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-400">
            <DollarSign size={14} /> First-dollar path
          </p>
          <p className="mt-2 text-lg font-bold text-white">{steps.offer}</p>
          <p className="mt-1 text-sm text-slate-300">
            <span className="font-semibold text-white">{steps.price}</span>
            {" · "}
            {steps.who}
            {" · "}
            {steps.channel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={steps.ask} label="Copy ask" />
          <DownloadButton
            filename="first-dollar-path.md"
            content={md}
            label="Download path"
          />
        </div>
      </div>
      <p className="mt-3 rounded-lg bg-night-900/60 p-3 text-sm text-slate-200">
        <span className="font-semibold text-white">Say this:</span> {steps.ask}
      </p>
      <p className="mt-2 text-xs text-slate-400">
        Pay how: {steps.pay_how}
      </p>
      <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-slate-200">
        {steps.this_week.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      {onJump && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onJump("sales")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-night-600 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-aqua/40"
          >
            Open sales kit <ArrowRight size={12} />
          </button>
          <button
            type="button"
            onClick={() => onJump("traffic")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-night-600 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-aqua/40"
          >
            This-week distribution <ArrowRight size={12} />
          </button>
          <button
            type="button"
            onClick={() => onJump("funnel")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-night-600 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-aqua/40"
          >
            Map funnel <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
