import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <Logo href="/" />
        <div className="fade-up mt-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-aqua">
            404
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            That page doesn&apos;t exist
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            The link may be old, or the page moved. Head home, check pricing, or
            start a free trial when you&apos;re ready.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="/" className="btn-primary inline-flex justify-center !px-6 !py-3">
              Back to home
            </Link>
            <Link
              href="/pricing"
              className="inline-flex justify-center rounded-xl border border-night-600 bg-night-800 px-6 py-3 text-sm font-semibold text-white transition hover:border-aqua/40"
            >
              View pricing
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <SiteFooter className="mt-16" />
      </div>
    </div>
  );
}
