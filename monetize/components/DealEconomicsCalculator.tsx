"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator } from "lucide-react";
import { CopyButton } from "@/components/ui";
import { track, trackUiClick } from "@/lib/track";
import {
  DEFAULT_DEAL_INPUT,
  computeDealEconomics,
  formatPct,
  formatUsd,
  type DealCadence,
  type DealEconomicsInput,
  type SellerModel,
} from "@/lib/deal-economics";

function moneyField(
  label: string,
  value: number,
  onChange: (n: number) => void,
  hint?: string
) {
  return (
    <label className="block text-left">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        type="number"
        min={0}
        step="1"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input-dark mt-1 !py-2.5"
      />
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

/** In-product proposal / fulfillment calculator. Not the homepage acquisition test. */
export function DealEconomicsCalculator() {
  const [input, setInput] = useState<DealEconomicsInput>(DEFAULT_DEAL_INPUT);
  const [targetKeep, setTargetKeep] = useState(40);
  const tracked = useRef(false);

  const result = useMemo(
    () => computeDealEconomics(input, targetKeep),
    [input, targetKeep]
  );

  useEffect(() => {
    track("deal_calc_view", { mode: "full" });
  }, []);

  function touch() {
    if (tracked.current) return;
    tracked.current = true;
    trackUiClick("deal_calc_interact", { mode: "full" });
  }

  function patch(partial: Partial<DealEconomicsInput>) {
    touch();
    setInput((prev) => ({ ...prev, ...partial }));
  }

  const verdictColor =
    result.verdict === "survives"
      ? "text-emerald-300"
      : result.verdict === "fragile"
        ? "text-amber-200"
        : "text-rose-300";

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-night-800/80 p-4 text-left sm:p-6">
      <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
        <Calculator size={14} /> Proposal economics
      </p>
      <h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">
        Plug in the deal. See the margin. Back into the price.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        Delivery cost, closer pay, what you keep, and what you should charge.
        This supports a proposal. It does not close the buyer for you.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {moneyField(
          "What the buyer pays",
          input.price,
          (price) => patch({ price }),
          input.cadence === "one_time" ? "One-time" : "Per month"
        )}
        {moneyField(
          "Cost to deliver",
          input.deliveryCash,
          (deliveryCash) => patch({ deliveryCash }),
          "APIs, hosting, tools. Not your sunk build time."
        )}
        <label className="block text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pay a closer
          </span>
          <select
            value={input.sellerModel}
            onChange={(e) => patch({ sellerModel: e.target.value as SellerModel })}
            className="input-dark mt-1 !py-2.5"
          >
            <option value="none">I sell it myself</option>
            <option value="commission">Commission %</option>
            <option value="residual">Fixed residual</option>
            <option value="mixed">Commission + residual</option>
          </select>
        </label>
      </div>

      {input.sellerModel !== "none" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {input.sellerModel === "commission" || input.sellerModel === "mixed" ? (
            <label className="block text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Commission
              </span>
              <input
                type="number"
                min={0}
                max={100}
                step="1"
                value={input.commissionPct}
                onChange={(e) => patch({ commissionPct: Number(e.target.value) })}
                className="input-dark mt-1 !py-2.5"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Percent of what the buyer pays
              </span>
            </label>
          ) : null}
          {input.sellerModel === "residual" || input.sellerModel === "mixed" ? (
            moneyField(
              "Residual to the closer",
              input.residualAmount,
              (residualAmount) => patch({ residualAmount }),
              "Fixed amount per period, not a percent"
            )
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="block text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Cadence
          </span>
          <select
            value={input.cadence}
            onChange={(e) => patch({ cadence: e.target.value as DealCadence })}
            className="input-dark mt-1 !py-2.5"
          >
            <option value="monthly">Monthly</option>
            <option value="one_time">One-time</option>
          </select>
        </label>
        {moneyField(
          "Your hours to deliver",
          input.deliveryHours,
          (deliveryHours) => patch({ deliveryHours }),
          "Optional. Added to cash delivery."
        )}
        {moneyField(
          "Your hourly rate",
          input.hourlyRate,
          (hourlyRate) => patch({ hourlyRate })
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {moneyField(
          "Setup pass-through (buyer pays, month 1)",
          input.setupPassThrough,
          (setupPassThrough) => patch({ setupPassThrough }),
          "Onboarding fees. Does not cut your margin."
        )}
        {moneyField(
          "What you want to keep",
          targetKeep,
          (v) => {
            touch();
            setTargetKeep(v);
          },
          "Used to reverse the price you should charge"
        )}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <Stat label="You keep" value={formatUsd(result.ownerKeep)} emphasize />
        <Stat label="Closer gets" value={formatUsd(result.sellerPay)} />
        <Stat label="Your margin" value={formatPct(result.marginPct)} />
      </div>

      <p className={`mt-4 text-sm font-semibold leading-relaxed ${verdictColor}`}>
        {result.verdict === "survives"
          ? "Survives. "
          : result.verdict === "fragile"
            ? "Fragile. "
            : "Dies. "}
        {result.verdictLine}
      </p>

      <div className="mt-5 rounded-xl border border-white/10 bg-night-900/50 p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          What you should charge
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-200">
          <li>
            Break-even (you keep $0):{" "}
            <strong className="text-white">
              {result.reverse.breakEven == null
                ? "Not possible at this commission"
                : formatUsd(result.reverse.breakEven)}
            </strong>
          </li>
          <li>
            20% margin:{" "}
            <strong className="text-white">
              {result.reverse.margin20 == null
                ? "Not possible at this commission"
                : formatUsd(result.reverse.margin20)}
            </strong>
          </li>
          <li>
            To keep {formatUsd(targetKeep)}:{" "}
            <strong className="text-white">
              {result.reverse.targetKeep == null
                ? "Not possible at this commission"
                : formatUsd(result.reverse.targetKeep)}
            </strong>
          </li>
        </ul>
        {result.month1ClientBill > result.price ? (
          <p className="mt-2 text-xs text-slate-500">
            Buyer month-1 bill (price + setup): {formatUsd(result.month1ClientBill)}
          </p>
        ) : null}

        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          Proposal lines
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
          {result.proposalLines.join("\n")}
        </p>
        <div className="mt-3">
          <CopyButton
            text={result.proposalLines.join("\n")}
            label="Copy proposal lines"
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Pair this with Buyer Stress Test before you burn outreach. CRM
        architecture, outbound infrastructure, custom funnels, and hands-on
        execution are the next layer when software is not enough. That is not
        this calculator.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 ${
        emphasize
          ? "border-aqua/40 bg-aqua/10"
          : "border-white/10 bg-night-900/40"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
