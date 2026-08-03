export type ReviewStatus = "pending" | "approved" | "rejected";

export type ProductReviewRow = {
  id: string;
  author_name: string;
  company_name: string | null;
  body: string;
  display_body: string | null;
  founder_response: string | null;
  status: ReviewStatus;
  ip_hash: string;
  user_agent: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type PublicReview = {
  id: string;
  authorName: string;
  companyName: string;
  body: string;
  /** Official Make it RAIN reply; indented under the review when present. */
  response: string | null;
  createdAt: string;
  /** True when this visitor's IP matches the submitter (pending preview). */
  pendingPreview?: boolean;
};

export const REVIEW_NOTIFY_TO = [
  "oliveraellison@gmail.com",
  "ai@reliableainetwork.com",
] as const;

export const REVIEW_RESPONSE_LABEL = "Make it RAIN";

export const MAX_REVIEW_NAME = 80;
export const MAX_REVIEW_COMPANY = 80;
export const MAX_REVIEW_BODY = 2000;
export const MAX_FOUNDER_RESPONSE = 2000;
export const MIN_REVIEW_BODY = 20;

export function publicBody(row: ProductReviewRow): string {
  return (row.display_body ?? row.body).trim();
}

/** "First Last, Company" same shape as seed reviews. */
export function formatReviewByline(
  authorName: string,
  companyName: string
): string {
  const name = authorName.trim();
  const company = companyName.trim();
  if (name && company) return `${name}, ${company}`;
  return name || company;
}

export function toPublicReview(
  row: ProductReviewRow,
  opts?: { pendingPreview?: boolean }
): PublicReview {
  const response = row.founder_response?.trim() || null;
  return {
    id: row.id,
    authorName: row.author_name.trim(),
    companyName: (row.company_name ?? "").trim(),
    body: publicBody(row),
    response,
    createdAt: row.created_at,
    pendingPreview: opts?.pendingPreview,
  };
}
