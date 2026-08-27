/**
 * Generic deal economics for founders who already shipped.
 * Concepts inspired by IMS's fulfillment/margin sheet (sale price, delivery
 * cost, seller pay, reverse "what should I charge"). No IMS levels, vendor
 * prices, residual tables, or partner names live here.
 */

export type SellerModel = "none" | "commission" | "residual" | "mixed";
export type DealCadence = "monthly" | "one_time";
export type DealVerdict = "survives" | "fragile" | "dies";

export type DealEconomicsInput = {
  price: number;
  cadence: DealCadence;
  deliveryCash: number;
  deliveryHours: number;
  hourlyRate: number;
  sellerModel: SellerModel;
  commissionPct: number;
  residualAmount: number;
  setupPassThrough: number;
};

export type DealEconomicsResult = {
  price: number;
  deliveryCost: number;
  sellerPay: number;
  ownerKeep: number;
  marginPct: number;
  verdict: DealVerdict;
  verdictLine: string;
  month1ClientBill: number;
  reverse: {
    breakEven: number | null;
    margin20: number | null;
    targetKeep: number | null;
  };
  proposalLines: string[];
};

export const DEFAULT_DEAL_INPUT: DealEconomicsInput = {
  price: 99,
  cadence: "monthly",
  deliveryCash: 20,
  deliveryHours: 0,
  hourlyRate: 75,
  sellerModel: "commission",
  commissionPct: 20,
  residualAmount: 0,
  setupPassThrough: 0,
};

function n(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

function roundMoney(v: number): number {
  return Math.round(n(v) * 100) / 100;
}

export function formatUsd(value: number, digits = 0): string {
  const v = n(value);
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPct(value: number): string {
  const v = n(value) * 100;
  return `${v.toFixed(0)}%`;
}

export function deliveryCostOf(input: DealEconomicsInput): number {
  return roundMoney(
    Math.max(0, n(input.deliveryCash)) +
      Math.max(0, n(input.deliveryHours)) * Math.max(0, n(input.hourlyRate))
  );
}

export function sellerPayOf(price: number, input: DealEconomicsInput): number {
  const p = Math.max(0, n(price));
  const pct = Math.min(100, Math.max(0, n(input.commissionPct))) / 100;
  const residual = Math.max(0, n(input.residualAmount));
  switch (input.sellerModel) {
    case "none":
      return 0;
    case "commission":
      return roundMoney(p * pct);
    case "residual":
      return roundMoney(residual);
    case "mixed":
      return roundMoney(p * pct + residual);
  }
}

function solvePrice(
  delivery: number,
  input: DealEconomicsInput,
  keepTarget: number
): number | null {
  const pct =
    input.sellerModel === "commission" || input.sellerModel === "mixed"
      ? Math.min(100, Math.max(0, n(input.commissionPct))) / 100
      : 0;
  const residual =
    input.sellerModel === "residual" || input.sellerModel === "mixed"
      ? Math.max(0, n(input.residualAmount))
      : 0;
  const denom = 1 - pct;
  if (denom <= 0.001) return null;
  const raw = (keepTarget + delivery + residual) / denom;
  if (!Number.isFinite(raw) || raw < 0) return null;
  return roundMoney(raw);
}

function solvePriceForMargin(
  delivery: number,
  input: DealEconomicsInput,
  margin: number
): number | null {
  const pct =
    input.sellerModel === "commission" || input.sellerModel === "mixed"
      ? Math.min(100, Math.max(0, n(input.commissionPct))) / 100
      : 0;
  const residual =
    input.sellerModel === "residual" || input.sellerModel === "mixed"
      ? Math.max(0, n(input.residualAmount))
      : 0;
  const denom = 1 - pct - margin;
  if (denom <= 0.001) return null;
  const raw = (delivery + residual) / denom;
  if (!Number.isFinite(raw) || raw < 0) return null;
  return roundMoney(raw);
}

export function verdictOf(ownerKeep: number, price: number): DealVerdict {
  if (price <= 0 || ownerKeep <= 0) return "dies";
  const margin = ownerKeep / price;
  if (margin < 0.15) return "dies";
  if (margin < 0.35) return "fragile";
  return "survives";
}

export function verdictLineOf(
  verdict: DealVerdict,
  cadence: DealCadence
): string {
  const unit = cadence === "one_time" ? "this sale" : "each month";
  if (verdict === "dies") {
    return `This deal does not pay you on ${unit}. Raise the price, cut delivery cost, or do not hire a closer yet.`;
  }
  if (verdict === "fragile") {
    return `It works on paper, barely. A skeptical buyer or a commission bump would wipe ${unit}.`;
  }
  return `There is margin left after delivery and a seller. Next: would a real buyer pay this?`;
}

export function computeDealEconomics(
  input: DealEconomicsInput,
  targetKeep = 0
): DealEconomicsResult {
  const price = roundMoney(Math.max(0, n(input.price)));
  const deliveryCost = deliveryCostOf(input);
  const sellerPay = sellerPayOf(price, input);
  const ownerKeep = roundMoney(price - deliveryCost - sellerPay);
  const marginPct = price > 0 ? ownerKeep / price : 0;
  const verdict = verdictOf(ownerKeep, price);
  const setup = Math.max(0, n(input.setupPassThrough));

  const proposalUnit = input.cadence === "one_time" ? "one-time" : "per month";
  const proposalLines = [
    `Buyer pays ${formatUsd(price)} ${proposalUnit}.`,
    `Cost to deliver: ${formatUsd(deliveryCost)}.`,
    sellerPay > 0
      ? `Seller / closer: ${formatUsd(sellerPay)}.`
      : `No seller commission on this deal.`,
    `You keep ${formatUsd(ownerKeep)} (${formatPct(marginPct)} margin).`,
    setup > 0
      ? `Month-1 setup pass-through (buyer-paid, not your margin): ${formatUsd(setup)}.`
      : "",
  ].filter(Boolean);

  return {
    price,
    deliveryCost,
    sellerPay,
    ownerKeep,
    marginPct,
    verdict,
    verdictLine: verdictLineOf(verdict, input.cadence),
    month1ClientBill: roundMoney(price + setup),
    reverse: {
      breakEven: solvePrice(deliveryCost, input, 0),
      margin20: solvePriceForMargin(deliveryCost, input, 0.2),
      targetKeep:
        targetKeep > 0 ? solvePrice(deliveryCost, input, targetKeep) : null,
    },
    proposalLines,
  };
}
