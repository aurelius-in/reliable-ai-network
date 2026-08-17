export const INTEL_ACCESS_CODE = "RAIN60INTEL";
export const INTEL_INVITE_TOKEN = "early-feedback";

export type IntelPersonKind = "new_signup" | "signed_up_no_trial" | "reviewer";

export type IntelPerson = {
  id: string;
  token: string;
  email: string;
  firstName: string;
  fullName: string;
  kind: IntelPersonKind;
};

/** Early accounts Oliver wants honest follow-up from. Not a public list. */
export const INTEL_COHORT: IntelPerson[] = [
  {
    id: "clive",
    token: "c7k4-clive-chen",
    email: "clivechen2013@gmail.com",
    firstName: "Clive",
    fullName: "Clive Chen",
    kind: "new_signup",
  },
  {
    id: "praful",
    token: "p9r2-praful-satasia",
    email: "praful.satasia@ariprus.com",
    firstName: "Praful",
    fullName: "Praful Satasia",
    kind: "signed_up_no_trial",
  },
  {
    id: "james",
    token: "j3m8-james-pratt",
    email: "james@fyve.dev",
    firstName: "James",
    fullName: "James Pratt",
    kind: "reviewer",
  },
  {
    id: "vinicius",
    token: "v1n6-vinicius-marchetti",
    email: "marchettivinim@gmail.com",
    firstName: "Vinicius",
    fullName: "Vinicius",
    kind: "signed_up_no_trial",
  },
];

export function lookupIntelPerson(
  token: string | null | undefined
): IntelPerson | null {
  if (!token) return null;
  const t = token.trim().toLowerCase();
  return INTEL_COHORT.find((p) => p.token === t) ?? null;
}

export function intelSurveyPath(token: string): string {
  return `/intel/${encodeURIComponent(token)}`;
}

const SITE = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://makeitrainapp.com"
).replace(/\/$/, "");

export const INTEL_SITE = SITE;

export const INTEL_SAMPLE_BRIEF_HREF =
  "https://makeitrainapp.com/r/3e8c70e39bd350961d9c0a88e7182e9b323f";

export const INTEL_PRO_REVIEW_HREF =
  "https://makeitrainapp.com/reports/make-it-rain-pro-review-redacted.pdf";

export function intelSurveyUrl(token: string): string {
  return `${SITE}${intelSurveyPath(token)}`;
}

export function intelIntro(person: IntelPerson): string {
  if (person.kind === "new_signup") {
    return "You created an account and did not make it into the product. If the confirmation email was the wall, that is now fixable: sign in and send the link again. Two minutes of honest answers, then 60 days of Pro. No card.";
  }
  if (person.kind === "reviewer") {
    return "You already have reviewer access. I still want the honest version of what you saw, skipped, or would not use. Two minutes. Completing the survey keeps Pro for 60 days from today if that is later than your current end date. No card.";
  }
  return "You created a Make it RAIN account and did not run First Customer Path on your product. That is useful. If the app got in the way, I need to know where. Two minutes. Then 60 days of Pro. No card.";
}
