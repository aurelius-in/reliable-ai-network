"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@/lib/track";
import {
  CUSTOMER_COUNT_RANGES,
  DEAL_VALUE_RANGES,
  DECISION_AUTHORITY,
  EMPLOYEE_RANGES,
  IMPLEMENTATION_SPEED,
  MARKETING_SPEND_RANGES,
  MONTHLY_REVENUE_RANGES,
  PIPELINE_RANGES,
  RAIN_SELECT,
  REVENUE_RANGES,
  SALES_CYCLES,
  type SelectVariant,
} from "./config";
import { SHARED, VARIANT_COPY } from "./copy";
import { captureAttribution, loadAttribution } from "./attribution";
import { newVisitorId, normalizeSelectVariant, variantFromVisitorId } from "./variant";
import { SelectFooter, SelectHeader } from "./SelectChrome";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

function writeCookie(name: string, value: string) {
  const maxAge = RAIN_SELECT.cookieDays * 24 * 60 * 60;
  try {
    const host = window.location.hostname;
    const domain =
      host === "rainselect.com" || host.endsWith(".rainselect.com")
        ? "; Domain=.rainselect.com"
        : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${domain}`;
  } catch {
    /* ignore */
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-left">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-none border border-white/15 bg-black px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/50";

export function SelectLanding() {
  const searchParams = useSearchParams();
  const [variant, setVariant] = useState<SelectVariant>("a");
  const [preview, setPreview] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [step, setStep] = useState<"idle" | "email" | "form" | "done">("idle");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    company_url: "",
    role: "",
    revenue_range: "",
    monthly_revenue_range: "",
    employee_range: "",
    sales_team_size: "",
    pipeline_range: "",
    average_deal_value_range: "",
    customer_count_range: "",
    sales_cycle: "",
    crm: "",
    marketing_spend_range: "",
    suspected_constraint: "",
    thirty_day_goal: "",
    implementation_speed: "",
    decision_authority: "",
  });

  useEffect(() => {
    const previewMode = searchParams.get("preview") === "1";
    const forced = normalizeSelectVariant(searchParams.get("v"));
    let vid = readCookie(RAIN_SELECT.cookieVisitor);
    if (!vid) {
      vid = newVisitorId();
      if (!previewMode) writeCookie(RAIN_SELECT.cookieVisitor, vid);
    }
    const assigned =
      forced ||
      normalizeSelectVariant(readCookie(RAIN_SELECT.cookieVariant)) ||
      variantFromVisitorId(vid);
    if (!previewMode && !forced) {
      writeCookie(RAIN_SELECT.cookieVariant, assigned);
    } else if (!previewMode && forced) {
      writeCookie(RAIN_SELECT.cookieVariant, assigned);
    }
    setVisitorId(vid);
    setVariant(assigned);
    setPreview(previewMode);
    captureAttribution();
    track("select_page_view", {
      variant: assigned,
      preview: previewMode,
      visitor: vid,
    });
  }, [searchParams]);

  const copy = VARIANT_COPY[variant];
  const priceLabel = `$${RAIN_SELECT.monthlyPrice.toLocaleString("en-US")}`;

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    track("select_email_submit_started", { variant, preview });
    try {
      const attr = loadAttribution();
      const res = await fetch("/api/select/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          variant,
          anonymous_visitor_id: visitorId,
          preview,
          ...attr,
        }),
      });
      const data = (await res.json()) as { error?: string; id?: string };
      if (!res.ok || !data.id) {
        setError(data.error || "Could not start the application.");
        track("select_email_submit_error", { variant, preview });
        return;
      }
      setApplicationId(data.id);
      setStep("form");
      track("select_email_captured", { variant, preview });
      track("select_application_started", { variant, preview });
    } catch {
      setError("Could not reach the server.");
      track("select_email_submit_error", { variant, preview });
    } finally {
      setBusy(false);
    }
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/select/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: applicationId,
          email,
          variant,
          anonymous_visitor_id: visitorId,
          preview,
          ...form,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not submit the application.");
        return;
      }
      setStep("done");
      track("select_application_submitted", { variant, preview });
    } catch {
      setError("Could not reach the server. Your answers are still on this page.");
    } finally {
      setBusy(false);
    }
  }

  const priceBlock = useMemo(
    () =>
      RAIN_SELECT.showPrice ? (
        <section
          className="mt-16 border-t border-white/10 pt-12 text-left"
          onMouseEnter={() => track("select_price_viewed", { variant, preview })}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            First-month commitment
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {priceLabel} for the 30-Day Revenue Intervention
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {SHARED.priceNote}
          </p>
        </section>
      ) : null,
    [priceLabel, preview, variant]
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <SelectHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-6 sm:pt-10">
        {preview ? (
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Preview · Variant {variant.toUpperCase()} · {copy.label}
          </p>
        ) : null}

        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {copy.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl">
          {copy.h1.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          {copy.support}
        </p>
        <p className="mt-4 max-w-2xl text-sm font-medium text-zinc-200">
          {SHARED.guaranteeHook}
        </p>
        <div className="mt-8">
          <a
            href="#apply"
            onClick={() => track("select_hero_cta_click", { variant, preview })}
            className="inline-flex items-center border border-white bg-white px-6 py-3 text-sm font-semibold tracking-wide text-black transition hover:bg-zinc-200"
          >
            {copy.cta}
          </a>
        </div>

        <section
          className="mt-16 text-left"
          onMouseEnter={() =>
            track("select_selection_section_viewed", { variant, preview })
          }
        >
          <h2 className="text-2xl font-semibold text-white">{SHARED.whyTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">{SHARED.whyBody}</p>
          <p className="mt-4 text-sm text-zinc-500">{copy.whySelection}</p>
        </section>

        <section className="mt-16 text-left">
          <h2 className="text-2xl font-semibold text-white">{SHARED.examinesTitle}</h2>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {SHARED.examines.map((item) => (
              <li
                key={item}
                className="border-l border-white/20 pl-3 text-sm text-zinc-300"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 text-left">
          <h2 className="text-2xl font-semibold text-white">{SHARED.howTitle}</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2">
            {SHARED.how.map((stepItem, i) => (
              <li key={stepItem.t}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-lg font-medium text-white">{stepItem.t}</p>
                <p className="mt-1 text-sm text-zinc-400">{stepItem.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 grid gap-10 text-left sm:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-white">Who it is for</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              {SHARED.forWhom.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Who it is not for</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              {SHARED.notFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-16 text-left">
          <h2 className="text-xl font-semibold text-white">What gets a business selected</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            {SHARED.selectedBy.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {priceBlock}

        <section
          className="mt-16 border-t border-white/10 pt-12 text-left"
          onMouseEnter={() =>
            track("select_guarantee_viewed", { variant, preview })
          }
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Work guarantee
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {SHARED.guaranteeTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-lg font-medium text-white">
            {SHARED.guaranteeHook}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {SHARED.guaranteeBody}
          </p>
        </section>

        <section
          id="apply"
          className="mt-16 scroll-mt-24 border border-white/12 bg-[#0a0a0a] p-5 text-left sm:p-8"
        >
          {step === "done" ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Application received
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                We have what we need to review.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {SHARED.received}
              </p>
              <p className="mt-4 text-sm text-zinc-500">
                You are not selected until a human operator reviews the business.
              </p>
            </div>
          ) : step === "form" ? (
            <form onSubmit={submitForm} className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Application started
              </p>
              <h2 className="text-2xl font-semibold text-white">
                {SHARED.applyFormTitle}
              </h2>
              <p className="text-sm text-zinc-400">{SHARED.applyConfirm}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name">
                  <input
                    required
                    className={inputClass}
                    value={form.first_name}
                    onChange={(e) => setField("first_name", e.target.value)}
                  />
                </Field>
                <Field label="Last name">
                  <input
                    required
                    className={inputClass}
                    value={form.last_name}
                    onChange={(e) => setField("last_name", e.target.value)}
                  />
                </Field>
                <Field label="Company">
                  <input
                    required
                    className={inputClass}
                    value={form.company_name}
                    onChange={(e) => setField("company_name", e.target.value)}
                  />
                </Field>
                <Field label="Company website">
                  <input
                    required
                    className={inputClass}
                    placeholder="https://"
                    value={form.company_url}
                    onChange={(e) => setField("company_url", e.target.value)}
                  />
                </Field>
                <Field label="Role">
                  <input
                    required
                    className={inputClass}
                    value={form.role}
                    onChange={(e) => setField("role", e.target.value)}
                  />
                </Field>
                <Field label="Approximate annual revenue">
                  <select
                    required
                    className={inputClass}
                    value={form.revenue_range}
                    onChange={(e) => setField("revenue_range", e.target.value)}
                  >
                    <option value="">Select</option>
                    {REVENUE_RANGES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Approximate monthly revenue">
                  <select
                    className={inputClass}
                    value={form.monthly_revenue_range}
                    onChange={(e) =>
                      setField("monthly_revenue_range", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {MONTHLY_REVENUE_RANGES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Employees">
                  <select
                    className={inputClass}
                    value={form.employee_range}
                    onChange={(e) => setField("employee_range", e.target.value)}
                  >
                    <option value="">Select</option>
                    {EMPLOYEE_RANGES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Active pipeline">
                  <select
                    className={inputClass}
                    value={form.pipeline_range}
                    onChange={(e) => setField("pipeline_range", e.target.value)}
                  >
                    <option value="">Select</option>
                    {PIPELINE_RANGES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Average deal / order value">
                  <select
                    className={inputClass}
                    value={form.average_deal_value_range}
                    onChange={(e) =>
                      setField("average_deal_value_range", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {DEAL_VALUE_RANGES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Existing customers">
                  <select
                    className={inputClass}
                    value={form.customer_count_range}
                    onChange={(e) =>
                      setField("customer_count_range", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {CUSTOMER_COUNT_RANGES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Typical sales cycle">
                  <select
                    required
                    className={inputClass}
                    value={form.sales_cycle}
                    onChange={(e) => setField("sales_cycle", e.target.value)}
                  >
                    <option value="">Select</option>
                    {SALES_CYCLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="CRM">
                  <input
                    className={inputClass}
                    value={form.crm}
                    onChange={(e) => setField("crm", e.target.value)}
                  />
                </Field>
                <Field label="Monthly marketing spend">
                  <select
                    className={inputClass}
                    value={form.marketing_spend_range}
                    onChange={(e) =>
                      setField("marketing_spend_range", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {MARKETING_SPEND_RANGES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Salespeople">
                  <input
                    className={inputClass}
                    value={form.sales_team_size}
                    onChange={(e) => setField("sales_team_size", e.target.value)}
                  />
                </Field>
                <Field label="Can you implement in 30 days?">
                  <select
                    required
                    className={inputClass}
                    value={form.implementation_speed}
                    onChange={(e) =>
                      setField("implementation_speed", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {IMPLEMENTATION_SPEED.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Decision authority">
                  <select
                    required
                    className={inputClass}
                    value={form.decision_authority}
                    onChange={(e) =>
                      setField("decision_authority", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {DECISION_AUTHORITY.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Biggest suspected revenue constraint">
                <textarea
                  required
                  rows={3}
                  className={inputClass}
                  value={form.suspected_constraint}
                  onChange={(e) =>
                    setField("suspected_constraint", e.target.value)
                  }
                />
              </Field>
              <Field label="What would make the next 30 days commercially meaningful?">
                <textarea
                  required
                  rows={3}
                  className={inputClass}
                  value={form.thirty_day_goal}
                  onChange={(e) => setField("thirty_day_goal", e.target.value)}
                />
              </Field>
              {error ? <p className="text-sm text-amber-200">{error}</p> : null}
              <button
                type="submit"
                disabled={busy}
                className="border border-white bg-white px-6 py-3 text-sm font-semibold text-black disabled:opacity-60"
              >
                Submit for Selection
              </button>
              <p className="text-xs text-zinc-500">
                {SHARED.applySubmitNote}
              </p>
            </form>
          ) : (
            <form
              onSubmit={submitEmail}
              onFocus={() => track("select_email_form_view", { variant, preview })}
              className="space-y-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Selection application
              </p>
              <h2 className="text-2xl font-semibold text-white">
                {SHARED.applyTitle}
              </h2>
              <p className="text-sm text-zinc-400">{SHARED.applyBody}</p>
              <Field label={SHARED.applyEmailLabel}>
                <input
                  required
                  type="email"
                  className={inputClass}
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              {error ? <p className="text-sm text-amber-200">{error}</p> : null}
              <button
                type="submit"
                disabled={busy}
                className="border border-white bg-white px-6 py-3 text-sm font-semibold text-black disabled:opacity-60"
              >
                {SHARED.applyEmailCta}
              </button>
            </form>
          )}
        </section>
      </main>
      <SelectFooter />
    </div>
  );
}
