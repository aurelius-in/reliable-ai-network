import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";
import { SiteFooter } from "@/components/SiteFooter";
import { InviteBootstrap } from "@/components/InviteBootstrap";
import { ExitSurvey } from "@/components/ExitSurvey";
import { lookupInviteToken } from "@/lib/invite-tokens";
import { GUARANTEE } from "@/lib/guarantee";
import { PersistProductUrl } from "@/components/PersistProductUrl";
import { SignupTeaserFields } from "@/components/SignupTeaserFields";
import { normalizeProductUrl } from "@/lib/pending-product-url";

export const metadata = {
  title: `${GUARANTEE.baitName} | Make it RAIN`,
  description: `Paste a product URL, see a commercial result, then save to run First Customer Path: who may pay, Buyer Stress Test, next conversation. No card.`,
  alternates: { canonical: "/signup" },
};

type Props = {
  searchParams: Promise<{ invite?: string; url?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const sp = await searchParams;
  const invite = lookupInviteToken(sp.invite);
  const isReviewer = invite?.kind === "reviewer";
  const isIntel = invite?.kind === "intel";
  const pendingUrl = sp.url ? normalizeProductUrl(sp.url) : "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {invite ? <InviteBootstrap accessCode={invite.accessCode} /> : null}
      {pendingUrl ? <PersistProductUrl url={pendingUrl} /> : null}
      <Logo />
      <div className="fade-up mt-8 w-full max-w-md rounded-2xl border border-night-600 bg-night-800 p-8 shadow-2xl shadow-black/40">
        {isReviewer || isIntel ? (
          <>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
              {isIntel ? "Founder feedback access" : "Complimentary reviewer account"}
            </p>
            <h1 className="mt-2 text-2xl font-black text-white">
              {isIntel ? "Unlock 60 days of Pro" : "Open your reviewer access"}
            </h1>
            <p className="mt-1.5 mb-5 text-sm text-slate-400">
              {isIntel
                ? "No card. Complete the survey, then sign in with this account. Pro applies when you continue."
                : "Oliver invited you to examine whether Make it RAIN separates evidence from assumptions. Create your account below. No card. No billing for reviewer access."}
            </p>
            <ul className="rain-list mb-6 space-y-2 text-sm text-slate-300">
              <li>Pro tools for {invite!.grant.durationDays} days</li>
              <li>Sample product path or your own public URL</li>
              <li>Evidence grades visible in the brief</li>
              <li>
                {isIntel
                  ? "Access applies when you continue. No card."
                  : "Feedback welcome: positive, negative, or neutral"}
              </li>
            </ul>
            <Suspense>
              <AuthForm
                mode="signup"
                variant="reviewer"
                submitLabel={
                  isIntel ? "Continue" : "Create reviewer account"
                }
                collectCompany={!isIntel}
              />
            </Suspense>
          </>
        ) : (
          <>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
              Free · no card
            </p>
            <h1 className="mt-2 text-2xl font-black text-white">
              {pendingUrl ? "Save this product" : "Run it on your product"}
            </h1>
            <p className="mt-1.5 mb-5 text-sm text-slate-400">
              {pendingUrl
                ? "Want the full First Customer Path? Save this product. Who may pay, a price to test, Buyer Stress Test, and the next conversation worth your hour. No card. No guaranteed sale."
                : `Create a free account and get your ${GUARANTEE.baitName}: who may pay, a price to test, Buyer Stress Test, and the next conversation worth your hour. No guaranteed sale.`}
            </p>
            {pendingUrl ? <SignupTeaserFields /> : null}
            {pendingUrl ? (
              <p className="mb-5 rounded-lg border border-aqua/30 bg-aqua/10 px-3 py-2 text-sm text-aqua-bright">
                Next: First Customer Path on{" "}
                <span className="font-semibold break-all">{pendingUrl}</span>
              </p>
            ) : null}
            <ul className="rain-list mb-6 space-y-2 text-sm text-slate-300">
              <li>One buyer who may actually pay</li>
              <li>One paid offer and a price to test</li>
              <li>Buyer Stress Test before another week of promotion</li>
              <li>The next conversation worth your hour</li>
              <li>Drafts you approve before send</li>
            </ul>
            <p className="mb-5 text-xs text-slate-500">
              If this brief is free, the paid path should feel obvious.{" "}
              {GUARANTEE.hook}
            </p>
            <Suspense>
              <AuthForm
                mode="signup"
                submitLabel={pendingUrl ? "Save this product" : GUARANTEE.cta}
              />
            </Suspense>
          </>
        )}
      </div>
      <ExitSurvey source={isReviewer ? "signup_reviewer" : isIntel ? "signup_intel" : "signup"} />
      <SiteFooter className="mt-10 w-full max-w-md border-0" />
    </div>
  );
}
