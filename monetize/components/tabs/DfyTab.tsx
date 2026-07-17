"use client";

import { useState } from "react";
import { Gift, Loader2, Send } from "lucide-react";
import {
  ChipGroup,
  ErrorText,
  FieldLabel,
} from "@/components/ui";
import { AUDIENCE_OPTIONS, GOAL_OPTIONS, TONE_OPTIONS } from "@/lib/examples";
import {
  DFY_ASSET_OPTIONS,
  DFY_STATUS_LABELS,
} from "@/lib/dfy";
import type { DfyRequestContent, GeneratedAsset } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  queued: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40",
  in_progress: "bg-rain/15 text-rain-bright ring-1 ring-rain/40",
  delivered: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40",
};

/**
 * Tab 8 — Done-For-You (Pro).
 * Monthly custom asset request: pick a type, build a brief with chips,
 * submit, and watch the queue. One request per calendar month.
 */
export function DfyTab({
  initialRequests,
}: {
  initialRequests: GeneratedAsset[];
}) {
  const [requests, setRequests] = useState<GeneratedAsset[]>(initialRequests);
  const [assetType, setAssetType] = useState(DFY_ASSET_OPTIONS[0].id);
  const [audience, setAudience] = useState("creators");
  const [goal, setGoal] = useState("steady side income");
  const [tone, setTone] = useState("bold and confident");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const now = new Date();
  const usedThisMonth = requests.some((request) => {
    const created = new Date(request.created_at);
    return (
      created.getUTCFullYear() === now.getUTCFullYear() &&
      created.getUTCMonth() === now.getUTCMonth()
    );
  });
  const nextReset = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  ).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dfy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetType, audience, goal, tone, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit request");
      setRequests((prev) => [data.request, ...prev]);
      setJustSubmitted(true);
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Allowance */}
      <div className="card-glow flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rain to-violet-dim text-white">
            <Gift size={20} />
          </span>
          <div>
            <p className="font-bold text-white">Monthly custom asset</p>
            <p className="text-xs text-slate-400">
              A human + AI team crafts one asset for you each month. Included
              with Pro.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white">
            {usedThisMonth ? "0" : "1"}
            <span className="text-sm font-semibold text-slate-400"> / 1 left</span>
          </p>
          <p className="text-xs text-slate-500">Resets {nextReset}</p>
        </div>
      </div>

      {/* Request form */}
      {usedThisMonth ? (
        <div className="card p-8 text-center">
          <p className="text-3xl">{justSubmitted ? "🎉" : "✅"}</p>
          <h3 className="mt-2 text-lg font-bold text-white">
            {justSubmitted
              ? "Request received — we're on it!"
              : "This month's request is in"}
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-400">
            Your asset is being crafted and typically lands within 5 business
            days. Track it in the queue below — your next request unlocks on{" "}
            {nextReset}.
          </p>
        </div>
      ) : (
        <div className="card space-y-5 p-5">
          <div>
            <h2 className="text-lg font-bold text-white">
              What should we make for you?
            </h2>
            <p className="helper-text">
              Tap your picks — no long forms. We use everything you&apos;ve
              generated in RAIN as context.
            </p>
          </div>

          <div>
            <FieldLabel helper="The custom asset our team will craft for you this month.">
              Asset type
            </FieldLabel>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {DFY_ASSET_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAssetType(option.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    assetType === option.id
                      ? "border-rain bg-rain/10 shadow-lg shadow-rain/15"
                      : "border-night-600 bg-night-800 hover:border-rain/40"
                  }`}
                >
                  <p className="font-bold text-white">
                    {option.emoji} {option.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div>
              <FieldLabel helper="Who should it speak to?">Audience</FieldLabel>
              <ChipGroup
                options={AUDIENCE_OPTIONS}
                value={audience}
                onChange={setAudience}
                ariaLabel="Audience"
              />
            </div>
            <div>
              <FieldLabel helper="What are you aiming for?">Goal</FieldLabel>
              <ChipGroup
                options={GOAL_OPTIONS}
                value={goal}
                onChange={setGoal}
                ariaLabel="Goal"
              />
            </div>
            <div>
              <FieldLabel helper="How should it sound?">Vibe</FieldLabel>
              <ChipGroup
                options={TONE_OPTIONS}
                value={tone}
                onChange={setTone}
                ariaLabel="Tone"
              />
            </div>
          </div>

          <div>
            <FieldLabel helper="Optional — anything special we should know. Totally fine to leave blank.">
              Anything else?
            </FieldLabel>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mention that the first 100 users get a discount"
              className="input-dark"
            />
          </div>

          <button onClick={submit} disabled={loading} className="btn-primary">
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Submit my request
          </button>
          <ErrorText message={error} />
        </div>
      )}

      {/* Queue */}
      <div className="card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
          Your request queue
        </h3>
        {requests.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            No requests yet. Submit your first one above — it&apos;s included in
            your plan.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {requests.map((request) => {
              const content = request.content as DfyRequestContent;
              const option = DFY_ASSET_OPTIONS.find(
                (o) => o.id === content.asset_type
              );
              return (
                <div
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-night-600 bg-night-800 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white">
                      {option ? `${option.emoji} ${option.label}` : content.asset_type}
                    </p>
                    <p className="text-xs text-slate-400">
                      Requested{" "}
                      {new Date(request.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      · for {content.audience} · {content.goal}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[content.status] ?? STATUS_STYLES.queued}`}
                  >
                    {DFY_STATUS_LABELS[content.status] ?? content.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
