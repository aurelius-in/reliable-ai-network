"use client";

import { useState } from "react";
import { InviteBootstrap } from "@/components/InviteBootstrap";
import { AccessCodeForm } from "@/components/AccessCodeForm";
import { AccessCodeAutoRedeem } from "@/components/AccessCodeAutoRedeem";
import { TrackedLink } from "@/components/TrackedLink";
import {
  INTEL_ACCESS_CODE,
  INTEL_INVITE_TOKEN,
  type IntelPerson,
} from "@/lib/intel-cohort";

const STOPPED = [
  { id: "confirm_email", label: "I never got or never clicked the confirmation email" },
  { id: "didnt_run_product", label: "I signed in but never ran it on my product" },
  { id: "unclear_result", label: "I was not sure what I would get" },
  { id: "card_friction", label: "I did not want to put in a card" },
  { id: "looking_around", label: "I was only looking around" },
  { id: "other", label: "Something else" },
];

const LANDED = [
  { id: "product_hunt", label: "Product Hunt" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "homepage", label: "The homepage / a direct link" },
  { id: "sample_brief", label: "A sample brief or report" },
  { id: "other", label: "Somewhere else" },
];

export function IntelSurveyForm({
  person,
  loggedIn,
}: {
  person: IntelPerson;
  loggedIn: boolean;
}) {
  const [landed, setLanded] = useState("");
  const [stopped, setStopped] = useState("");
  const [hoped, setHoped] = useState("");
  const [wouldContinue, setWouldContinue] = useState("");
  const [productLine, setProductLine] = useState("");
  const [callOk, setCallOk] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!landed || !stopped || hoped.trim().length < 8) {
      setError("Please answer the first three questions. A short sentence is enough.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/intel-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: person.token,
          landed,
          stopped,
          hoped: hoped.trim(),
          wouldContinue: wouldContinue.trim(),
          productLine: productLine.trim(),
          callOk,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Could not save that."
        );
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    const nextHref = loggedIn
      ? "/onboarding"
      : `/login?next=${encodeURIComponent("/onboarding")}&invite=${encodeURIComponent(INTEL_INVITE_TOKEN)}`;
    return (
      <div className="space-y-5">
        <InviteBootstrap accessCode={INTEL_ACCESS_CODE} />
        {loggedIn ? <AccessCodeAutoRedeem /> : null}
        <div className="rounded-2xl border border-aqua/30 bg-aqua/10 px-5 py-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
            Thank you
          </p>
          <h2 className="mt-2 text-xl font-black text-white">
            Sixty days of Pro is unlocked. No card.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Your code is{" "}
            <span className="font-mono font-semibold text-white">
              {INTEL_ACCESS_CODE}
            </span>
            . We also emailed it to {person.email}. Click continue and it
            should apply when you are signed in. Sign in with the password you
            set. Confirmation can wait.
          </p>
        </div>
        <TrackedLink
          href={nextHref}
          trackTarget="intel_survey_continue"
          className="btn-primary inline-flex w-full items-center justify-center !px-6 !py-3.5"
        >
          {loggedIn ? "Continue to First Customer Path" : "Sign in and continue"}
        </TrackedLink>
        <AccessCodeForm heading="If the code did not apply automatically" />
        <p className="text-center text-xs text-slate-500">
          Then paste your product URL. Starter tools work immediately. Pro is
          included for 60 days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold text-white">
          How did you first land on Make it RAIN?
        </legend>
        <div className="mt-2 space-y-1.5">
          {LANDED.map((o) => (
            <label
              key={o.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-night-900/50 px-3 py-2.5 text-sm text-slate-200"
            >
              <input
                type="radio"
                name="landed"
                value={o.id}
                checked={landed === o.id}
                onChange={() => setLanded(o.id)}
                className="mt-0.5"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-white">
          Where did you stop?
        </legend>
        <div className="mt-2 space-y-1.5">
          {STOPPED.map((o) => (
            <label
              key={o.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-night-900/50 px-3 py-2.5 text-sm text-slate-200"
            >
              <input
                type="radio"
                name="stopped"
                value={o.id}
                checked={stopped === o.id}
                onChange={() => setStopped(o.id)}
                className="mt-0.5"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="hoped" className="text-sm font-semibold text-white">
          What were you hoping it would do for you?
        </label>
        <textarea
          id="hoped"
          required
          rows={3}
          value={hoped}
          onChange={(e) => setHoped(e.target.value)}
          placeholder="One honest sentence is enough"
          className="input-dark mt-2"
        />
      </div>

      <div>
        <label htmlFor="would" className="text-sm font-semibold text-white">
          What would make it worth coming back?{" "}
          <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="would"
          rows={2}
          value={wouldContinue}
          onChange={(e) => setWouldContinue(e.target.value)}
          className="input-dark mt-2"
        />
      </div>

      <div>
        <label htmlFor="product" className="text-sm font-semibold text-white">
          Your product in one line{" "}
          <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="product"
          value={productLine}
          onChange={(e) => setProductLine(e.target.value)}
          placeholder="What you shipped"
          className="input-dark mt-2"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-white">
          Open to a 15-minute call?{" "}
          <span className="font-normal text-slate-500">(optional)</span>
        </legend>
        <div className="mt-2 flex gap-2">
          {["yes", "no"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setCallOk(v)}
              className={`rounded-xl border px-4 py-2 text-sm ${
                callOk === v
                  ? "border-aqua/50 bg-aqua/10 text-white"
                  : "border-white/10 text-slate-300"
              }`}
            >
              {v === "yes" ? "Yes" : "Not right now"}
            </button>
          ))}
        </div>
      </fieldset>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
        Send answers and unlock 60 days of Pro
      </button>
      <p className="text-center text-xs text-slate-500">
        No card. After you send answers, you get a code and a continue button.
        Sign in with the password you set. Confirmation can wait.
      </p>
    </form>
  );
}
