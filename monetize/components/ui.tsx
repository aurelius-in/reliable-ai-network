"use client";

/**
 * Shared UI primitives used across dashboard tools:
 * chip selectors, copy/download buttons, loading states, empty states,
 * and the locked-tier preview card.
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
} from "lucide-react";
import { EXAMPLE_CREATIONS, LOADING_LINES } from "@/lib/examples";
import { STAGE_OPTIONS } from "@/lib/product-context";
import { RainBullet } from "@/components/RainBullet";
import { TermHint } from "@/components/TermHint";
import type { Creation, EvidenceDoc } from "@/types";

export { RainBullet } from "@/components/RainBullet";

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
  { value: "saas", label: "SaaS" },
  { value: "app", label: "App" },
  { value: "tool", label: "Tool / API" },
  { value: "platform", label: "Platform" },
  { value: "content", label: "Content / templates" },
  { value: "other", label: "Other" },
];

/**
 * Expert product brief form — stage, traction, price, comps, GitHub, docs.
 * Saves to `creations` so every tool can use the same evidence.
 */
export function DescribeProductForm({
  onSaved,
}: {
  onSaved: (creation: Creation) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("saas");
  const [stage, setStage] = useState("building");
  const [traction, setTraction] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [fetchWebsite, setFetchWebsite] = useState(true);
  const [githubUrl, setGithubUrl] = useState("");
  const [fetchGithub, setFetchGithub] = useState(true);
  const [pendingDocs, setPendingDocs] = useState<EvidenceDoc[]>([]);
  const [pendingPdfs, setPendingPdfs] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const isPdf =
        file.type === "application/pdf" || /\.pdf$/i.test(file.name);
      if (isPdf) {
        setPendingPdfs((prev) =>
          [...prev.filter((f) => f.name !== file.name), file].slice(-5)
        );
        return;
      }
      if (
        !/\.(txt|md|markdown|csv|json|xml|yml|yaml|tsv)$/i.test(file.name) &&
        !file.type.startsWith("text/") &&
        file.type !== "application/json"
      ) {
        throw new Error(
          "Upload evidence as .txt, .md, .csv, .json, or .pdf."
        );
      }
      const text = await file.text();
      const excerpt = text.replace(/\u0000/g, "").trim().slice(0, 8000);
      if (!excerpt) throw new Error("That file looked empty.");
      const doc: EvidenceDoc = {
        name: file.name,
        mime: file.type || "text/plain",
        text_excerpt: excerpt,
        uploaded_at: new Date().toISOString(),
      };
      setPendingDocs((prev) =>
        [...prev.filter((d) => d.name !== doc.name), doc].slice(-5)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read file");
    }
  }

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
          stage,
          traction: traction.trim() || null,
          current_price: currentPrice.trim() || null,
          competitors_notes: competitors.trim() || null,
          product_url: productUrl.trim() || null,
          github_repo_url: githubUrl.trim() || null,
          evidence_docs: pendingDocs,
          fetch_website: Boolean(fetchWebsite && productUrl.trim()),
          fetch_github: Boolean(fetchGithub && githubUrl.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.creation) {
        throw new Error(data.error ?? "Failed to save your product");
      }
      let creation = data.creation as Creation;
      for (const pdf of pendingPdfs) {
        const form = new FormData();
        form.set("creationId", creation.id);
        form.set("file", pdf);
        const up = await fetch("/api/creations/evidence", {
          method: "POST",
          body: form,
        });
        const upData = await up.json();
        if (up.ok && upData.creation) creation = upData.creation as Creation;
      }
      onSaved(creation);
      setTitle("");
      setDescription("");
      setTraction("");
      setCurrentPrice("");
      setCompetitors("");
      setProductUrl("");
      setGithubUrl("");
      setPendingDocs([]);
      setPendingPdfs([]);
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
          Product name
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Ops Copilot"
          className="input-dark"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-white">
          What you sell, who buys, and why they pay
        </label>
        <textarea
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Who buys, the problem, how they find you today, and the outcome they pay for. Specifics beat slogans."
          className="input-dark"
        />
        <p className="helper-text mt-1.5">
          Name your <TermHint id="icp">ICP</TermHint> (ideal buyer) and your{" "}
          <TermHint id="distribution">distribution</TermHint> if you have any.
          Tap dotted words for plain English.
        </p>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-white">
          Product URL
        </label>
        <input
          type="url"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://yourproduct.com"
          className="input-dark"
        />
        <label className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={fetchWebsite}
            onChange={(e) => setFetchWebsite(e.target.checked)}
            className="rounded border-night-600"
          />
          Pull public page copy into the audit (title, meta, body text)
        </label>
        <p className="helper-text mt-1.5">
          Optional but recommended. Works alongside your description — we scrape
          static HTML, not a full browser render.
        </p>
      </div>
      <div>
        <FieldLabel helper="Closest category.">Product type</FieldLabel>
        <ChipGroup
          options={CREATION_TYPE_OPTIONS}
          value={type}
          onChange={setType}
          ariaLabel="Product type"
        />
      </div>
      <div>
        <FieldLabel helper="Shapes how aggressive the memo can be.">
          <TermHint id="stage">Stage</TermHint>
        </FieldLabel>
        <ChipGroup
          options={STAGE_OPTIONS.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          value={stage}
          onChange={setStage}
          ariaLabel="Product stage"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-white">
            Current price / <TermHint id="packaging">packaging</TermHint>
          </label>
          <input
            type="text"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="e.g. Free beta · planning $49/mo"
            className="input-dark"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-white">
            Public GitHub repo
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="input-dark"
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={fetchGithub}
              onChange={(e) => setFetchGithub(e.target.checked)}
              className="rounded border-night-600"
            />
            Pull README + repo summary into the brief
          </label>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-white">
          <TermHint id="traction">Traction</TermHint> / metrics
        </label>
        <textarea
          rows={2}
          value={traction}
          onChange={(e) => setTraction(e.target.value)}
          placeholder="e.g. 120 waitlist · 8 design partners · $0 MRR · 3 paid pilots last quarter"
          className="input-dark"
        />
        <p className="helper-text mt-1.5">
          Even tiny numbers help —{" "}
          <TermHint id="waitlist">waitlist</TermHint>,{" "}
          <TermHint id="design_partner">design partners</TermHint>,{" "}
          <TermHint id="mrr">MRR</TermHint>, or{" "}
          <TermHint id="pilot">paid pilots</TermHint>.
        </p>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-white">
          Competitors / alternatives
        </label>
        <textarea
          rows={2}
          value={competitors}
          onChange={(e) => setCompetitors(e.target.value)}
          placeholder="Who they use today, typical price bands, where you win/lose"
          className="input-dark"
        />
      </div>
      <div>
        <FieldLabel helper="Text or PDF (.txt, .md, .csv, .json, .pdf). Max 5.">
          Evidence docs
        </FieldLabel>
        <input
          type="file"
          accept=".txt,.md,.markdown,.csv,.json,.xml,.yml,.yaml,.tsv,.pdf,text/plain,text/markdown,text/csv,application/json,application/pdf"
          onChange={onFileChange}
          className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-night-700 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
        />
        {(pendingDocs.length > 0 || pendingPdfs.length > 0) && (
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            {pendingDocs.map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-2">
                <span className="truncate">{d.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setPendingDocs((prev) => prev.filter((x) => x.name !== d.name))
                  }
                  className="text-slate-500 hover:text-white"
                >
                  Remove
                </button>
              </li>
            ))}
            {pendingPdfs.map((f) => (
              <li key={f.name} className="flex items-center justify-between gap-2">
                <span className="truncate">{f.name} (PDF)</span>
                <button
                  type="button"
                  onClick={() =>
                    setPendingPdfs((prev) => prev.filter((x) => x.name !== f.name))
                  }
                  className="text-slate-500 hover:text-white"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
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
        <span className="absolute inset-0 animate-ping rounded-full bg-aqua/20" />
        <span className="relative flex h-14 w-14 items-center justify-center">
          <RainBullet size={40} className="drop-shadow-[0_0_12px_rgba(0,229,255,0.45)]" />
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
  emoji?: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-night-600 bg-night-700/40 p-8 text-center">
      {emoji ? <p className="text-3xl">{emoji}</p> : null}
      <h3 className={`font-bold text-white ${emoji ? "mt-2" : ""}`}>{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-slate-400">
        {body}
      </p>
      <p className="mx-auto mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-aqua">
        <RainBullet size={14} /> Configure inputs above, then run
      </p>
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
              <RainBullet size={15} className="mt-0.5" />
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
