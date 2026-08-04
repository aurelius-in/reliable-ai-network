/** Homepage A/B/C variants — only 2–3 intentional diffs each.
 *
 * A = playbook control
 * B = agency price anchor (strategy clarified — not “we sell for you”)
 * C = decision / advisory layer (service-ladder messaging)
 * See docs/service-ladder.md
 */

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
    primaryDesktop: "Get my tailored playbook",
    primaryHref: "/signup",
    secondaryLabelMobile: "See a sample",
    secondaryLabelDesktop: "See a sample first",
    secondaryHref: "/sample",
    trustLineMobile: "Free to start. No card.",
    trustLineDesktop: "Free to start. No card required.",
  },
  b: {
    id: "b",
    label: "Agency mirror",
    supportLinesMobile: [
      "An agency's first month of strategy.",
      "In your first week.",
      "$149, not $5,000.",
    ],
    supportLinesDesktop: [
      "An agency's first month of strategy. In your first week.",
      "$149, not $5,000.",
      "Plans and briefs you run — not us selling for you.",
    ],
    primaryMobile: "Start my strategy week",
    primaryDesktop: "Start my strategy week free",
    primaryHref: "/signup",
    secondaryLabelMobile: "See the $10k menu",
    secondaryLabelDesktop: "See the $10k menu",
    secondaryHref: "#tenk-menu",
    trustLineMobile: "Advisory layer. Start free.",
    trustLineDesktop: "Commercialization advisory. Start free. No card.",
  },
  c: {
    id: "c",
    label: "Decision layer",
    supportLinesMobile: [
      "Better commercialization decisions.",
      "Keep the plan current.",
      "Know what to do next.",
    ],
    supportLinesDesktop: [
      "Make better commercialization decisions.",
      "Keep the plan current. Know what to do next.",
    ],
    primaryMobile: "Start deciding free",
    primaryDesktop: "Start my decision layer free",
    primaryHref: "/signup",
    secondaryLabelMobile: "See a sample",
    secondaryLabelDesktop: "See a sample first",
    secondaryHref: "/sample",
    trustLineMobile: "You decide. You (or specialists) execute.",
    trustLineDesktop:
      "Advisory for founders who already built something. You keep the code.",
  },
};

export function normalizeHomeVariant(
  raw: string | null | undefined
): HomeVariant | null {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "a" || v === "b" || v === "c") return v;
  return null;
}

/** Read assigned homepage variant from the browser cookie (client only). */
export function readHomeAbFromDocument(): HomeVariant | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${HOME_AB_COOKIE}=`));
    const raw = match
      ? decodeURIComponent(match.split("=")[1] ?? "")
      : null;
    return normalizeHomeVariant(raw);
  } catch {
    return null;
  }
}

export function pickHomeVariant(seed?: string): HomeVariant {
  const forced = normalizeHomeVariant(seed);
  if (forced) return forced;
  const n = Math.floor(Math.random() * 3);
  return n === 0 ? "a" : n === 1 ? "b" : "c";
}
