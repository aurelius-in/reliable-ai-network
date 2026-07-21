"use client";

import { useState } from "react";
import { Flag, Loader2, Rocket } from "lucide-react";
import { ApolloLeadsPanel } from "@/components/ApolloLeadsPanel";
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
import { AUDIENCE_OPTIONS, GOAL_OPTIONS } from "@/lib/examples";
import { isOutreachLaunchDay } from "@/lib/apollo-icp";
import type { Creation, LaunchPlan } from "@/types";

const WEEK_ACCENTS = [
  "text-rain-bright",
  "text-pink",
  "text-violet-bright",
  "text-emerald-400",
];

function launchToMarkdown(plan: LaunchPlan): string {
  const lines = [`# ${plan.plan_name}`, "", plan.strategy_summary, ""];
  for (const week of plan.weeks) {
    lines.push(`## ${week.theme}`, "");
    for (const day of week.days) {
      lines.push(
        `### Day ${day.day} - ${day.title} (${day.time_needed})`,
        "",
        day.action,
        ""
      );
      if (day.script) {
        lines.push(
          `**${day.script_label ?? "Script"}:**`,
          "",
          "```",
          day.script,
          "```",
          ""
        );
      }
    }
  }
  lines.push("## Milestones");
  for (const m of plan.milestones) {
    lines.push(`- Day ${m.day}: ${m.target} - if behind: ${m.if_behind}`);
  }
  lines.push("", "## If results are weak");
  for (const c of plan.contingency) {
    lines.push(`- ${c.symptom} -> ${c.fix}`);
  }
  return lines.join("\n");
}

/**
 * Tab — 30-Day Launch Plan (Growth).
 * A day-by-day launch timeline with pre-written scripts inline,
 * milestone checkpoints, and a weak-results contingency section.
 */
export function LaunchTab({
  creations,
  initialPlan,
}: {
  creations: Creation[];
  initialPlan: LaunchPlan | null;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [audience, setAudience] = useState("creators");
  const [goal, setGoal] = useState("steady side income");
  const [plan, setPlan] = useState<LaunchPlan | null>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!choice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/launch", {
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
          audience,
          goal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Launch plan failed");
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
            Your next 30 days, planned to the day
          </h2>
          <p className="helper-text">
            No more &ldquo;what should I do today?&rdquo; One clear action per
            day, posts and messages pre-written, plus checkpoints so you know
            you&apos;re on track. Outreach days include real people to message.
          </p>
        </div>

        <ProductPicker creations={creations} value={choice} onChange={setChoice} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel helper="Who this launch should reach.">
              Who&apos;s it for?
            </FieldLabel>
            <ChipGroup
              options={AUDIENCE_OPTIONS}
              value={audience}
              onChange={setAudience}
              ariaLabel="Audience"
            />
          </div>
          <div>
            <FieldLabel helper="Sets how ambitious the plan should be.">
              What are you going for?
            </FieldLabel>
            <ChipGroup
              options={GOAL_OPTIONS}
              value={goal}
              onChange={setGoal}
              ariaLabel="Goal"
            />
          </div>
        </div>

        <button onClick={generate} disabled={loading || !choice} className="btn-primary">
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Rocket size={16} />
          )}
          {plan ? "Rebuild my launch plan" : "Build my 30-day plan"}
        </button>
        <ErrorText message={error} />
      </div>

      {loading && <FunLoading headline="Mapping your 30-day launch…" />}

      {!loading && plan && (
        <LaunchResult
          plan={plan}
          audience={audience}
          productTitle={choice?.title}
        />
      )}

      {!loading && !plan && (
        <TeachingEmptyState
          emoji="🗓️"
          title="Your launch calendar appears here"
          body="Pick a product and get a day-by-day 30-day plan: one action per day, scripts included, with milestones like '50 signups by day 10'."
        />
      )}
    </div>
  );
}

function LaunchResult({
  plan,
  audience,
  productTitle,
}: {
  plan: LaunchPlan;
  audience: string;
  productTitle?: string;
}) {
  const milestoneByDay = new Map(plan.milestones.map((m) => [m.day, m]));

  return (
    <div className="fade-up space-y-5">
      <div className="card-glow p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-black text-white">{plan.plan_name}</h3>
          <DownloadButton
            filename="my-30-day-launch.md"
            content={launchToMarkdown(plan)}
            label="Download plan"
          />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {plan.strategy_summary}
        </p>
      </div>

      {/* Milestone strip */}
      <div className="card p-6">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-400">
          <Flag size={15} /> Checkpoints to hit
        </h4>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plan.milestones.map((m, i) => (
            <div
              key={i}
              className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Day {m.day}
              </p>
              <p className="mt-1 text-sm font-bold text-white">{m.target}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                If behind: {m.if_behind}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Week-by-week timeline */}
      {plan.weeks.map((week, wi) => (
        <div key={wi} className="card p-6">
          <h4
            className={`text-sm font-bold uppercase tracking-widest ${WEEK_ACCENTS[wi % WEEK_ACCENTS.length]}`}
          >
            {week.theme}
          </h4>
          <div className="mt-5 space-y-0">
            {week.days.map((day, di) => {
              const milestone = milestoneByDay.get(day.day);
              return (
                <div key={di} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Timeline rail */}
                  {di < week.days.length - 1 && (
                    <span className="absolute left-[17px] top-9 bottom-0 w-px bg-night-600" />
                  )}
                  <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rain to-violet-dim text-[11px] font-black text-white shadow-md shadow-rain/25">
                    {day.day}
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-white">{day.title}</p>
                      <span className="rounded-full bg-night-800 px-2 py-0.5 text-[10px] font-bold text-slate-400 ring-1 ring-night-600">
                        ⏱ {day.time_needed}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      {day.action}
                    </p>
                    {day.script && (
                      <div className="mt-2.5 rounded-xl border border-night-600 bg-night-800 p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-pink">
                            ✍️ {day.script_label ?? "Pre-written for you"}
                          </p>
                          <CopyButton text={day.script} label="Copy" />
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                          {day.script}
                        </p>
                      </div>
                    )}
                    {isOutreachLaunchDay(day) && (
                      <div className="mt-2.5 rounded-xl border border-aqua/25 bg-aqua/5 p-3.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-aqua">
                          Real people for this day
                        </p>
                        <ApolloLeadsPanel
                          audience={audience}
                          productTitle={productTitle}
                          openerTemplate={day.script ?? undefined}
                          compact
                        />
                      </div>
                    )}
                    {milestone && (
                      <p className="mt-2.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-400">
                        🏁 Checkpoint: {milestone.target}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Contingency */}
      <div className="card p-6">
        <h4 className="text-sm font-bold uppercase tracking-widest text-amber-300">
          🛟 If results are weak, do this
        </h4>
        <div className="mt-4 space-y-3">
          {plan.contingency.map((c, i) => (
            <div key={i} className="rounded-xl bg-night-800 p-4 text-sm">
              <p className="font-semibold text-slate-200">⚠️ {c.symptom}</p>
              <p className="mt-1 leading-relaxed text-slate-400">
                Fix: {c.fix}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
