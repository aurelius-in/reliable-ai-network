import Link from "next/link";
import { Logo } from "@/components/Logo";

export function LegalDocShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 py-10 md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Logo href="/" />
          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to site
          </Link>
        </div>

        <header className="mt-12 border-b border-night-600 pb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-aqua">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-slate-400">Last updated: {updated}</p>
        </header>

        <article className="legal-prose mt-10 space-y-10 pb-16 text-[15px] leading-relaxed text-slate-300">
          {children}
        </article>

        <footer className="border-t border-night-600 py-8 text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Make it RAIN · Reliable AI Network,
            LLC
          </p>
          <p className="mt-2 flex items-center justify-center gap-4">
            <Link href="/terms" className="hover:text-slate-300">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

export function LegalSection({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="text-xl font-bold text-white">
        <span className="mr-2 text-aqua">{n}</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
