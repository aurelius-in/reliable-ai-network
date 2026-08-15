"use client";

import { useState } from "react";
import { CalendarDays, Loader2, Megaphone } from "lucide-react";
import {
  ChipGroup,
  CopyButton,
  DownloadButton,
  ErrorText,
  FieldLabel,
  FunLoading,
  ProductPicker,
  TeachingEmptyState,
  choiceFromCreation,
  type ProductChoice,
} from "@/components/ui";
import { OutputCaveat } from "@/components/OutputCaveat";
import { COMFORT_OPTIONS, TIME_PER_WEEK_OPTIONS } from "@/lib/examples";
import { defaultComfortFromBuyers } from "@/lib/tool-defaults";
import type { BuyerProfilesResult, Creation, TrafficPlan } from "@/types";

function Meter({
  value,
  tone,
}: {
  value: number;
  tone: "effort" | "results";
}) {
  const filled = Math.max(1, Math.min(5, Math.round(value)));
  const color =
    tone === "results"
      ? "bg-gradient-to-r from-rain to-rain-bright"
      : "bg-slate-500";
  return (
    <div className="flex gap-1" aria-label={`${filled} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-5 rounded-full ${i <= filled ? color : "bg-night-600"}`}
        />
      ))}
    </div>
  );
}

function trafficToMarkdown(plan: TrafficPlan): string {
  const lines = ["# Distribution plan", "", plan.strategy_summary, ""];
  if (plan.this_week_sprint?.length) {
    lines.push("## This-week sprint", "");
    for (const d of plan.this_week_sprint) {
      lines.push(
        `### ${d.day} — ${d.channel}`,
        "",
        d.action,
        "",
        d.copy_paste,
        "",
        `Success: ${d.success_metric}`,
        ""
      );
    }
  }
  for (const ch of plan.channels) {
    lines.push(
      `## ${ch.emoji} ${ch.name}`,
      "",
      ch.why_it_fits,
      "",
      `- Effort: ${ch.effort}/5 · Payoff: ${ch.results_potential}/5 · ${ch.time_to_results}`,
      `- First move: ${ch.first_move}`,
      "",
      "**Ready-to-post template:**",
      "",
      "```",
      ch.post_template,
      "```",
      ""
    );
  }
  lines.push("## Weekly plan");
  for (const item of plan.weekly_plan) {
    lines.push(`- **${item.day}** (${item.minutes} min, ${item.channel}): ${item.action}`);
  }
  lines.push("", `> Golden rule: ${plan.golden_rule}`);
  return lines.join("\n");
}

/**
 * Tab — Get Eyes on Your Offer (Growth).
 * Picks the best traffic channels for the product with effort-vs-results
 * meters, a ready-to-post template per channel, and a weekly plan.
 */
export function TrafficTab({
  creations,
  initialPlan,
  initialBuyers = null,
  onJumpTab,
}: {
  creations: Creation[];
  initialPlan: TrafficPlan | null;
  initialBuyers?: BuyerProfilesResult | null;
  onJumpTab?: (tabId: string) => void;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [timePerWeek, setTimePerWeek] = useState("5-7 hours a week");
  const [comfort, setComfort] = useState(() =>
    defaultComfortFromBuyers(initialBuyers)
  );
  const [plan, setPlan] = useState<TrafficPlan | null>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!choice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/traffic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(choice.creationId
            ? { creationId: choice.creationId }
            : {
                title: choice.title,
                description: choice.description,
                type: choice.type,
              }),
          timePerWeek,
          comfort,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Traffic plan failed");
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card space-y-5 p-5">
        <div>
          <h2 className="text-lg font-bold text-white">
            Distribution without a big ad budget
          </h2>
          <p className="helper-text">
            Get a Mon–Fri sprint with copy-paste posts, plus ranked channels
            and a weekly plan sized to your time.
          </p>
        </div>

        <ProductPicker creations={creations} value={choice} onChange={setChoice} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel helper="Be honest — the plan adjusts to fit.">
              Time you can give it
            </FieldLabel>
            <ChipGroup
              options={TIME_PER_WEEK_OPTIONS}
              value={timePerWeek}
              onChange={setTimePerWeek}
              ariaLabel="Time per week"
            />
          </div>
          <div>
            <FieldLabel helper="We'll never suggest channels that make you cringe.">
              What feels like you?
            </FieldLabel>
            <ChipGroup
              options={COMFORT_OPTIONS}
              value={comfort}
              onChange={setComfort}
              ariaLabel="Comfort level"
            />
          </div>
        </div>

        <button onClick={generate} disabled={loading || !choice} className="btn-primary">
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Megaphone size={16} />
          )}
          {plan ? "Rebuild distribution plan" : "Build this-week sprint"}
        </button>
        <ErrorText message={error} />
      </div>

      {loading && <FunLoading headline="Scouting where your buyers scroll…" />}

      {!loading && plan && (
        <TrafficResult plan={plan} onJumpTab={onJumpTab} />
      )}

      {!loading && !plan && (
        <TeachingEmptyState
          emoji="📣"
          title="Your traffic plan appears here"
          body="Pick a product, tell us your time and style, and get a this-week sprint plus channels ranked by payoff — each with a post you can publish today."
        />
      )}
    </div>
  );
}

