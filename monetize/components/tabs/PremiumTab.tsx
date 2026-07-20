"use client";

import { useState } from "react";
import { Crown, Headset, Zap } from "lucide-react";
import { CopyButton, DownloadButton } from "@/components/ui";
import { PREMIUM_TEMPLATES } from "@/lib/premium-library";

/**
 * Tab 9 — Premium Library + Priority Support (Pro).
 * Kennedy-style swipe files, advanced templates, and the priority
 * support lane.
 */
export function PremiumTab() {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "Swipe file" | "Advanced template">(
    "all"
  );

  const templates =
    filter === "all"
      ? PREMIUM_TEMPLATES
      : PREMIUM_TEMPLATES.filter((t) => t.category === filter);

  return (
    <div className="space-y-6">
      {/* Priority support */}
      <div className="card-glow flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-dim to-rain text-white">
            <Headset size={22} />
          </span>
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              Priority Support
              <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-bright ring-1 ring-violet/40">
                Pro perk
              </span>
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-400">
              Your questions jump the queue. Email us anything — offer feedback,
              funnel reviews, &ldquo;is this price right?&rdquo; — and a real
              person answers within one business day.
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-1.5">
                <Zap size={13} className="text-violet-bright" /> Answers in &lt;24h
              </li>
              <li className="flex items-center gap-1.5">
                <Zap size={13} className="text-violet-bright" /> Real humans, not bots
              </li>
              <li className="flex items-center gap-1.5">
                <Zap size={13} className="text-violet-bright" /> Unlimited questions
              </li>
            </ul>
          </div>
        </div>
        <a
          href="mailto:support@reliableainetwork.com?subject=Priority%20support%20request%20(Pro)"
          className="btn-primary"
        >
          <Headset size={16} /> Contact priority support
        </a>
      </div>

      {/* Library */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Crown size={18} className="text-violet-bright" /> Premium Library
            </h2>
            <p className="helper-text">
              The swipe files behind millions in direct-response sales —
              Kennedy-style letters, sequences, and scripts. Copy, fill in the
              [BRACKETS], profit.
            </p>
          </div>
          <div className="flex gap-2">
            {(["all", "Swipe file", "Advanced template"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`chip ${filter === f ? "chip-on" : ""}`}
              >
                {f === "all" ? "All" : `${f}s`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="card overflow-hidden">
              <div className="space-y-3 p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">{template.title}</h3>
                    <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-bright">
                      {template.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {template.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setPreviewId(previewId === template.id ? null : template.id)
                    }
                    className="min-h-[44px] rounded-lg border border-night-600 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-violet/50 active:scale-[0.96] md:min-h-0"
                  >
                    {previewId === template.id ? "Hide" : "Preview"}
                  </button>
                  <CopyButton text={template.content} label="Copy" />
                  <DownloadButton
                    filename={template.filename}
                    content={template.content}
                  />
                </div>
              </div>
              {previewId === template.id && (
                <pre className="max-h-96 overflow-auto border-t border-night-600 bg-night-800/70 p-5 text-xs leading-relaxed whitespace-pre-wrap text-slate-300">
                  {template.content}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
