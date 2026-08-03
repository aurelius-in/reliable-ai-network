import type { PublicReview } from "@/lib/reviews";

/** Pad the public list until this many real reviews exist. */
export const MIN_PUBLIC_REVIEWS = 5;

/**
 * Placeholder reviews shown only while real reviews are under
 * MIN_PUBLIC_REVIEWS. They drop off as real ones are approved (and, for the
 * submitter, as their own pending reviews appear).
 */
export const SEED_REVIEWS: PublicReview[] = [
  {
    // 3 sentences · casual · buy reason (workflow + path) · brand: Make it rain
    id: "seed-mei-chen",
    authorName: "Mei Chen",
    companyName: "papercrane.ai",
    body: `It's making me pick buyers and a price before I waste another month polishing UI, so Make it rain is helping me not treat my pitch deck as my only go-to-market plan. I'm using it when I plan campaigns now instead of bouncing between random docs. Not getting rich in week two or anything, but it actually did what it claimed on clarifying who pays and what to charge.`,
    response: `Thanks, Mei. Glad it's replacing the pitch-deck-as-plan habit and fitting into how you plan campaigns. Clearer buyers and pricing is the win we want early on.`,
    createdAt: "2026-05-12T14:22:00.000Z",
  },
  {
    // 2 sentences · keep (user: perfect) · improvement
    id: "seed-diego-morales",
    authorName: "Diego Morales",
    companyName: "Casa Nueva",
    body: `Helped me stop undercharging, which was the main win for Casa Nueva. If I could change one thing, I'd want a clearer "do this on Tuesday" checklist after the strategy output so I don't stall again.`,
    response: `Appreciate the note, Diego. Pricing clarity is a big win. We hear you on the next-step checklist and are tightening that handoff after strategy.`,
    createdAt: "2026-05-28T09:05:00.000Z",
  },
  {
    // 4 sentences · 2 blank lines · keep user's favorite block · brand: Make It Rain
    id: "seed-helen-whitfield",
    authorName: "Helen Whitfield",
    companyName: "WHITFIELD",
    body: `Tried Make It Rain for a week while rebuilding our offer. Pricing and buyer work were stronger than the launch bits.

I'd love deeper competitor notes tied to a real niche, not just categories.

Still better than another Slack brainstorm with myself. I'll keep using it, but that competitor gap is what I'd fix first.`,
    response: `Helen, thank you for the precise feedback. Stronger niche-level competitor depth is on our list. Glad pricing and buyers landed.`,
    createdAt: "2026-06-09T18:40:00.000Z",
  },
  {
    // 2 sentences · first customers · brand: Make It Rain · not try-hard slang
    id: "seed-vikram-shah",
    authorName: "Vikram Shah",
    companyName: "loomroom",
    body: `Closing our first paying customers now... very cool... after working through the buyer and outreach pieces in Make It Rain. Getting some traction, baby! Just getting familiar with all the tools but this app was a good fit for our needs.`,
    response: `Congrats on the early customers, Vikram. Glad it’s a good fit. Keep exploring the rest of the tools as you go.`,
    createdAt: "2026-06-21T11:15:00.000Z",
  },
  {
    // 3 sentences · casual · specific tools · brand: Make it rain
    id: "seed-leslie-nasser",
    authorName: "Leslie Nasser",
    companyName: "Al Masar Studio",
    body: `I tried the commercial score and Find Your Buyers in Make it rain, then used Pricing Builder, and that combo really helped me figure out who we should sell to and what a defensible price looks like for our product. Having those outputs in one place (and a brief I could share with my partner) is what made it useful for us, not another pile of generic advice from an overpriced marketing firm, so we don't overcomplicate our offer and it's tighter now. Thanks!`,
    response: `Thank you, Leslie. Glad the score, buyers, and pricing work landed together. That shared brief is exactly what we want teams using.`,
    createdAt: "2026-07-03T16:50:00.000Z",
  },
];

/**
 * Real reviews first, then enough seeds to reach MIN_PUBLIC_REVIEWS.
 * `creditTowardMinimum` counts this viewer's pending previews so their
 * submission replaces a seed immediately.
 */
export function withSeedReviews(
  approved: PublicReview[],
  opts?: { creditTowardMinimum?: number }
): PublicReview[] {
  const credited =
    approved.length + Math.max(0, opts?.creditTowardMinimum ?? 0);
  const need = Math.max(0, MIN_PUBLIC_REVIEWS - credited);
  if (need === 0) return approved;
  return [...approved, ...SEED_REVIEWS.slice(0, need)];
}
