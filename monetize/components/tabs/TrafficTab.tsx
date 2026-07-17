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
import { COMFORT_OPTIONS, TIME_PER_WEEK_OPTIONS } from "@/lib/examples";
import type { Creation, TrafficPlan } from "@/types";

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
  const lines = ["# My traffic plan", "", plan.strategy_summary, ""];
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
}: {
  creations: Creation[];
  initialPlan: TrafficPlan | null;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [timePerWeek, setTimePerWeek] = useState("5-7 hours a week");
  const [comfort, setComfort] = useState(
    "loves writing posts and threads"
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
            Get eyes on your offer
          </h2>
          <p className="helper-text">
            A great product nobody sees makes $0. This picks the best places
            to show up for YOUR product — with a ready-to-paste post for each
            one and a weekly plan that fits your life.
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
          {plan ? "Rebuild my traffic plan" : "Build my traffic plan"}
        </button>
        <ErrorText message={error} />
      </div>

      {loading && <FunLoading headline="Scouting where your buyers scroll…" />}

      {!loading && plan && <TrafficResult plan={plan} />}

      {!loading && !plan && (
        <TeachingEmptyState
          emoji="📣"
          title="Your traffic plan appears here"
          body="Pick a product, tell us your time and style, and get 5-7 channels ranked by payoff — each with a post you can publish today."
        />
      )}
    </div>
  );
}

function TrafficResult({ plan }: { plan: TrafficPlan }) {
  return (
    <div className="fade-up space-y-5">
      <div className="card-glow p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
            📣 Your traffic strategy
          </h3>
          <DownloadButton
            filename="my-traffic-plan.md"
            content={trafficToMarkdown(plan)}
            label="Download plan"
          />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          {plan.strategy_summary}
        </p>
      </div>

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
