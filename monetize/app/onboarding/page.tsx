import { Logo } from "@/components/Logo";
import { OnboardingForm } from "@/components/OnboardingForm";
import { AccessCodeAutoRedeem } from "@/components/AccessCodeAutoRedeem";
import Link from "next/link";

export const metadata = { title: "Onboarding — Make it RAIN" };

export default function OnboardingPage() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex justify-center">
          <Logo href="/dashboard" />
        </div>

        <div className="fade-up mt-10 space-y-4">
          <AccessCodeAutoRedeem />
          <div className="rounded-2xl border border-night-600 bg-night-800 p-8 shadow-2xl shadow-black/40">
            <h1 className="text-2xl font-black text-white">
              Your tailored customer playbook
            </h1>
            <p className="mt-1.5 mb-3 text-sm text-slate-400">
              Paste a product URL or describe what you own. Optionally add
              public GitHub or a short doc. You get who may pay, what to charge,
              evidence-graded claims, kill criteria, this-week actions, and a
              shareable brief. No source-code access. Your software stays yours.
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
