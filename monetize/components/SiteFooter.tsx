import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/unsubscribe";

export function SiteFooter({
  className = "",
}: {
  className?: string;
}) {
  return (
    <footer
      className={`border-t border-white/10 py-6 text-center text-xs text-slate-500 ${className}`}
    >
      <p>
        © {new Date().getFullYear()} Make it RAIN · Reliable AI Network, LLC ×{" "}
        <a
          href="https://innovativemarketingb2b.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-slate-300"
        >
          Innovative Marketing Solutions
        </a>
      </p>
      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="transition hover:text-slate-300"
        >
          {SUPPORT_EMAIL}
        </a>
        <Link href="/reviews" className="transition hover:text-slate-300">
          Reviews
        </Link>
        <Link href="/deal-economics" className="transition hover:text-slate-300">
          Unpaid month
        </Link>
        <Link href="/guarantee" className="transition hover:text-slate-300">
          Guarantee
        </Link>
        <a
          href="https://rainselect.com/?utm_source=makeitrain&utm_medium=footer&utm_campaign=post_brief"
          className="transition hover:text-slate-300"
        >
          RAIN Select
        </a>
        <Link href="/terms" className="transition hover:text-slate-300">
          Terms
        </Link>
        <Link href="/privacy" className="transition hover:text-slate-300">
          Privacy
        </Link>
      </p>
    </footer>
  );
}
