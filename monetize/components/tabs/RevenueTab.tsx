"use client";

import { useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import {
  ChipGroup,
  DownloadButton,
  ErrorText,
  FieldLabel,
  FunLoading,
  ProductPicker,
  TeachingEmptyState,
  choiceFromCreation,
  type ProductChoice,
} from "@/components/ui";
import { FirstDollarPath } from "@/components/FirstDollarPath";
import { OutputCaveat } from "@/components/OutputCaveat";
import { GOAL_OPTIONS } from "@/lib/examples";
import type { Creation, RevenueStreamsPlan } from "@/types";

const EFFORT_META: Record<string, { label: string; className: string }> = {
  low: {
    label: "Low effort",
    className: "bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/40",
  },
  medium: {
    label: "Medium effort",
    className: "bg-amber-300/10 text-amber-300 ring-1 ring-amber-300/40",
  },
  high: {
    label: "Big effort",
    className: "bg-red-400/10 text-red-400 ring-1 ring-red-400/40",
  },
};

function revenueToMarkdown(plan: RevenueStreamsPlan): string {
  const lines = ["# Revenue model map", "", plan.strategy_summary, ""];
  if (plan.unit_economics) {
    const u = plan.unit_economics;
    lines.push(
      "## Unit economics (assumptions)",
      "",
      `- Assumed price: $${u.assumed_price_usd}`,
      `- Assumed customers in 90 days: ${u.assumed_customers_90d}`,
      `- Projected 90-day revenue: $${u.projected_90d_revenue_usd}`,
      `- Notes: ${u.notes}`,
      ""
    );
  }
  if (plan.first_dollar_path) {
    const f = plan.first_dollar_path;
    lines.push(
      "## First-dollar path",
      "",
      `- Offer: ${f.offer} (${f.price})`,
      `- Who: ${f.who}`,
      `- Channel: ${f.channel}`,
      `- Ask: ${f.ask}`,
      `- Pay how: ${f.pay_how}`,
      "",
      ...f.this_week.map((s, i) => `${i + 1}. ${s}`),
      ""
    );
  }
  for (const s of plan.streams) {
    lines.push(
      `## ${s.emoji} ${s.model}`,
      "",
      s.how_it_works,
      "",
      `- Effort: ${s.effort} · Timeline: ${s.timeline}`,
      `- The math: ${s.revenue_shape}`,
      "",
      "**Pros:**",
      ...s.pros.map((p) => `- ${p}`),
      "",
      "**Cons:**",
      ...s.cons.map((c) => `- ${c}`),
      ""
    );
  }
  lines.push(
    "## Build this first",
    `**${plan.build_first.model}** — ${plan.build_first.reasoning}`,
    "",
    `First step: ${plan.build_first.first_step}`,
    "",
    `Later: ${plan.stack_later}`
  );
  return lines.join("\n");
}

/**
 * Tab — Multiple Ways to Get Paid (Pro).
 * Compares 3-5 revenue models for the product with pros/cons, effort,
 * timeline, and a clear "build this first" pick.
 */
export function RevenueTab({
  creations,
  initialPlan,
  onJumpTab,
}: {
  creations: Creation[];
  initialPlan: RevenueStreamsPlan | null;
  onJumpTab?: (tabId: string) => void;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [goal, setGoal] = useState("first paying customers");
  const [plan, setPlan] = useState<RevenueStreamsPlan | null>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!choice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/revenue", {
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
          goal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Revenue plan failed");
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
            Revenue model map
          </h2>
          <p className="helper-text">
            Subscriptions, one-time, freemium, services, licensing. See which
            models fit your product and which to build first for a first dollar
            path.
          </p>
        </div>

        <ProductPicker creations={creations} value={choice} onChange={setChoice} />

        <div>
          <FieldLabel helper="Changes which models we prioritize.">
            What are you going for?
          </FieldLabel>
          <ChipGroup
            options={GOAL_OPTIONS}
            value={goal}
            onChange={setGoal}
            ariaLabel="Income goal"
          />
        </div>

        <button onClick={generate} disabled={loading || !choice} className="btn-primary">
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Layers size={16} />
          )}
          {plan ? "Rebuild my revenue map" : "Map my revenue streams"}
        </button>
        <ErrorText message={error} />
      </div>

      {loading && <FunLoading headline="Finding every way this can pay you…" />}

      {!loading && plan && (
        <RevenueResult plan={plan} onJumpTab={onJumpTab} />
      )}

      {!loading && !plan && (
        <TeachingEmptyState
          emoji="💸"
          title="Your revenue streams appear here"
          body="Pick a product and get 3-5 ways it can make money — compared side by side, with unit economics and a first-dollar path."
        />
      )}
    </div>
  );
}

function RevenueResult({
  plan,
  onJumpTab,
}: {
  plan: RevenueStreamsPlan;
  onJumpTab?: (tabId: string) => void;
}) {
  const firstPick = plan.build_first.model;
  const u = plan.unit_economics;

  return (
    <div className="fade-up space-y-5">
      <OutputCaveat tool="revenue" />
      <div className="card-glow p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
            Revenue model map
          </h3>
          <DownloadButton
            filename="revenue-model-map.md"
            content={revenueToMarkdown(plan)}
            label="Download plan"
          />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          {plan.strategy_summary}
        </p>
      </div>

      {plan.first_dollar_path && (
        <FirstDollarPath
          steps={plan.first_dollar_path}
          onJump={onJumpTab}
        />
      )}

      {u && (
        <div className="card p-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Unit economics (labeled assumptions)
          </h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Assumed price
              </p>
              <p className="text-xl font-black text-white">
                ${u.assumed_price_usd.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Customers / 90d
              </p>
              <p className="text-xl font-black text-white">
                {u.assumed_customers_90d}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Projected 90d revenue
              </p>
              <p className="text-xl font-black gradient-text">
                ${u.projected_90d_revenue_usd.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-300">{u.notes}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plan.streams.map((stream, i) => {
          const effort = EFFORT_META[stream.effort] ?? EFFORT_META.medium;
          const isFirst = stream.model === firstPick;
          return (
            <div
              key={i}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                isFirst
                  ? "border-rain/50 bg-gradient-to-b from-rain/10 via-night-700 to-night-700"
                  : "border-night-600 bg-night-700"
              }`}
            >
              {isFirst && (
                <span className="absolute -top-3 left-5 rounded-full bg-gradient-to-r from-rain to-rain-bright px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-rain/30">
                  🏆 Build this first
                </span>
              )}
              <div className="flex items-start justify-between gap-2 pt-1">
                <h4 className="text-lg font-black text-white">
                  {stream.emoji} {stream.model}
                </h4>
                <span
                  className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${effort.className}`}
                >
                  {effort.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {stream.how_it_works}
              </p>

              <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                    Pros
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-300">
                    {stream.pros.map((pro, pi) => (
                      <li key={pi}>✓ {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-red-400">
                    Cons
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-400">
                    {stream.cons.map((con, ci) => (
                      <li key={ci}>✗ {con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                ⏳ <span className="font-semibold text-slate-300">{stream.timeline}</span>
              </p>
              <p className="mt-2 rounded-lg bg-night-800 p-3 text-sm font-bold gradient-text">
                {stream.revenue_shape}
              </p>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
          🏆 Why {plan.build_first.model} wins
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          {plan.build_first.reasoning}
        </p>
        <p className="mt-3 rounded-lg bg-rain/10 p-3 text-sm leading-relaxed text-pink">
          👟 <span className="font-bold">This week:</span>{" "}
          {plan.build_first.first_step}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Stack later: {plan.stack_later}
        </p>
      </div>
    </div>
  );
}
