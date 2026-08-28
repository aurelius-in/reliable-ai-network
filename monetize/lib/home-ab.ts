/**
 * Homepage copy. Brand chorus is locked. Do not A/B a new slogan.
 * Source: marketing/brand-lock.md
 *
 * Chorus: You built something real. Now it's time to get paid. Make it RAIN.
 * Underneath: Find who may pay, stress-test the offer, and figure out the
 * next conversation worth having.
 * CTA: Run it on my product, free.
 *
 * Variants A-D currently share locked brand copy so old cookies still work.
 * Do not put a different chorus on B/C/D.
 *
 * Assignment: cookie `rain_home_ab`. Force with /?v=a|b|c|d then strip from URL.
 * Preview badge: /?v=a&preview=1
 */

export type HomeVariant = "a" | "b" | "c" | "d";

export const HOME_AB_COOKIE = "rain_home_ab";

export const HOME_VARIANT_ORDER: HomeVariant[] = ["a", "b", "c", "d"];

export type HomeVariantCopy = {
  id: HomeVariant;
  label: string;
  headlineMobile: string[];
  headlineDesktop: string[];
  supportLinesMobile: string[];
  supportLinesDesktop: string[];
  bodyMobile: string[];
  bodyDesktop: string[];
  primaryMobile: string;
  primaryDesktop: string;
  primaryHref: string;
  secondaryLabelMobile: string;
  secondaryLabelDesktop: string;
  secondaryHref: string;
  trustLineMobile: string;
  trustLineDesktop: string;
};

const HEADLINE = [
  "You built something real.",
  "Now it's time to get paid.",
];

const SUPPORT_MOBILE = [
  "Find who may pay, stress-test the offer, and the next conversation worth having. Paste your URL for a result before an account.",
];

const SUPPORT_DESKTOP = [
  "Find who may pay, stress-test the offer, and the next conversation worth having. Paste your product URL for a commercial result before an account, then save to run First Customer Path.",
];

const BODY_MOBILE: string[] = [];
const BODY_DESKTOP: string[] = [];

const TRUST_MOBILE = "No card.";
const TRUST_DESKTOP =
  "No card. Not a guaranteed sale. If you upgrade and run the path, clearer ranked conversations in 60 days or money back on fees paid.";

const LOCKED = {
  headlineMobile: HEADLINE,
  headlineDesktop: HEADLINE,
  supportLinesMobile: SUPPORT_MOBILE,
  supportLinesDesktop: SUPPORT_DESKTOP,
  bodyMobile: BODY_MOBILE,
  bodyDesktop: BODY_DESKTOP,
  primaryMobile: "Run it on my product, free",
  primaryDesktop: "Run it on my product, free",
  primaryHref: "/signup",
  secondaryLabelMobile: "See a real brief",
  secondaryLabelDesktop: "See a real brief",
  secondaryHref: "/#examples",
  trustLineMobile: TRUST_MOBILE,
  trustLineDesktop: TRUST_DESKTOP,
} as const;

export const HOME_VARIANTS: Record<HomeVariant, HomeVariantCopy> = {
  a: { id: "a", label: "Brand lock", ...LOCKED },
  b: { id: "b", label: "Brand lock", ...LOCKED },
  c: { id: "c", label: "Brand lock", ...LOCKED },
  d: { id: "d", label: "Brand lock", ...LOCKED },
};

export function isHomeVariant(v: unknown): v is HomeVariant {
  return v === "a" || v === "b" || v === "c" || v === "d";
}

export function normalizeHomeVariant(
  raw: string | null | undefined
): HomeVariant | null {
  const v = (raw ?? "").trim().toLowerCase();
  return isHomeVariant(v) ? v : null;
}

export function nextHomeVariant(_prev: HomeVariant | null): HomeVariant {
  return "a";
}

export function pickHomeVariant(seed?: string): HomeVariant {
  const forced = normalizeHomeVariant(seed);
  if (forced) return forced;
  return "a";
}

/** Read assigned variant from cookie (client). */
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
