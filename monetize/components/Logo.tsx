import Link from "next/link";

/** Brand lockup: glassy raindrop mark + Make it RAIN wordmark. */
export function Logo({
  href = "/",
  animated = false,
}: {
  href?: string;
  animated?: boolean;
}) {
  return (
    <Link href={href} className="group flex w-fit items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={animated ? "/brand/logo-anim.gif" : "/brand/mark.jpg"}
        alt="Make it RAIN"
        width={40}
        height={40}
        className="h-10 w-10 rounded-[0.85rem] object-cover shadow-[0_0_18px_rgba(0,229,255,0.28)] ring-1 ring-white/15 transition group-hover:shadow-[0_0_24px_rgba(230,0,255,0.28)] group-hover:ring-aqua/50"
      />
      <span className="text-[15px] font-bold tracking-wide text-white">
        Make it{" "}
        <span className="bg-gradient-to-r from-aqua via-white to-rain-bright bg-clip-text text-transparent">
          RAIN
        </span>
      </span>
    </Link>
  );
}
