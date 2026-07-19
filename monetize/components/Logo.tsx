import Link from "next/link";

/** Brand lockup: raindrop mark + italic "Make it RAIN" wordmark. */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group flex w-fit items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/rain-logo.png"
        alt="Make it RAIN logo"
        width={36}
        height={36}
        className="h-9 w-9 rounded-xl shadow-lg shadow-rain/20 ring-1 ring-night-600 transition group-hover:ring-rain/60"
      />
      <span className="text-[15px] font-bold italic tracking-wide text-white">
        Make it <span className="text-rain-bright">RAIN</span>
      </span>
    </Link>
  );
}
