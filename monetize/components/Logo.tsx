import Link from "next/link";

/**
 * Brand lockup: raindrop mark + "RAIN Monetize" on one row, with the
 * "Make It Rain" tagline in italics on its own line underneath.
 * Pass tagline={false} where the surrounding chrome renders the tagline
 * itself (e.g. TopNav's strip under the nav bar).
 */
export function Logo({
  href = "/",
  tagline = true,
}: {
  href?: string;
  tagline?: boolean;
}) {
  return (
    <div className="w-fit">
      <Link href={href} className="group flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/rain-logo.png"
          alt="RAIN logo"
          width={36}
          height={36}
          className="h-9 w-9 rounded-xl shadow-lg shadow-rain/20 ring-1 ring-night-600 transition group-hover:ring-rain/60"
        />
        <span className="text-[15px] font-bold tracking-wide text-white">
          RAIN Monetize
        </span>
      </Link>
      {tagline && (
        <p className="mt-1 pl-[46px] text-[10px] font-semibold uppercase italic tracking-[0.3em] text-rain-bright">
          Make It Rain
        </p>
      )}
    </div>
  );
}
