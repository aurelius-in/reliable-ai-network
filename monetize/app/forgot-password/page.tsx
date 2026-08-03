import { Logo } from "@/components/Logo";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata = { title: "Forgot password — Make it RAIN" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Logo />
      <div className="fade-up mt-8 w-full max-w-md rounded-2xl border border-night-600 bg-night-800 p-8 shadow-2xl shadow-black/40">
        <h1 className="text-2xl font-black text-white">Forgot password</h1>
        <p className="mt-1.5 mb-6 text-sm text-slate-400">
          We&apos;ll email you a link to choose a new one.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
