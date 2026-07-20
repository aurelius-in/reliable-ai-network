"use client";

/**
 * Shared beginner-friendly UI primitives used across every dashboard tool:
 * chip selectors, copy/download buttons, fun loading states, teaching
 * empty states, and the locked-tier preview card.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Loader2,
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
  columns,
}: {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  /** Lay chips out in a fixed-column grid instead of a wrapping row. */
  columns?: 2 | 3;
}) {
  const layout =
    columns === 3
      ? "grid grid-cols-3 gap-2"
      : columns === 2
        ? "grid grid-cols-2 gap-2"
        : "flex flex-wrap gap-2";
  return (
    <div className={layout} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`chip ${columns ? "justify-center px-2 text-center" : ""} ${value === option.value ? "chip-on" : ""}`}
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

export const CREATION_TYPE_OPTIONS: ChipOption[] = [
  { value: "app", label: "📱 App" },
  { value: "game", label: "🎮 Game" },
  { value: "tool", label: "🔧 Tool" },
  { value: "saas", label: "☁️ SaaS" },
  { value: "content", label: "🎨 Content / Templates" },
  { value: "other", label: "✨ Other" },
];

/**
 * Compact inline form to describe your own product from any tool tab.
 * Saves it to the `creations` table so it shows up everywhere afterwards.
 */
export function DescribeProductForm({
  onSaved,
}: {
  onSaved: (creation: Creation) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("app");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/creations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.creation) {
        throw new Error(data.error ?? "Failed to save your product");
      }
      onSaved(data.creation as Creation);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="fade-up space-y-4 rounded-xl border border-rain/30 bg-night-800/70 p-4"
    >
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-white">
          What&apos;s it called?
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Meal Prep Genius"
          className="input-dark"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-white">
          What does it do, and for whom?
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Plans a week of meals from your budget and diet. Made for busy parents."
          className="input-dark"
        />
        <p className="helper-text">One or two plain sentences is plenty.</p>
      </div>
      <div>
        <FieldLabel helper="Pick the closest match.">What kind of thing is it?</FieldLabel>
        <ChipGroup
          options={CREATION_TYPE_OPTIONS}
          value={type}
          onChange={setType}
          ariaLabel="Product type"
        />
      </div>
      <ErrorText message={error} />
      <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 text-sm">
        {saving ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Check size={15} />
        )}
        Save &amp; use this product
      </button>
    </form>
  );
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
  const router = useRouter();
  // Creations saved inline from this picker, shown immediately without
  // waiting for the server refresh to land.
  const [added, setAdded] = useState<Creation[]>([]);
  const [describing, setDescribing] = useState(false);

  const all = [
    ...added.filter((a) => !creations.some((c) => c.id === a.id)),
    ...creations,
  ];

  function handleSaved(creation: Creation) {
    setAdded((prev) => [creation, ...prev]);
    onChange(choiceFromCreation(creation));
    setDescribing(false);
    // Re-fetch server data so the new creation shows up in every tab.
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {all.length > 0 && (
        <div>
          <FieldLabel helper="Products you've already added.">
            Your creations
          </FieldLabel>
          <div className="flex flex-wrap gap-2">
            {all.map((creation) => (
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
            all.length > 0
              ? "Describe a new product, or tap an example — the examples are just demos."
              : "Describe your own product to get real answers — the examples are just demos to show how it works."
          }
        >
          {all.length > 0 ? "…or something new" : "Your product"}
        </FieldLabel>
        <button
          type="button"
          onClick={() => setDescribing((open) => !open)}
          className={`block min-h-[44px] w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition active:scale-[0.98] ${
            describing
              ? "border-rain bg-rain/15 text-white shadow-[0_0_14px_rgba(226,0,116,0.22)]"
              : "border-rain/50 bg-night-800 text-white hover:border-rain"
          }`}
        >
          Describe your own
        </button>

        {describing && (
          <div className="mt-3">
            <DescribeProductForm onSaved={handleSaved} />
          </div>
        )}

        <div className="mt-2 grid grid-cols-2 gap-2">
          {EXAMPLE_CREATIONS.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => {
                setDescribing(false);
                onChange({
                  exampleId: example.id,
                  title: example.title,
                  description: example.description,
                  type: example.type,
                });
              }}
              className={`min-h-[44px] rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition active:scale-[0.97] md:min-h-0 ${
                value?.exampleId === example.id
                  ? "border-rain bg-rain/15 text-white shadow-[0_0_14px_rgba(226,0,116,0.22)]"
                  : "border-night-600 bg-night-800 text-slate-300 hover:border-rain/50 hover:text-white"
              }`}
            >
              {example.title}
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
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-night-600 bg-night-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-rain/60 hover:text-white active:scale-[0.96] md:min-h-0"
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
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-night-600 bg-night-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-rain/60 hover:text-white active:scale-[0.96] md:min-h-0"
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
