"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Users } from "lucide-react";
import { FieldLabel } from "@/components/ui";
import { track } from "@/lib/track";

const STORAGE_PREFIX = "rain_warm_network_";

export type WarmContact = {
  name: string;
  why: string;
};

function parseLines(raw: string): WarmContact[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const sep = line.includes(" — ")
        ? " — "
        : line.includes(" - ")
          ? " - "
          : line.includes(":")
            ? ":"
            : null;
      if (!sep) return { name: line, why: "" };
      const [name, ...rest] = line.split(sep);
      return { name: name.trim(), why: rest.join(sep).trim() };
    })
    .filter((c) => c.name.length > 0)
    .slice(0, 15);
}

/**
 * Doctor-style first step before Demand Radar: who do you already know?
 * Persists locally so the sprint starts from network warmth.
 */
export function WarmNetworkPanel({
  productKey,
  buyerHint,
}: {
  productKey: string;
  buyerHint?: string;
}) {
  const storageKey = `${STORAGE_PREFIX}${productKey || "default"}`;
  const [raw, setRaw] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        setRaw(existing);
        setSaved(true);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const contacts = parseLines(raw);

  function save() {
    try {
      localStorage.setItem(storageKey, raw);
      setSaved(true);
      track("warm_network_saved", {
        count: contacts.length,
        product_key: productKey.slice(0, 40),
      });
    } catch {
      setSaved(false);
    }
  }

  return (
    <div className="rounded-xl border border-aqua/30 bg-aqua/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Users size={18} className="mt-0.5 shrink-0 text-aqua" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white">
            Step 1 · People you already know
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            First customers usually come from warm networks, not Reddit.
            List up to 10 people who might care about{" "}
            {buyerHint ? (
              <span className="text-slate-300">{buyerHint}</span>
            ) : (
              "this buyer"
            )}
            . One per line. Optional: name — why they fit.
          </p>
          <div className="mt-3">
            <FieldLabel helper="Saved on this device.">
              Warm contacts
            </FieldLabel>
          </div>
          <textarea
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setSaved(false);
            }}
            rows={5}
            placeholder={
              "Alex Chen — ex-coworker, ran ops at Series A\nJordan Lee — paid me for consulting last year\nSam Rivera — posted about this pain on LinkedIn"
            }
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-night-900 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-aqua/50 focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={save} className="btn-secondary !py-2">
              Save warm list ({contacts.length})
            </button>
            {saved && contacts.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 size={14} aria-hidden />
                Saved. Message these before cold signals.
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
