"use client";

import { useState } from "react";

export function SelectDecisionForm({
  id,
  adminKey,
}: {
  id: string;
  adminKey: string;
}) {
  const [status, setStatus] = useState("selected");
  const [reason, setReason] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [offerMir, setOfferMir] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/select/decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          id,
          status,
          reason,
          next_step_url: nextStep,
          offer_mir: offerMir,
        }),
      });
      const data = (await res.json()) as { error?: string };
      setMsg(res.ok ? "Decision sent." : data.error || "Failed");
    } catch {
      setMsg("Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-2 sm:grid-cols-2">
      <select
        className="input-dark !py-2 text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="selected">Selected</option>
        <option value="not_selected_yet">Not selected yet</option>
        <option value="better_fit_other_path">Better fit for another path</option>
        <option value="qualified_capacity_full">Qualified, capacity full</option>
      </select>
      <input
        className="input-dark !py-2 text-sm"
        placeholder="Reason (required in practice)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <input
        className="input-dark !py-2 text-sm sm:col-span-2"
        placeholder="Next-step URL if selected"
        value={nextStep}
        onChange={(e) => setNextStep(e.target.value)}
      />
      <label className="flex items-center gap-2 text-xs text-slate-400 sm:col-span-2">
        <input
          type="checkbox"
          checked={offerMir}
          onChange={(e) => setOfferMir(e.target.checked)}
        />
        Offer lower-cost self-guided path (do not name Make it RAIN in the first line)
      </label>
      <button
        type="submit"
        disabled={busy || !reason.trim()}
        className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50"
      >
        Send decision
      </button>
      {msg ? <p className="text-xs text-slate-400">{msg}</p> : null}
    </form>
  );
}
