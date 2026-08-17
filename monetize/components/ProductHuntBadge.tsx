"use client";

import { trackUiClick } from "@/lib/track";

const HREF =
  "https://www.producthunt.com/products/make-it-rain-3?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-make-it-rain-3";
const SRC =
  "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1223338&theme=light&t=1786941723673";

/** Official Product Hunt featured badge. Sits under the hero, not in the chorus. */
export function ProductHuntBadge() {
  return (
    <div className="fade-up mt-5 flex justify-center sm:mt-6">
      <a
        href={HREF}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackUiClick("producthunt_badge_click")}
        className="inline-flex rounded-xl bg-white p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition hover:shadow-[0_0_0_1px_rgba(0,229,255,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Make it RAIN - Find who may pay before you automate a guess | Product Hunt"
          width={250}
          height={54}
          src={SRC}
        />
      </a>
    </div>
  );
}
