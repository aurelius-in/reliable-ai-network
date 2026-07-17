import Link from "next/link";
import { CloudRainWind } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 group">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rain to-violet-dim text-white shadow-lg shadow-rain/30 transition group-hover:shadow-rain/50">
        <CloudRainWind size={20} />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-wide text-white">
          RAIN Monetize
        </span>
        <span className="block text-[11px] font-semibold uppercase tracking-widest text-rain-bright">
          Make It Rain
        </span>
      </span>
    </Link>
  );
}
