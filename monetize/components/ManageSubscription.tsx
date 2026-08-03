"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Layers } from "lucide-react";
import { track } from "@/lib/track";

type Step = "closed" | "menu" | "plans" | "warnings" | "offer";

const WARNINGS = [
  {
    title: "Your current rate will be void",
    body: "If you cancel, the price you pay today is no longer reserved. Rejoining later means accepting whatever the then-current rate is.",
  },
  {
    title: "Future signup fees are expected to increase",
    body: "Plan pricing and introductory offers change over time. Canceling now forfeits legacy pricing and any trial or promo terms tied to this subscription.",
  },
  {
    title: "Saved work and progress will not be available",
    body: "Strategies, buyer lists, funnels, content, launch plans, and progress checklists generated in your account are tied to an active paid workspace. After cancel, that workspace ends.",
  },
  {
    title: "Outputs are not kept as a lasting archive",
    body: "We do not promise long-term storage of tool outputs for canceled accounts. Treat cancel as losing access to prior work unless you export what you need first.",
  },
  {
    title: "You lose continuity on go-to-market momentum",
    body: "Mid-funnel experiments, outreach sequences, and pricing tests stop with the plan. Restarting later means rebuilding context from scratch.",
  },
  {
    title: "Support and roadmap priority reset",
    body: "Active subscribers get priority help and product attention. Canceled accounts return to the back of the line if you come back.",
  },
  {
    title: "This cannot be undone with one click",
    body: "Once canceled, restoring access requires a new checkout. There is no instant restore of your previous billing terms.",
  },
  {
    title: "Seat and workspace features reset",
    body: "Any plan-linked limits, history depth, and commercial tooling return to the free/unsubscribed state after cancel.",
  },
];

