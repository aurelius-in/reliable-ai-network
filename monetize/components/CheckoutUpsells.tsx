"use client";

import { trackUiClick } from "@/lib/track";
import {
  CHECKOUT_UPSELLS,
  upsellMonthlyTotal,
  type CheckoutUpsellId,
} from "@/lib/checkout-upsells";

/**
 * GoDaddy-style optional add-ons before embedded Stripe checkout.
 */
export function CheckoutUpsells({
  selected,
  onChange,
  planPrice,
}: {
  selected: CheckoutUpsellId[];
  onChange: (next: CheckoutUpsellId[]) => void;
  planPrice: number;
}) {
  const selectedUpsells = CHECKOUT_UPSELLS.filter((u) =>
    selected.includes(u.id)
  );
  const addOnTotal = upsellMonthlyTotal(selectedUpsells);

  function toggle(id: CheckoutUpsellId) {
    const on = selected.includes(id);
    const next = on ? selected.filter((x) => x !== id) : [...selected, id];
    onChange(next);
    trackUiClick("checkout_upsell_toggle", {
      upsell: id,
      selected: (!on).toString(),
    });
  }

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-night-600 bg-night-800">
      <div className="border-b border-night-600 px-4 py-3 sm:px-5">
        <p className="text-sm font-bold text-white">
          Add what you need to run the funnel
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          Optional. Like domain checkout extras — skip any you do not need. Your
          plan still works alone. Selected add-ons share the 30-day free trial,
          then bill monthly with your plan.
        </p>
      </div>

      <ul className="divide-y divide-night-600">
        {CHECKOUT_UPSELLS.map((u) => {
          const checked = selected.includes(u.id);
          return (
            <li key={u.id}>
              <label
                className={`flex cursor-pointer gap-3 px-4 py-3.5 transition sm:gap-4 sm:px-5 ${
                  checked ? "bg-aqua/5" : "hover:bg-white/[0.02]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(u.id)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-night-500 bg-night-900 text-aqua focus:ring-aqua/40"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {u.name}
                    </span>
                    {u.recommended && (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200 ring-1 ring-amber-400/30">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-aqua-bright/90">
                    {u.need}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {u.detail}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-black tabular-nums text-white">
                    ${u.priceMonthly}
                    <span className="text-xs font-semibold text-slate-500">
                      /mo
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500">after trial</p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-night-600 bg-night-900/50 px-4 py-3 sm:px-5">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-slate-400">Plan</span>
          <span className="tabular-nums text-slate-200">
            ${planPrice}/mo after trial
          </span>
        </div>
        {addOnTotal > 0 && (
          <div className="mt-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-slate-400">
              Add-ons ({selectedUpsells.length})
            </span>
            <span className="tabular-nums text-slate-200">
              +${addOnTotal}/mo after trial
            </span>
          </div>
        )}
        <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-night-600 pt-2 text-sm font-bold">
          <span className="text-white">After trial (if you keep everything)</span>
          <span className="tabular-nums text-aqua-bright">
            ${planPrice + addOnTotal}/mo
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">
          $0 due today for the trial. Cancel any add-on from Billing anytime.
          Add-ons are specialist / AI-assisted services, not required to use Make
          it RAIN.
        </p>
      </div>
    </section>
  );
}
