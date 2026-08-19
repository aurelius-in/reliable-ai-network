import { CheckoutButton } from "@/components/CheckoutButton";
import { TrackedLink } from "@/components/TrackedLink";
import {
  PRO_REVIEW_PREVIEW,
  PRO_REVIEW_SAMPLE_HREF,
  PUBLIC_EXAMPLES_WHY,
  STANDARD_BRIEF_PREVIEW,
  STANDARD_FOUNDER_BRIEF_SAMPLE,
} from "@/lib/public-example-briefs";

const STANDARD_INCLUDES = [
  "Who may pay first",
  "Smallest paid offer + price to test",
  "Buyer Stress Test: would a skeptical buyer pay?",
  "What's still unproven, and when to stop",
  "Next conversation + this-week moves",
];

const PRO_INCLUDES = [
  "Product + market surface analysis",
  "Who pays, who uses it, and how often that job happens",
  "What's supported vs. still a guess",
  "Risks, failure modes + must-have test",
  "Prioritized recommendations + what to test next",
];

function RedactionBar({ className = "w-[4.75rem]" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-2.5 translate-y-[-1px] rounded-[1px] bg-stone-900 ${className}`}
      aria-hidden
    />
  );
}

function StandardBriefPreview() {
  const p = STANDARD_BRIEF_PREVIEW;

  return (
    <div
      className="overflow-hidden rounded-lg border border-stone-300 bg-[#f4f2ee] px-3 py-3 text-left text-stone-800"
      aria-hidden
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        {p.kicker}
      </p>
      <p className="mt-1 font-serif text-sm font-semibold tracking-tight text-stone-900">
        {p.title}
      </p>
      <p className="text-[10px] text-stone-500">{p.subtitle}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded border border-stone-200 bg-white px-2 py-1.5">
          <p className="text-[8px] font-semibold uppercase tracking-wider text-stone-500">
            {p.stressLabel}
          </p>
          <p className="font-serif text-sm capitalize text-stone-900">
            {p.stressVerdict}
          </p>
        </div>
        <div className="rounded border border-stone-200 bg-white px-2 py-1.5">
          <p className="text-[8px] font-semibold uppercase tracking-wider text-stone-500">
            {p.whoMayPayLabel}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-stone-800">
            {p.whoMayPay}
          </p>
        </div>
      </div>
      <p className="mt-2.5 border-t border-stone-200 pt-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-stone-500">
        {p.bstLabel}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-stone-800">
        {p.bstExcerpt}
      </p>
      <p className="mt-2.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-stone-500">
        {p.nextLabel}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-stone-800">
        {p.nextExcerpt}
      </p>
      <p className="mt-2.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-stone-500">
        {p.rewriteLabel}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-stone-800">
        {p.rewriteExcerpt}
      </p>
    </div>
  );
}

function ProReviewPreview() {
  const p = PRO_REVIEW_PREVIEW;

  return (
    <div
      className="overflow-hidden rounded-lg border border-stone-300 bg-[#f4f2ee] px-3 py-3 text-left text-stone-800"
      aria-hidden
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500">
        {p.kicker}
      </p>
      <p className="mt-1 font-serif text-sm font-semibold tracking-tight text-stone-900">
        {p.title}
      </p>
      <p className="mt-1 text-[10px] text-stone-500">{p.prepared}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
        {p.preparedForLabel} <RedactionBar />
      </p>
      <p className="mt-2.5 border-t border-stone-200 pt-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-stone-500">
        {p.verdictLabel}
      </p>
      <p className="mt-1 font-serif text-[12px] font-semibold leading-snug text-stone-900">
        {p.verdict}
      </p>
      <p className="mt-2.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-stone-500">
        {p.ladderLabel}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-stone-800">
        <span className="font-semibold uppercase tracking-wide text-stone-600">
          {p.observedLabel}.
        </span>{" "}
        {p.observed}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-stone-800">
        <span className="font-semibold uppercase tracking-wide text-stone-600">
          {p.inferenceLabel}.
        </span>{" "}
        {p.inference}
      </p>
      <p className="mt-2.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-stone-500">
        {p.recLabel}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-stone-800">{p.rec}</p>
    </div>
  );
}

/** Homepage comparison: Standard Founder Brief vs Pro Review. */
export function PublicExampleBriefs({
  id = "examples",
}: {
  id?: string;
}) {
  const standard = STANDARD_FOUNDER_BRIEF_SAMPLE;

  return (
    <section
      id={id}
      className="fade-up mt-8 w-full max-w-4xl scroll-mt-24 text-left sm:mt-10"
    >
      <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
        Real output
      </p>
      <h2 className="mt-1.5 text-center text-lg font-bold text-white sm:mt-2 sm:text-2xl">
        {PUBLIC_EXAMPLES_WHY.headline}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-slate-300">
        {PUBLIC_EXAMPLES_WHY.how}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 md:items-stretch md:gap-5">
        <article className="flex flex-col rounded-2xl border border-white/10 bg-night-800/70 p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-aqua">
            First Customer Path · Free
          </p>
          <h3 className="mt-2 text-lg font-bold text-white">
            Standard Founder Brief
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {standard.category}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            A focused commercial brief that identifies who may pay, the paid
            wedge to test, what remains unproven, and the next conversation
            worth having.
          </p>

          <div className="mt-4">
            <StandardBriefPreview />
          </div>

          <ul className="rain-list mt-4 flex-1 space-y-1.5 text-sm text-slate-200">
            {STANDARD_INCLUDES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            See what is supported by evidence and what is still an assumption.
          </p>
          <TrackedLink
            href={standard.href}
            trackTarget="standard_brief_sample_open"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open standard Founder Brief sample (Pet health / records SaaS)"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-aqua/40 bg-aqua/10 px-4 py-2.5 text-sm font-semibold text-aqua-bright transition hover:border-aqua/70 hover:bg-aqua/15"
          >
            Open standard brief
          </TrackedLink>
        </article>

        <article className="glow-card relative flex flex-col rounded-2xl border border-rain/45 bg-gradient-to-b from-rain/10 via-night-800/95 to-night-800 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rain-bright">
              Make it RAIN Pro Review
            </p>
            <span className="rounded-full border border-rain/40 bg-rain/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              Available with Pro
            </span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-white">
            Deeper evidence, buyer, and validation work
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Developer infrastructure product · names redacted
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            A deeper review for products where the commercial decision needs
            more than a first path. It looks at who may pay, what buyers
            actually did or said, what could fail, positioning, and what to
            test next.
          </p>

          <div className="mt-4">
            <ProReviewPreview />
          </div>

          <ul className="rain-list mt-4 flex-1 space-y-1.5 text-sm text-slate-200">
            {PRO_INCLUDES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            This redacted example is a 13-page Pro Review.
          </p>
          <TrackedLink
            href={PRO_REVIEW_SAMPLE_HREF}
            trackTarget="pro_review_sample_open"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Make it RAIN Pro Review sample PDF (names redacted)"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-rain to-rain-bright px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rain/25 transition hover:brightness-110"
          >
            Open Pro Review
          </TrackedLink>
        </article>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-night-800/60 px-4 py-4 sm:px-5">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-6">
          <p className="text-sm text-slate-200">
            <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-aqua">
              Free
            </span>
            <span className="mt-1 block font-semibold text-white">
              Find the first commercial path.
            </span>
          </p>
          <p className="text-sm text-slate-200">
            <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-rain-bright">
              Pro
            </span>
            <span className="mt-1 block font-semibold text-white">
              Interrogate the path before you invest harder.
            </span>
          </p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          The Founder Brief gets you to who may pay, a paid offer, what is still
          unproven, and the next move. Pro goes deeper when the decision needs
          a closer look at risk and a sharper plan for what to test next.
        </p>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <div className="w-full max-w-md">
          <CheckoutButton
            tier="pro"
            authenticated={false}
            trackTarget="pro_review_try_pro_click"
            label="Try Pro free for 30 days"
          />
        </div>
        <p className="mt-2 max-w-md text-center text-xs leading-relaxed text-slate-500">
          Full Pro toolset plus deeper guidance. Cancel before day 30 to avoid
          being charged.
        </p>
      </div>
    </section>
  );
}
