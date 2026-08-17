import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";
import { SiteFooter } from "@/components/SiteFooter";
import { InviteFromQuery } from "@/components/InviteFromQuery";

export const metadata = { title: "Sign in — Make it RAIN" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <InviteFromQuery />
      </Suspense>
      <Logo />
      <div className="fade-up mt-8 w-full max-w-md rounded-2xl border border-night-600 bg-night-800 p-8 shadow-2xl shadow-black/40">
        <h1 className="text-2xl font-black text-white">Welcome back</h1>
        <p className="mt-1.5 mb-6 text-sm text-slate-400">
          Sign in with the password you set. You do not need to click a
          confirmation email first.
        </p>
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
      <SiteFooter className="mt-10 w-full max-w-md border-0" />
    </div>
  );
}
