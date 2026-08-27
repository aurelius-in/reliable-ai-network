/**
 * Customer-facing acquisition calculator.
 * Dave's pattern: a few of THEIR numbers, immediate economics of the
 * problem (or of solving it). Not the proposal/fulfillment margin sheet.
 */

import { formatUsd } from "@/lib/deal-economics";

export type ProblemValueInput = {
  revenueThisMonth: number;
  hoursPerWeek: number;
  hourlyRate: number;
  /** 0 means they have not named a price yet */
  priceTheyWant: number;
};

export const DEFAULT_PROBLEM_VALUE: ProblemValueInput = {
  revenueThisMonth: 0,
  hoursPerWeek: 8,
  hourlyRate: 75,
  priceTheyWant: 0,
};

const WEEKS_PER_MONTH = 4;

function n(v: number): number {
  return Number.isFinite(v) && v > 0 ? v : 0;
}

export type ProblemValueResult = {
  timeCost: number;
  hole: number;
  salesToCoverTime: number | null;
  starterVsHole: number | null;
  headline: string;
  detail: string;
};

export function computeProblemValue(
  input: ProblemValueInput
): ProblemValueResult {
  const hours = n(input.hoursPerWeek);
  const rate = n(input.hourlyRate);
  const revenue = Math.max(0, Number.isFinite(input.revenueThisMonth) ? input.revenueThisMonth : 0);
  const price = n(input.priceTheyWant);
  const timeCost = Math.round(hours * WEEKS_PER_MONTH * rate);
  const hole = Math.round(timeCost - revenue);
  const salesToCoverTime =
    price > 0 && timeCost > 0 ? Math.max(1, Math.ceil(timeCost / price)) : null;
  const starterVsHole = hole > 29 ? hole - 29 : null;

  if (timeCost <= 0) {
    return {
      timeCost: 0,
      hole: -revenue,
      salesToCoverTime,
      starterVsHole: null,
      headline: "Put in hours and a rate to see the cost of another unpaid month.",
      detail:
        "This is a hypothesis about your time, not a promised sale. First Customer Path still starts with who may pay.",
    };
  }

  if (hole <= 0) {
    return {
      timeCost,
      hole,
      salesToCoverTime,
      starterVsHole: null,
      headline: `This month's time (${formatUsd(timeCost)}) is covered by product revenue on paper.`,
      detail:
        "Next question: would a skeptical buyer actually keep paying? That is the Buyer Stress Test, not another feature sprint.",
    };
  }

  const salesLine = salesToCoverTime
    ? ` At ${formatUsd(price)}, you would need about ${salesToCoverTime} paid yes${salesToCoverTime === 1 ? "" : "es"} this month just to cover that time.`
    : "";

  return {
    timeCost,
    hole,
    salesToCoverTime,
    starterVsHole,
    headline: `Another unpaid month is costing about ${formatUsd(hole)} in your time.`,
    detail: `You put ${hours} hours/week at ${formatUsd(rate)}/hr against ${formatUsd(revenue)} product revenue.${salesLine} The next move is who may pay, what to charge, and the next conversation, not more polish.`,
  };
}
