import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";
import { SiteFooter } from "@/components/SiteFooter";
import { InviteBootstrap } from "@/components/InviteBootstrap";
import { ExitSurvey } from "@/components/ExitSurvey";
import { lookupInviteToken } from "@/lib/invite-tokens";

export const metadata = {
  title: "Start free | Make it RAIN",
  description:
    "Create a free Make it RAIN account. Get a tailored customer playbook for the product you already built: who may pay, what to charge, and what to do this week. No card to start.",
  alternates: { canonical: "/signup" },
};

type Props = {
  searchParams: Promise<{ invite?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const sp = await searchParams;
  const invite = lookupInviteToken(sp.invite);
  const isReviewer = Boolean(invite);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {invite ? <InviteBootstrap accessCode={invite.accessCode} /> : null}
      <Logo />
      <div className="fade-up mt-8 w-full max-w-md rounded-2xl border border-night-600 bg-night-800 p-8 shadow-2xl shadow-black/40">
        {isReviewer ? (
          <>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
              Complimentary reviewer account
            </p>
            <h1 className="mt-2 text-2xl font-black text-white">
              Open your reviewer access
            </h1>
            <p className="mt-1.5 mb-5 text-sm text-slate-400">
              Oliver invited you to examine whether Make it RAIN separates
              evidence from assumptions. Create your account below. No card. No
              billing for reviewer access.
            </p>
            <ul className="rain-list mb-6 space-y-2 text-sm text-slate-300">
              <li>Pro tools for {invite!.grant.durationDays} days</li>
              <li>Sample product path or your own public URL</li>
              <li>Evidence grades visible in the brief</li>
              <li>Feedback welcome: positive, negative, or neutral</li>
            </ul>
            <Suspense>
              <AuthForm
                mode="signup"
                variant="reviewer"
                submitLabel="Create reviewer account"
                collectCompany
              />
            </Suspense>
          </>
        ) : (
          <>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
              Free tailored customer playbook
            </p>
            <h1 className="mt-2 text-2xl font-black text-white">
              Get who pays, what to charge, and what to do this week
            </h1>
            <p className="mt-1.5 mb-5 text-sm text-slate-400">
              For the product you already built. Create a free account, paste a
              URL or short description, and get a grounded commercialization
              brief. No card to start. We do not build or own your software.
            </p>
            <ul className="rain-list mb-6 space-y-2 text-sm text-slate-300">
              <li>Who is most likely to pay (and what to say to them)</li>
              <li>A price you can defend and a test to run</li>
              <li>This-week actions toward a paid yes</li>
              <li>Evidence labeled vs assumptions (not fake certainty)</li>
              <li>Shareable brief for a cofounder or advisor</li>
            </ul>
            <Suspense>
              <AuthForm
                mode="signup"
                submitLabel="Get my tailored playbook"
              />
            </Suspense>
          </>
        )}
      </div>
      <ExitSurvey source={isReviewer ? "signup_reviewer" : "signup"} />
      <SiteFooter className="mt-10 w-full max-w-md border-0" />
    </div>
  );
}
