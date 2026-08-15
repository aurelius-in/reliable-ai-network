/** Demand discovery / Daily Market Research scan types. */

export type IntentLevel = "high" | "medium" | "low";

/** How you can reach them without cold spam. */
export type TrustPathKind = "warmth" | "intro" | "public_proof";

export type DemandSignal = {
  id: string;
  platform: "reddit" | "hackernews" | "web";
  title: string;
  url: string;
  snippet: string;
  subreddit?: string | null;
  createdAt?: string | null;
  intent: IntentLevel;
  whyMatch: string;
  outreachDraft: string;
  queryUsed: string;
  /** Human label for the community (e.g. Indie Hackers) */
  sourceLabel?: string;
  /** Why this person/thread fits the product (not keywords alone) */
  fitWhy?: string;
  /** Why now: urgency language and/or recency */
  triggerWhy?: string;
  /** Trust path kind for ranking/display */
  trustPath?: TrustPathKind;
  /** Human line for how to approach */
  trustWhy?: string;
  /** One-line: deserves founder time now? */
  deservesTimeNow?: string;
  /** Composite rank (higher = sooner) */
  priorityScore?: number;
};

export type DemandScanResult = {
  productTitle: string;
  queries: string[];
  signals: DemandSignal[];
  providerNotes: string[];
  scannedAt: string;
  /** How many communities we attempt each daily research run */
  sourcesTargeted?: number;
  /** Communities that returned at least one hit this run */
  sourcesHit?: string[];
};
