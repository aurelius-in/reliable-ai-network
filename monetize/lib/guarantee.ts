/**
 * Public hook stays short. Protective detail lives on /guarantee.
 */

export const GUARANTEE = {
  id: "playbook_double_or_refund_60",
  /** Homepage — succinct + memorable */
  hook: "Tailored customer playbook + 2× revenue in 60 days — or your money back",
  hookMobile: "Tailored playbook + 2× revenue in 60 days — or money back",
  termsPath: "/guarantee",
  windowDays: 60,
  baselineDays: 60,
  minOutreaches: 40,
  /** Refund = subscription fees paid in the window */
  remedy: "money_back",
} as const;
