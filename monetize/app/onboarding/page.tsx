import { Logo } from "@/components/Logo";
import { OnboardingForm } from "@/components/OnboardingForm";
import { AccessCodeAutoRedeem } from "@/components/AccessCodeAutoRedeem";
import { AccessCodeForm } from "@/components/AccessCodeForm";
import { ConfirmEmailBanner } from "@/components/ConfirmEmailBanner";
import Link from "next/link";

export const metadata = { title: "Onboarding | Make it RAIN" };

export default function OnboardingPage() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex justify-center">
          <Logo href="/dashboard" />
        </div>

        <div className="fade-up mt-10 space-y-4">
          <ConfirmEmailBanner />
          <AccessCodeAutoRedeem />
          <details className="rounded-2xl border border-white/10 bg-night-800/60 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-300">
              Have a feedback code?
            </summary>
            <div className="mt-3">
              <AccessCodeForm heading="Apply it here. No card." />
            </div>
          </details>
          <div className="rounded-2xl border border-night-600 bg-night-800 p-8 shadow-2xl shadow-black/40">
            <h1 className="text-2xl font-black text-white">
              Paste the product. Get who may pay.
            </h1>
            <p className="mt-1.5 mb-3 text-sm text-slate-400">
              URL in. Leave with one buyer, a price to test, a Buyer Stress
              Test, and the next conversation worth your hour.
            </p>
            <p className="mb-7 text-xs text-slate-500">
              Prefer to inspect quality first?{" "}
              <Link href="/sample" className="font-semibold text-aqua hover:text-aqua-bright">
                See an illustrative sample brief
              </Link>
              .
            </p>
            <OnboardingForm />
          </div>
        </div>
      </div>
    </div>
  );
}
