"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/TrackedLink";
import { CopySwap } from "@/components/CopySwap";
import { track } from "@/lib/track";
import {
  HOME_AB_COOKIE,
  HOME_BODY_LINES,
  HOME_VARIANTS,
  normalizeHomeVariant,
  pickHomeVariant,
  type HomeVariant,
  type HomeVariantCopy,
} from "@/lib/home-ab";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

function writeCookie(name: string, value: string) {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${
      60 * 60 * 24 * 90
    }; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

function LineStack({
  lines,
  className,
}: {
  lines: readonly string[];
  className?: string;
}) {
  return (
    <span className={className}>
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}

export function HomeHero() {
  const searchParams = useSearchParams();
  const [copy, setCopy] = useState<HomeVariantCopy>(HOME_VARIANTS.a);

  useEffect(() => {
    const fromQuery = normalizeHomeVariant(searchParams.get("v"));
    const fromCookie = normalizeHomeVariant(readCookie(HOME_AB_COOKIE));
    const variant: HomeVariant =
      fromQuery ?? fromCookie ?? pickHomeVariant();
    writeCookie(HOME_AB_COOKIE, variant);
    setCopy(HOME_VARIANTS[variant]);
    track("home_ab_view", { variant });
  }, [searchParams]);

  return (
    <>
      <p className="fade-up mx-auto mt-3 max-w-3xl text-lg font-semibold leading-snug text-white sm:mt-4 sm:text-2xl sm:leading-snug">
        <CopySwap
          block
          mobile={
            <LineStack lines={copy.supportLinesMobile} />
          }
          desktop={
            <LineStack lines={copy.supportLinesDesktop} />
          }
        />
      </p>
      <p className="fade-up mx-auto mt-2 max-w-2xl text-sm leading-snug text-slate-300 sm:mt-3 sm:text-base sm:leading-snug">
        <CopySwap
          block
          mobile={<LineStack lines={HOME_BODY_LINES.mobile} />}
          desktop={<LineStack lines={HOME_BODY_LINES.desktop} />}
        />
      </p>

      <div className="fade-up mt-6 flex w-full max-w-md flex-col items-stretch gap-2.5 sm:mt-7 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3">
        <TrackedLink
          href={copy.primaryHref}
          trackTarget={`hero_cta_primary_${copy.id}`}
          className="btn-primary glow-card inline-flex items-center justify-center gap-2 !px-6 !py-3.5 text-base sm:!px-8 sm:!py-4 sm:text-lg"
        >
          <CopySwap
            mobile={copy.primaryMobile}
            desktop={copy.primaryDesktop}
          />{" "}
          <ArrowRight size={20} />
        </TrackedLink>
        <TrackedLink
          href={copy.secondaryHref}
          trackTarget={`hero_cta_secondary_${copy.id}`}
          className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-aqua/50 hover:bg-aqua/10 sm:px-6 sm:py-3.5"
        >
          <CopySwap
            mobile={copy.secondaryLabelMobile}
            desktop={copy.secondaryLabelDesktop}
          />
        </TrackedLink>
      </div>
      <p className="mt-2.5 text-xs font-medium text-aqua-bright/90 sm:mt-3 sm:text-sm">
        <CopySwap
          block
          mobile={copy.trustLineMobile}
          desktop={copy.trustLineDesktop}
        />
      </p>
      <p className="sr-only" aria-hidden>
        Homepage variant {copy.id}
      </p>
    </>
  );
}
