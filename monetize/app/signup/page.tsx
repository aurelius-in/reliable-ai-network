import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Sign up — RAIN Monetize" };

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Logo />
      <div className="fade-up mt-8 w-full max-w-md rounded-2xl border border-night-600 bg-night-800 p-8 shadow-2xl shadow-black/40">
        <h1 className="text-2xl font-black text-white">Create your account</h1>
        <p className="mt-1.5 mb-6 text-sm text-slate-400">
          Step 1 of making it rain. Free 30-day Pro trial starts after signup —
          cancel anytime.
        </p>
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  );
}
