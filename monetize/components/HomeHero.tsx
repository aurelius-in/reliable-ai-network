"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/TrackedLink";
import { CopySwap } from "@/components/CopySwap";
import { HomeTeaserCard } from "@/components/HomeTeaserCard";
import { track } from "@/lib/track";
import {
  normalizeProductUrl,
  readCachedTeaser,
  savePendingProductUrl,
  savePendingTeaser,
  writeCachedTeaser,
  type PendingTeaser,
} from "@/lib/pending-product-url";
import type { PublicTeaserResult } from "@/lib/public-teaser";
import {
  HOME_AB_COOKIE,
  HOME_VARIANTS,
  normalizeHomeVariant,
  nextHomeVariant,
  type HomeVariant,
  type HomeVariantCopy,
} from "@/lib/home-ab";

const CYCLE_LOCK_KEY = "rain_home_ab_cycle_gen";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

function writeCookie(name: string, value: string) {
  try {
    const host = window.location.hostname;
    const domain =
      host === "makeitrainapp.com" || host.endsWith(".makeitrainapp.com")
        ? "; Domain=.makeitrainapp.com"
        : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${
      60 * 60 * 24 * 90
    }; SameSite=Lax${domain}`;
  } catch {
    /* ignore */
  }
}

/** Stable id for this browser navigation (survives React Strict Mode remount). */
function navigationGeneration(): string {
  try {
    const nav = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;
    if (nav) return `${nav.startTime}-${nav.type}`;
  } catch {
    /* ignore */
  }
  return String(Date.now());
}

function stripVariantFromUrl() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("v")) return;
    url.searchParams.delete("v");
    const qs = url.searchParams.toString();
    window.history.replaceState(
      null,
      "",
      url.pathname + (qs ? `?${qs}` : "") + url.hash
    );
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
  const [showBadge, setShowBadge] = useState(false);
  const [productUrl, setProductUrl] = useState("");
  const [teaser, setTeaser] = useState<PendingTeaser | null>(null);
  const [teaserLoading, setTeaserLoading] = useState(false);
  const [teaserError, setTeaserError] = useState<string | null>(null);
  const [hitLimit, setHitLimit] = useState(false);

  useEffect(() => {
    const forced = normalizeHomeVariant(searchParams.get("v"));
    const fromCookie = normalizeHomeVariant(readCookie(HOME_AB_COOKIE));
    const preview = searchParams.get("preview") === "1";

    let variant: HomeVariant;

    if (forced) {
      variant = forced;
      writeCookie(HOME_AB_COOKIE, variant);
    } else {
      try {
        const gen = navigationGeneration();
        const already = sessionStorage.getItem(CYCLE_LOCK_KEY);
        if (already === gen && fromCookie) {
          variant = fromCookie;
        } else {
          variant = nextHomeVariant(fromCookie);
          sessionStorage.setItem(CYCLE_LOCK_KEY, gen);
          writeCookie(HOME_AB_COOKIE, variant);
        }
      } catch {
        variant = nextHomeVariant(fromCookie);
        writeCookie(HOME_AB_COOKIE, variant);
      }
    }

    stripVariantFromUrl();

    setCopy(HOME_VARIANTS[variant]);
    setShowBadge(preview);
    track("home_ab_view", { variant });
  }, [searchParams]);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    const saved = savePendingProductUrl(productUrl);
    track("home_url_submit", {
      variant: copy.id,
      has_url: Boolean(saved),
    });
    if (!saved) {
      setTeaserError("Paste a public product URL first.");
      return;
    }

    const cached = readCachedTeaser(saved);
    if (cached) {
      const next = { ...cached, url: cached.url || saved };
      savePendingTeaser(next);
      setTeaser(next);
      setTeaserError(null);
      setHitLimit(false);
      track("home_teaser_ok", { variant: copy.id, cached: true });
      return;
    }

    setTeaserLoading(true);
    setTeaserError(null);
    setHitLimit(false);
    track("home_teaser_run", { variant: copy.id });

    try {
      const res = await fetch("/api/public-teaser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: saved }),
      });
      const data = (await res.json()) as {
        error?: string;
        limit?: boolean;
        url?: string;
        result?: PublicTeaserResult;
      };
      if (!res.ok || !data.result) {
        setHitLimit(Boolean(data.limit));
        setTeaserError(
          data.error ||
            "Could not read that URL. Check it is public and try again."
        );
        track("home_teaser_fail", {
          variant: copy.id,
          status: res.status,
          limit: Boolean(data.limit),
        });
        return;
      }
      const next: PendingTeaser = {
        url: data.url || saved,
        ...data.result,
      };
      savePendingTeaser(next);
      writeCachedTeaser(next);
      setTeaser(next);
      track("home_teaser_ok", { variant: copy.id, cached: false });
    } catch {
      setTeaserError("Could not reach the server. Try again.");
      track("home_teaser_fail", { variant: copy.id, status: 0 });
    } finally {
      setTeaserLoading(false);
    }
  }

  const signupHref = (() => {
    const saved = normalizeProductUrl(productUrl) || teaser?.url || "";
    return saved ? `/signup?url=${encodeURIComponent(saved)}` : "/signup";
  })();

  return (
    <>
      <h1 className="fade-up mt-3 text-4xl font-black leading-[1.05] tracking-tight text-white sm:mt-4 sm:text-6xl">
        <CopySwap
          block
          mobile={<LineStack lines={copy.headlineMobile} />}
          desktop={<LineStack lines={copy.headlineDesktop} />}
        />
      </h1>
      <p className="fade-up mx-auto mt-3 max-w-3xl text-lg font-semibold leading-snug text-white sm:mt-4 sm:text-2xl sm:leading-snug">
        <CopySwap
          block
          mobile={<LineStack lines={copy.supportLinesMobile} />}
          desktop={<LineStack lines={copy.supportLinesDesktop} />}
        />
      </p>
      <p className="fade-up mx-auto mt-2 max-w-2xl text-sm leading-snug text-slate-300 sm:mt-3 sm:text-base sm:leading-snug">
        <CopySwap
          block
          mobile={<LineStack lines={copy.bodyMobile} />}
          desktop={<LineStack lines={copy.bodyDesktop} />}
        />
      </p>

      <form
        onSubmit={handleRun}
        className="fade-up mt-6 flex w-full max-w-xl flex-col items-stretch gap-2.5 sm:mt-7"
      >
        <label htmlFor="home-product-url" className="sr-only">
          Product URL
        </label>
        <input
          id="home-product-url"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="https://yourproduct.com"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          className="input-dark w-full !py-3.5 text-center sm:text-left"
        />
        <div className="flex w-full flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
          <button
            type="submit"
            disabled={teaserLoading}
            className="btn-primary glow-card inline-flex items-center justify-center gap-2 !px-6 !py-3.5 text-base sm:!px-8 sm:!py-4 sm:text-lg disabled:opacity-70"
          >
            <CopySwap
              mobile={copy.primaryMobile}
              desktop={copy.primaryDesktop}
            />{" "}
            <ArrowRight size={20} />
          </button>
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
      </form>
      {teaserLoading ? (
        <p className="mt-3 text-sm font-medium text-aqua-bright">
          Reading your product...
        </p>
      ) : null}
      {teaserError ? (
        <p className="mt-3 text-sm text-amber-200">{teaserError}</p>
      ) : null}
      {teaser ? (
        <HomeTeaserCard teaser={teaser} signupHref={signupHref} />
      ) : (hitLimit || teaserError) && productUrl.trim() ? (
        <p className="mt-3 text-sm text-slate-300">
          Want the full First Customer Path?{" "}
          <TrackedLink
            href={signupHref}
            trackTarget="home_teaser_save"
            onClick={() => track("home_teaser_save")}
            className="font-semibold text-aqua hover:text-aqua-bright"
          >
            Save this product
          </TrackedLink>
          .
        </p>
      ) : null}
      <p className="mt-2.5 text-xs font-medium text-aqua-bright/90 sm:mt-3 sm:text-sm">
        <CopySwap
          block
          mobile={copy.trustLineMobile}
          desktop={copy.trustLineDesktop}
        />
      </p>
      {showBadge && (
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Preview · Variant {copy.id.toUpperCase()} · {copy.label}
        </p>
      )}
    </>
  );
}
