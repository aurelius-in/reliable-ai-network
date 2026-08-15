/**
 * Public hook stays short. Protective detail lives on /guarantee.
 *
 * Aug 10: "Next 10 Conversations Plan" tested abstract. Shopping language
 * winners (Needle, EarlyCustomers, founder pain) = first customer / who pays.
 * Named free bait: First Customer Path. Primary CTA: Find who may pay.
 */

export const GUARANTEE = {
  id: "first_customer_path_or_refund_60",
  /** Homepage / pricing primary hook — works at $0 */
  hook: "Clearer ranked conversations in 60 days, or money back",
  hookMobile: "Clearer conversations in 60 days, or money back",
  /** Secondary for already-earning products */
  hookSecondary: "Already earning? 2× revenue in 60 days, or money back",
  termsPath: "/guarantee",
  windowDays: 60,
  baselineDays: 60,
  /** Good-faith outreach for either track */
  minOutreaches: 40,
  /** $0 / conversation track: logged conversations in Results */
  minConversationsLogged: 10,
  /** Refund = subscription fees paid in the window */
  remedy: "money_back",
  /** Named free bait — plain shopping language */
  baitName: "First Customer Path",
  /** Primary button / submit label */
  cta: "Find who may pay",
  ctaLong: "Find who may pay, free",
} as const;
