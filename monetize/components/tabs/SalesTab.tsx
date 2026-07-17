"use client";

import { useState } from "react";
import { Handshake, Loader2, MessageCircle, PhoneCall } from "lucide-react";
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
import {
  OUTREACH_CHANNEL_OPTIONS,
  TARGET_BUYER_OPTIONS,
  TONE_OPTIONS,
} from "@/lib/examples";
import type { Creation, SalesKit } from "@/types";

function kitToMarkdown(kit: SalesKit): string {
  const lines = ["# My direct sales kit", "", kit.strategy_note, "", "## Openers"];
  for (const o of kit.opener_messages) {
    lines.push("", `### ${o.label}`, "", o.message);
  }
  lines.push("", "## Follow-up sequence");
  for (const f of kit.follow_up_sequence) {
    lines.push("", `### Touch ${f.touch} — ${f.wait}`, `_${f.channel_note}_`, "", f.message);
  }
  lines.push("", "## Objection scripts");
  for (const o of kit.objection_scripts) {
    lines.push(`- "${o.objection}" → ${o.response}`);
  }
  lines.push("", "## Call agenda");
  for (const step of kit.call_agenda) {
    lines.push(`1. **${step.step}** — ${step.goal}. Say: "${step.say_this}"`);
  }
  lines.push("", `> Golden rule: ${kit.golden_rule}`);
  return lines.join("\n");
}

/**
 * Tab — Direct Sales Tools (Pro).
 * Personalized cold outreach openers, a follow-up sequence,
 * objection-handling scripts, and a simple call agenda.
 */
export function SalesTab({
  creations,
  initialKit,
}: {
  creations: Creation[];
  initialKit: SalesKit | null;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [channel, setChannel] = useState("Instagram or X DMs");
  const [tone, setTone] = useState("friendly and fun");
  const [targetBuyer, setTargetBuyer] = useState("individual consumers");
  const [kit, setKit] = useState<SalesKit | null>(initialKit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!choice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sales", {
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
          channel,
          tone,
          targetBuyer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sales kit failed");
      setKit(data.kit);
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
            Sell it yourself — without feeling salesy
          </h2>
          <p className="helper-text">
            Sometimes the fastest money is just messaging people. Get
            word-for-word openers, follow-ups, and answers to &ldquo;let me
            think about it&rdquo; — all written for your product.
          </p>
        </div>

        <ProductPicker creations={creations} value={choice} onChange={setChoice} />

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <FieldLabel helper="Where you'll send messages.">Channel</FieldLabel>
            <ChipGroup
              options={OUTREACH_CHANNEL_OPTIONS}
              value={channel}
              onChange={setChannel}
              ariaLabel="Outreach channel"
            />
          </div>
          <div>
            <FieldLabel helper="How the messages should sound.">Tone</FieldLabel>
            <ChipGroup
              options={TONE_OPTIONS}
              value={tone}
              onChange={setTone}
              ariaLabel="Tone"
            />
          </div>
          <div>
            <FieldLabel helper="Who you're reaching out to.">
              Who are you messaging?
            </FieldLabel>
            <ChipGroup
              options={TARGET_BUYER_OPTIONS}
              value={targetBuyer}
              onChange={setTargetBuyer}
              ariaLabel="Target buyer"
            />
          </div>
        </div>

        <button onClick={generate} disabled={loading || !choice} className="btn-primary">
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Handshake size={16} />
          )}
          {kit ? "Rewrite my sales kit" : "Write my sales kit"}
        </button>
        <ErrorText message={error} />
      </div>

      {loading && <FunLoading headline="Writing messages people reply to…" />}

      {!loading && kit && <SalesResult kit={kit} />}

      {!loading && !kit && (
        <TeachingEmptyState
          emoji="🤝"
          title="Your sales scripts appear here"
          body="Pick a product, choose your channel and tone, and get copy-paste openers, follow-ups, objection answers, and a simple call plan."
        />
      )}
    </div>
  );
}

function SalesResult({ kit }: { kit: SalesKit }) {
  return (
    <div className="fade-up space-y-5">
      <div className="card-glow p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
            🤝 How to play it
          </h3>
          <DownloadButton
            filename="my-sales-kit.md"
            content={kitToMarkdown(kit)}
            label="Download kit"
          />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          {kit.strategy_note}
        </p>
      </div>

      {/* Openers */}
      <div className="card p-6">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-pink">
          <MessageCircle size={15} /> First messages — pick your favorite
        </h4>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {kit.opener_messages.map((opener, i) => (
            <div
              key={i}
              className="flex flex-col rounded-xl border border-night-600 bg-night-800 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {opener.label}
                </p>
                <CopyButton text={opener.message} label="Copy" />
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                {opener.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up sequence */}
      <div className="card p-6">
        <h4 className="text-sm font-bold uppercase tracking-widest text-violet-bright">
          📬 If they don&apos;t reply — the follow-up sequence
        </h4>
        <div className="mt-5 space-y-0">
          {kit.follow_up_sequence.map((touch, i) => (
            <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
              {i < kit.follow_up_sequence.length - 1 && (
                <span className="absolute left-[17px] top-9 bottom-0 w-px bg-night-600" />
              )}
              <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet/20 text-[11px] font-black text-violet-bright ring-1 ring-violet/40">
                {touch.touch}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-white">{touch.wait}</p>
                  <span className="text-xs text-slate-500">{touch.channel_note}</span>
                </div>
                <div className="mt-2 rounded-xl border border-night-600 bg-night-800 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                      {touch.message}
                    </p>
                    <CopyButton text={touch.message} label="Copy" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Objections */}
      <div className="card p-6">
        <h4 className="text-sm font-bold uppercase tracking-widest text-amber-300">
          🛡️ When they push back
        </h4>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {kit.objection_scripts.map((obj, i) => (
            <div key={i} className="rounded-xl bg-night-800 p-4 text-sm">
              <p className="italic text-slate-400">&ldquo;{obj.objection}&rdquo;</p>
              <div className="mt-2 flex items-start justify-between gap-2">
                <p className="leading-relaxed text-slate-200">
                  <span className="font-bold text-rain-bright">You say:</span>{" "}
                  {obj.response}
                </p>
                <CopyButton text={obj.response} label="Copy" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call agenda */}
      <div className="card p-6">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-400">
          <PhoneCall size={15} /> If they say &ldquo;let&apos;s talk&rdquo; — your call plan
        </h4>
        <div className="mt-4 space-y-3">
          {kit.call_agenda.map((step, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-night-800 p-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-[11px] font-black text-emerald-400">
                {i + 1}
              </span>
              <div className="text-sm">
                <p className="font-bold text-white">{step.step}</p>
                <p className="mt-0.5 text-slate-400">{step.goal}</p>
                <p className="mt-1.5 italic text-slate-300">
                  &ldquo;{step.say_this}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-rain/10 p-3 text-sm font-semibold leading-relaxed text-pink">
          🌟 {kit.golden_rule}
        </p>
      </div>
    </div>
  );
}
