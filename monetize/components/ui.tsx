"use client";

/**
 * Shared beginner-friendly UI primitives used across every dashboard tool:
 * chip selectors, copy/download buttons, fun loading states, teaching
 * empty states, and the locked-tier preview card.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Lock,
  Sparkles,
} from "lucide-react";
import { EXAMPLE_CREATIONS, LOADING_LINES } from "@/lib/examples";
import type { Creation } from "@/types";

/* ------------------------------------------------------------------ */
/* Chips                                                               */
/* ------------------------------------------------------------------ */

export interface ChipOption {
  value: string;
  label: string;
}

export function ChipGroup({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`chip ${value === option.value ? "chip-on" : ""}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function FieldLabel({
  children,
  helper,
}: {
  children: React.ReactNode;
  helper?: string;
}) {
  return (
    <div className="mb-2">
      <p className="text-sm font-semibold text-white">{children}</p>
      {helper && <p className="helper-text mt-0.5">{helper}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Product picker — saved creations + one-tap examples                 */
/* ------------------------------------------------------------------ */

export interface ProductChoice {
  /** Set when the choice is one of the user's saved creations. */
  creationId?: string;
  /** Set when the choice is a preloaded example. */
  exampleId?: string;
  title: string;
  description: string;
  type: string;
}

export function choiceFromCreation(creation: Creation): ProductChoice {
  return {
    creationId: creation.id,
    title: creation.title,
    description: creation.description,
    type: creation.type,
  };
}

export function ProductPicker({
  creations,
  value,
  onChange,
}: {
  creations: Creation[];
  value: ProductChoice | null;
  onChange: (choice: ProductChoice) => void;
}) {
  return (
    <div className="space-y-3">
      {creations.length > 0 && (
        <div>
          <FieldLabel helper="Products you've already added.">
            Your creations
          </FieldLabel>
          <div className="flex flex-wrap gap-2">
            {creations.map((creation) => (
              <button
                key={creation.id}
                type="button"
                onClick={() => onChange(choiceFromCreation(creation))}
                className={`chip ${value?.creationId === creation.id ? "chip-on" : ""}`}
              >
                📦 {creation.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <FieldLabel
          helper={
            creations.length > 0
              ? "No typing needed — tap one to see how it works."
              : "No product yet? No problem. Tap an example and watch the magic."
          }
        >
          {creations.length > 0 ? "…or try an example" : "Try an example"}
        </FieldLabel>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_CREATIONS.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() =>
                onChange({
                  exampleId: example.id,
                  title: example.title,
                  description: example.description,
                  type: example.type,
                })
              }
              className={`chip ${value?.exampleId === example.id ? "chip-on" : ""}`}
            >
              {example.emoji} {example.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Copy & download                                                     */
/* ------------------------------------------------------------------ */

export function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (e.g. permissions) — nothing to do.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-night-600 bg-night-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-rain/60 hover:text-white"
    >
      {copied ? (
        <Check size={13} className="text-emerald-400" />
      ) : (
        <Copy size={13} />
      )}
      {copied ? "Copied!" : label}
    </button>
  );
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DownloadButton({
  filename,
  content,
  label = "Download",
}: {
  filename: string;
  content: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadText(filename, content)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-night-600 bg-night-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-rain/60 hover:text-white"
    >
      <Download size={13} />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Loading with fun rotating copy                                      */
/* ------------------------------------------------------------------ */

export function FunLoading({ headline }: { headline: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % LOADING_LINES.length),
      2200
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card fade-up flex flex-col items-center gap-4 p-10 text-center">
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-rain/25" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rain to-violet-dim text-white shadow-lg shadow-rain/40">
          <Sparkles size={22} className="animate-pulse" />
        </span>
      </span>
      <div>
        <p className="font-bold text-white">{headline}</p>
        <p className="mt-1 text-sm text-slate-400">{LOADING_LINES[index]}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Teaching empty state                                                */
/* ------------------------------------------------------------------ */

export function TeachingEmptyState({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-night-600 bg-night-700/40 p-8 text-center">
      <p className="text-3xl">{emoji}</p>
      <h3 className="mt-2 font-bold text-white">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-slate-400">
        {body}
      </p>
      <p className="mt-3 text-sm font-bold text-rain-bright">Start here ↑</p>
    </div>
  );
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-sm font-medium text-red-400">{message}</p>;
}

/* ------------------------------------------------------------------ */
/* Locked tier preview                                                 */
/* ------------------------------------------------------------------ */

export function LockedPreview({
  tier,
  price,
  toolName,
  tagline,
  previews,
}: {
  tier: "Growth" | "Pro";
  price: string;
  toolName: string;
  tagline: string;
  previews: string[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-night-600 bg-night-700/70 p-8 sm:p-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            tier === "Pro"
              ? "radial-gradient(600px 260px at 80% -10%, rgba(167,139,250,0.14), transparent 60%)"
              : "radial-gradient(600px 260px at 80% -10%, rgba(226,0,116,0.12), transparent 60%)",
        }}
      />
      <div className="relative">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
            tier === "Pro"
              ? "bg-violet/15 text-violet-bright ring-1 ring-violet/40"
              : "bg-rain/15 text-rain-bright ring-1 ring-rain/40"
          }`}
        >
          <Lock size={11} /> {tier} tool · {price}
        </span>

        <h2 className="mt-4 text-2xl font-black text-white">{toolName}</h2>
        <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-slate-400">
          {tagline}
        </p>

        <ul className="mt-6 grid max-w-2xl gap-2.5 sm:grid-cols-2">
          {previews.map((preview) => (
            <li
              key={preview}
              className="flex items-start gap-2 rounded-xl border border-night-600 bg-night-800/70 p-3 text-sm text-slate-300"
            >
              <Sparkles
                size={15}
                className={`mt-0.5 shrink-0 ${tier === "Pro" ? "text-violet-bright" : "text-rain-bright"}`}
              />
              {preview}
            </li>
          ))}
        </ul>

        <Link href="/pricing" className="btn-primary mt-7">
          Unlock with {tier} <ArrowRight size={16} />
        </Link>
        <p className="helper-text mt-2">
          On the Pro trial? You already have this — it unlocks the moment your
          trial starts.
        </p>
      </div>
    </div>
  );
}
