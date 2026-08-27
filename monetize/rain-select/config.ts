export const RAIN_SELECT = {
  brandName: "RAIN Select",
  domain: "https://rainselect.com",
  offerName: "30-Day Revenue Intervention",
  monthlyPrice: Number(process.env.RAIN_SELECT_MONTHLY_PRICE || 1500),
  showPrice: process.env.RAIN_SELECT_SHOW_PRICE !== "false",
  guaranteeEnabled: process.env.RAIN_SELECT_3X_GUARANTEE_ENABLED === "true",
  maxActiveClients: process.env.RAIN_SELECT_MAX_ACTIVE_CLIENTS
    ? Number(process.env.RAIN_SELECT_MAX_ACTIVE_CLIENTS)
    : null,
  companyLine:
    "RAIN Select is built by Reliable AI Network in strategic collaboration with Innovative Marketing Solutions.",
  mirReferralUrl: "https://makeitrainapp.com/?from=rain-select",
  cookieVariant: "rain_select_ab",
  cookieVisitor: "rain_select_vid",
  cookieDays: 30,
} as const;

export const SELECT_TITLE = "RAIN Select | 30-Day Revenue Intervention";
export const SELECT_DESCRIPTION =
  "RAIN Select works with selected established businesses to find and attack the highest-value revenue constraints already inside the business. Apply for a 30-Day Revenue Intervention.";

export const REVENUE_RANGES = [
  "Under $250K",
  "$250K-$500K",
  "$500K-$1M",
  "$1M-$3M",
  "$3M-$10M",
  "$10M-$25M",
  "$25M-$100M",
  "$100M+",
] as const;

export const MONTHLY_REVENUE_RANGES = [
  "Under $10K",
  "$10K-$25K",
  "$25K-$50K",
  "$50K-$100K",
  "$100K-$250K",
  "$250K-$500K",
  "$500K+",
  "Not sure",
] as const;

export const EMPLOYEE_RANGES = [
  "Just me",
  "2-5",
  "6-15",
  "16-50",
  "51-200",
  "200+",
] as const;

export const PIPELINE_RANGES = [
  "None / not tracked",
  "Under $25K",
  "$25K-$100K",
  "$100K-$500K",
  "$500K-$2M",
  "$2M+",
] as const;

export const DEAL_VALUE_RANGES = [
  "Under $500",
  "$500-$2K",
  "$2K-$10K",
  "$10K-$50K",
  "$50K+",
] as const;

export const CUSTOMER_COUNT_RANGES = [
  "0",
  "1-10",
  "11-50",
  "51-200",
  "201-1,000",
  "1,000+",
] as const;

export const SALES_CYCLES = [
  "Same week",
  "2-4 weeks",
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "12+ months",
] as const;

export const IMPLEMENTATION_SPEED = [
  "This week",
  "Within 30 days",
  "1-3 months",
  "Need broader approval",
] as const;

export const DECISION_AUTHORITY = [
  "Yes, I can approve a $1,500 engagement",
  "I recommend, someone else approves",
  "Not sure yet",
] as const;

export const MARKETING_SPEND_RANGES = [
  "$0",
  "Under $1K/mo",
  "$1K-$5K/mo",
  "$5K-$20K/mo",
  "$20K+/mo",
] as const;

export type SelectVariant = "a" | "b" | "c" | "d";
export const SELECT_VARIANTS: SelectVariant[] = ["a", "b", "c", "d"];

export type SelectionStatus =
  | "email_only"
  | "application_started"
  | "submitted"
  | "under_review"
  | "selected"
  | "not_selected_yet"
  | "better_fit_other_path"
  | "qualified_capacity_full"
  | "accepted"
  | "declined_offer"
  | "paid";
