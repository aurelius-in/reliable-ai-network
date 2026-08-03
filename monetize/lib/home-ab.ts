/** Homepage A/B/C variants — only 2–3 intentional diffs each. */

export type HomeVariant = "a" | "b" | "c";

export const HOME_AB_COOKIE = "rain_home_ab";

export type HomeVariantCopy = {
  id: HomeVariant;
  label: string;
  /** Support lines under the brand (mobile). */
  supportLinesMobile: string[];
  /** Support lines under the brand (desktop). */
  supportLinesDesktop: string[];
  primaryMobile: string;
  primaryDesktop: string;
  /** Primary CTA href */
  primaryHref: string;
  secondaryLabelMobile: string;
  secondaryLabelDesktop: string;
  secondaryHref: string;
  trustLineMobile: string;
  trustLineDesktop: string;
};

/** Shared body under the support lines (all variants). */
export const HOME_BODY_LINES = {
  mobile: ["Paste a URL or describe what you built.", "You keep the code."],
  desktop: [
    "Who may pay. What to charge. What to do this week.",
    "Start free. Paste a URL or describe what you own.",
    "Not an app builder. You keep the code.",
  ],
} as const;

export const HOME_VARIANTS: Record<HomeVariant, HomeVariantCopy> = {
  a: {
    id: "a",
    label: "Playbook (control)",
    supportLinesMobile: [
      "Who may pay.",
      "What to charge.",
      "What to do this week.",
    ],
    supportLinesDesktop: [
      "A tailored customer playbook for the product you already built.",
      "Who may pay. What to charge. What to do this week.",
    ],
    primaryMobile: "Get my playbook free",
    primaryDesktop: "Get my tailored playbook free",
    primaryHref: "/signup",
    secondaryLabelMobile: "See a sample",
    secondaryLabelDesktop: "See a sample first",
    secondaryHref: "/sample",
    trustLineMobile: "Free to start. No card.",
    trustLineDesktop: "Free to start. No card required.",
  },
  b: {
    id: "b",
    label: "Agency swap",
    supportLinesMobile: [
      "Who may pay. What to charge. This week's plan.",
      "Agency work. Subscription price.",
    ],
    supportLinesDesktop: [
      "Who may pay. What to charge. A plan for this week.",
      "What agencies charge thousands for. Start free.",
    ],
    primaryMobile: "Start without the agency bill",
    primaryDesktop: "Get the plan without the agency bill",
    primaryHref: "/signup",
    secondaryLabelMobile: "See pricing",
    secondaryLabelDesktop: "See how plans compare",
    secondaryHref: "/pricing",
    trustLineMobile: "From $29/mo after trial.",
    trustLineDesktop: "From $29/mo after the 30-day free trial.",
  },
  c: {
    id: "c",
    label: "Sample first",
    supportLinesMobile: ["See a sample first.", "Then get yours free."],
    supportLinesDesktop: [
      "See a sample of what you get.",
      "Then get your tailored playbook free.",
    ],
    primaryMobile: "See a sample",
    primaryDesktop: "See a sample first",
    primaryHref: "/sample",
    secondaryLabelMobile: "Then start free",
    secondaryLabelDesktop: "Then get my playbook free",
    secondaryHref: "/signup",
    trustLineMobile: "Sample needs no signup.",
    trustLineDesktop: "The sample needs no signup.",
  },
};

export function normalizeHomeVariant(
  raw: string | null | undefined
): HomeVariant | null {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "a" || v === "b" || v === "c") return v;
  return null;
}

export function pickHomeVariant(seed?: string): HomeVariant {
  const forced = normalizeHomeVariant(seed);
  if (forced) return forced;
  const n = Math.floor(Math.random() * 3);
  return n === 0 ? "a" : n === 1 ? "b" : "c";
}