export function ManageSubscription({
  tierLabel,
  price,
}: {
  tierLabel: string;
  price?: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("closed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ackWarnings, setAckWarnings] = useState(false);

  function open() {
    track("manage_subscription_open");
    setError(null);
    setSuccess(null);
    setAckWarnings(false);
    setStep("menu");
  }

  function close() {
    if (loading) return;
    setStep("closed");
    setError(null);
    setAckWarnings(false);
  }

  async function openPortal() {
    track("billing_portal_open", { label: "update_payment" });
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not open billing portal");
      }
      window.location.href = data.url;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      track("billing_portal_error", { message: message.slice(0, 160) });
      setError(message);
      setLoading(false);
    }
  }

  async function runCancel(action: "accept_retention" | "confirm_cancel") {
    track(
      action === "accept_retention"
        ? "cancel_retention_click"
        : "cancel_confirm_click"
    );
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not complete request");

      if (data.outcome === "retention") {
        const end = data.endsAt
          ? new Date(data.endsAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : null;
        setSuccess(
          end
            ? `Pro access through ${end}. No further card charges while this offer is active.`
            : "Pro access granted. No further card charges while this offer is active."
        );
        setStep("closed");
        router.refresh();
      } else {
        setSuccess("Subscription canceled. Your paid access has ended.");
        setStep("closed");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center gap-2 rounded-xl border border-night-600 bg-night-700 px-5 py-2.5 font-semibold text-white transition hover:border-rain hover:bg-night-600"
      >
        Manage subscription
      </button>
      <p className="text-xs text-slate-500">
        Update payment method or change plans.
      </p>
      {success && <p className="text-sm text-aqua-bright">{success}</p>}

      {step !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-night-600 bg-night-800 shadow-2xl"
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {step === "menu" && (
                <>
                  <h2 className="text-lg font-black text-white">
                    Manage subscription
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Current plan: {tierLabel}
                    {price != null ? ` · $${price}/mo` : ""}
                  </p>
                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void openPortal()}
                      className="flex w-full items-center gap-3 rounded-xl border border-night-600 bg-night-700 px-4 py-3 text-left transition hover:border-aqua/50"
                    >
                      <CreditCard size={18} className="shrink-0 text-aqua" />
                      <span>
                        <span className="block font-semibold text-white">
                          Update payment method
                        </span>
                        <span className="text-xs text-slate-400">
                          Card, billing email, and invoices
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        track("manage_compare_plans");
                        setStep("plans");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-night-600 bg-night-700 px-4 py-3 text-left transition hover:border-aqua/50"
                    >
                      <Layers size={18} className="shrink-0 text-aqua" />
                      <span>
                        <span className="block font-semibold text-white">
                          Compare or change plans
                        </span>
                        <span className="text-xs text-slate-400">
                          See tiers and switch plans
                        </span>
                      </span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-5 w-full text-sm text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </>
              )}

              {step === "plans" && (
                <>
                  <h2 className="text-lg font-black text-white">
                    Compare or change plans
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Review tiers and pick the plan that fits. You can switch
                    from Pricing, or update billing details anytime.
                  </p>
                  <a
                    href="/pricing"
                    className="btn-primary mt-5 inline-flex w-full items-center justify-center"
                  >
                    View pricing
                  </a>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setStep("menu")}
                    className="mt-3 w-full text-sm text-slate-400 hover:text-white"
                  >
                    Back
                  </button>

                  <div className="mt-16 border-t border-night-600 pt-10">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        track("manage_cancel_open");
                        setAckWarnings(false);
                        setStep("warnings");
                      }}
                      className="w-full rounded-xl border border-night-600 px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:border-night-500 hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {step === "warnings" && (
                <>
                  <h2 className="text-lg font-black text-white">
                    End subscription
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Ending your {tierLabel} subscription has lasting effects.
                    Please review the following.
                  </p>
                  <ul className="mt-5 space-y-3">
                    {WARNINGS.map((w) => (
                      <li
                        key={w.title}
                        className="rounded-xl border border-night-600 bg-night-900/50 p-3"
                      >
                        <p className="text-sm font-semibold text-white">
                          {w.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">
                          {w.body}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 space-y-4 border-t border-night-600 pt-6">
                    <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={ackWarnings}
                        onChange={(e) => setAckWarnings(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-night-500 bg-night-900"
                      />
                      <span>I have read and understand the above.</span>
                    </label>
                    <button
                      type="button"
                      disabled={loading || !ackWarnings}
                      onClick={() => {
                        track("manage_cancel_ack");
                        setStep("offer");
                      }}
                      className="w-full rounded-xl border border-night-600 px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        track("manage_cancel_aborted_at_warnings");
                        setStep("plans");
                      }}
                      className="btn-primary w-full"
                    >
                      Stay subscribed
                    </button>
                  </div>
                </>
              )}

              {step === "offer" && (
                <>
                  <h2 className="text-lg font-black text-white">
                    Before you go
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Canceling ends paid billing and access to your workspace.
                    If you want time to finish what you started without another
                    charge, you can take Pro for 60 days free instead — your
                    tools and progress stay available, with no card charges
                    during that period.
                  </p>

                  {/* Force scroll before decision buttons */}
                  <div className="mt-6 space-y-3 text-sm text-slate-500" aria-hidden>
                    <p>
                      Complimentary Pro includes the full commercialization
                      toolkit for sixty days from the moment you accept.
                    </p>
                    <p>
                      After those sixty days, you can subscribe again if you
                      want to continue. If you cancel instead, restoring access
                      requires a new checkout at then-current rates.
                    </p>
                    <p>
                      Export anything you need before you cancel permanently.
                      Workspace outputs are not guaranteed as a long-term
                      archive for canceled accounts.
                    </p>
                    <p>
                      Choosing complimentary Pro pauses further charges and
                      preserves your path. Choosing Cancel ends paid access
                      now.
                    </p>
                  </div>

                  <div className="mt-10 space-y-3 border-t border-night-600 pt-8">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void runCancel("accept_retention")}
                      className="btn-primary inline-flex w-full items-center justify-center gap-2"
                    >
                      {loading && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      Get PRO for 60 days FREE
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void runCancel("confirm_cancel")}
                      className="w-full rounded-xl border border-night-600 px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:border-slate-500 hover:text-white"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" />
                          Working…
                        </span>
                      ) : (
                        "Cancel"
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        track("manage_cancel_aborted_at_offer");
                        setStep("warnings");
                      }}
                      className="w-full text-sm text-slate-500 hover:text-white"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}

              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
