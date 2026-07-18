import { Logo } from "@/components/Logo";
import { OnboardingForm } from "@/components/OnboardingForm";

export const metadata = { title: "Onboarding — Make it Rain" };

export default function OnboardingPage() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex justify-center">
          <Logo href="/dashboard" />
        </div>

        <div className="fade-up mt-10 rounded-2xl border border-night-600 bg-night-800 p-8 shadow-2xl shadow-black/40">
          <h1 className="text-2xl font-black text-white">
            Tell us what you built
          </h1>
          <p className="mt-1.5 mb-7 text-sm text-slate-400">
            Our AI will score its monetization potential and hand you a
            personalized plan — recommended revenue paths, quick wins, and your
            big promise.
          </p>
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