function TrafficResult({
  plan,
  onJumpTab,
}: {
  plan: TrafficPlan;
  onJumpTab?: (tabId: string) => void;
}) {
  const sprint = plan.this_week_sprint ?? [];
  const mondayCopy = sprint[0]?.copy_paste ?? plan.channels[0]?.post_template ?? "";

  return (
    <div className="fade-up space-y-5">
      <OutputCaveat tool="traffic" />
      <div className="card-glow p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
            Distribution strategy
          </h3>
          <DownloadButton
            filename="distribution-plan.md"
            content={trafficToMarkdown(plan)}
            label="Download plan"
          />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          {plan.strategy_summary}
        </p>
        {onJumpTab && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onJumpTab("sales")}
              className="rounded-lg border border-night-600 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-aqua/40"
            >
              Pair with DM Writer
            </button>
            <button
              type="button"
              onClick={() => onJumpTab("content")}
              className="rounded-lg border border-night-600 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-aqua/40"
            >
              Expand into content pack
            </button>
          </div>
        )}
      </div>

      {sprint.length > 0 && (
        <div className="rounded-2xl border border-aqua/30 bg-aqua/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-aqua">
                This-week distribution sprint
              </h4>
              <p className="mt-1 text-xs text-slate-400">
                Five days. Copy-paste actions. Built for no big ad budget.
              </p>
            </div>
            {mondayCopy && (
              <CopyButton text={mondayCopy} label="Copy Monday post" />
            )}
          </div>
          <div className="mt-4 space-y-3">
            {sprint.map((day, i) => (
              <div
                key={i}
                className="rounded-xl border border-night-600 bg-night-800/80 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-white">
                    {day.day} · {day.channel}
                  </p>
                  <CopyButton text={day.copy_paste} label="Copy" />
                </div>
                <p className="mt-1 text-sm text-slate-300">{day.action}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                  {day.copy_paste}
                </p>
                <p className="mt-2 text-xs text-aqua">
                  Done when: {day.success_metric}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {plan.channels.map((channel, i) => (
          <div key={i} className="card flex flex-col p-6">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-lg font-black text-white">
                {channel.emoji} {channel.name}
              </h4>
              <span className="whitespace-nowrap rounded-full bg-night-800 px-2.5 py-1 text-[11px] font-bold text-slate-300 ring-1 ring-night-600">
                ⏳ {channel.time_to_results}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
              {channel.why_it_fits}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Effort needed
                </p>
                <div className="mt-1.5">
                  <Meter value={channel.effort} tone="effort" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Payoff potential
                </p>
                <div className="mt-1.5">
                  <Meter value={channel.results_potential} tone="results" />
                </div>
              </div>
            </div>

            <p className="mt-4 rounded-lg bg-night-800 p-3 text-xs leading-relaxed text-slate-300">
              👟 <span className="font-semibold text-slate-200">First move:</span>{" "}
              {channel.first_move}
            </p>

            <div className="mt-3 rounded-xl border border-night-600 bg-night-800 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-pink">
                  Ready to post
                </p>
                <CopyButton text={channel.post_template} label="Copy post" />
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                {channel.post_template}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-violet-bright">
          <CalendarDays size={15} /> Your week, planned
        </h4>
        <div className="mt-4 space-y-2">
          {plan.weekly_plan.map((item, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-night-600 bg-night-800 px-4 py-3"
            >
              <span className="w-24 shrink-0 text-sm font-black text-white">
                {item.day}
              </span>
              <span className="flex-1 text-sm text-slate-300">{item.action}</span>
              <span className="rounded-full bg-night-700 px-2.5 py-0.5 text-[11px] font-bold text-slate-400 ring-1 ring-night-600">
                {item.channel}
              </span>
              <span className="text-[11px] font-bold text-rain-bright">
                {item.minutes} min
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-rain/10 p-3 text-sm font-semibold leading-relaxed text-pink">
          🌟 {plan.golden_rule}
        </p>
      </div>
    </div>
  );
}
