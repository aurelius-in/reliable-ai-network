import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackedLink } from "@/components/TrackedLink";
import { GUARANTEE } from "@/lib/guarantee";

export const metadata: Metadata = {
  title: "Guarantee terms",
  description: GUARANTEE.hook,
  alternates: { canonical: "/guarantee" },
};

export default function GuaranteePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
        <Logo />
        <TrackedLink
          href="/signup"
          trackTarget="guarantee_cta_signup"
          className="text-sm font-semibold text-aqua hover:text-aqua-bright"
        >
          {GUARANTEE.cta}
        </TrackedLink>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 text-left">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
          Guarantee terms
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
          {GUARANTEE.hook}
        </h1>
        <p className="mt-3 text-base font-semibold text-slate-200">
          {GUARANTEE.hookSecondary}
        </p>
        <p className="mt-4 text-sm text-slate-400">
          Short on the homepage. Specific here: two tracks ($0 / early path
          vs already earning), what “good faith” means, and what money back
          covers. The free brief does not include a subscription to refund.
          After the brief, a 30-day trial (card on file) puts this guarantee
          in force. Companies with existing revenue may request RAIN Select:
          name the constraint and the next move, or the $1,500 is returned.
        </p>

        <section className="mt-8 rounded-2xl border border-rain/40 bg-gradient-to-br from-rain/15 to-night-800 px-5 py-6">
          <h2 className="text-lg font-bold text-white">In plain English</h2>
          <p className="mt-2 text-sm text-slate-300">
            You get a{" "}
            <strong className="text-white">{GUARANTEE.baitName}</strong> for
            the product you already built: hard commercial answer, who is worth
            talking to this week (warm network first, public signals when
            useful), conversation prep you approve, and a Results log. Not 10
            guaranteed buyers. Not a generic template.
          </p>
          <p className="mt-3 text-sm text-slate-300">
            Over {GUARANTEE.windowDays} days, if you run the path in good faith
            and still do not leave with a clearer ranked set of conversations
            worth having plus messages worth sending, we refund Make it RAIN
            subscription fees you paid in the window. If you already had
            product revenue, you can claim under the 2× track instead.
          </p>
          <TrackedLink
            href="/signup"
            trackTarget="guarantee_body_signup"
            className="btn-primary mt-5 inline-flex !px-6 !py-3"
          >
            {GUARANTEE.cta}
          </TrackedLink>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">
            1. {GUARANTEE.baitName} (the path)
          </h2>
          <p className="text-slate-300">
            Built from your product URL and/or description (optional GitHub /
            docs). Includes at minimum:
          </p>
          <ul className="rain-list mt-2 space-y-2 text-slate-300">
            <li>
              Hard commercial answer: primary buyer, valuable pain, smallest
              paid offer, honesty if the wedge is unclear
            </li>
            <li>
              Who to approach next (warm contacts you name, plus public signals
              when they help)
            </li>
            <li>Conversation prep + approve-before-send outreach</li>
            <li>Evidence grades + kill criteria</li>
            <li>Results log for replies, objections, paid or lost</li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">
            2. Track A — $0 / early (path to a paid yes)
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            <li>
              For products with little or no recent product revenue (including
              $0 baseline).
            </li>
            <li>
              Success = after a good-faith path, you have a clearer ranked list
              of people/conversations worth having this week and outreach
              messages worth sending (your judgment + the plan artifacts in
              product).
            </li>
            <li>
              If you complete good faith and still reasonably conclude the plan
              did not give you that clarity, you qualify for money back on fees
              paid in the window.
            </li>
            <li>
              Getting from $0 to any real paid product customer also clears this
              track.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">
            3. Track B — already earning (2× revenue)
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            <li>
              Baseline = money your product received in the{" "}
              {GUARANTEE.baselineDays} days before your guarantee window starts
              (Stripe, App Store, invoices, or equivalent).
            </li>
            <li>Provide a simple export or screenshots if you claim.</li>
            <li>
              Success = product revenue in the {GUARANTEE.windowDays}-day window
              is at least <strong className="text-white">2×</strong> baseline.
            </li>
            <li>
              Pure friends-and-family gifts may be excluded if they are not real
              product sales.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">
            4. Good-faith path (required for either track)
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            <li>Account in good standing on a paid plan (or trial that converts).</li>
            <li>
              Generate the {GUARANTEE.baitName} / hard commercial answer for your
              product.
            </li>
            <li>Keep a real paid offer live someone could buy.</li>
            <li>
              Log at least {GUARANTEE.minConversationsLogged} real outreach
              conversations in Results (who, what you said, reply or no reply).
            </li>
            <li>
              Send at least {GUARANTEE.minOutreaches} outreach messages to real
              prospects during the window (or an agreed equivalent we confirm in
              writing). Warm network counts.
            </li>
            <li>
              Window starts when you mark path-start in-product or, if we agree
              in writing, on your trial start date.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">5. Money back</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            <li>
              Refund = Make it RAIN{" "}
              <strong className="text-white">subscription fees you paid</strong>{" "}
              during the guarantee window (Starter / Growth / Pro).
            </li>
            <li>
              If you paid <strong className="text-white">$0</strong> (free
              account only, never converted), there is no subscription to
              refund. The free {GUARANTEE.baitName} still stands as the bait.
            </li>
            <li>Not a cash prize above fees paid. Not ad spend. Not CAC.</li>
            <li>One claim per person / product / year.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">6. What this is not</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            <li>Not a promise of 10 buyers or ongoing profit.</li>
            <li>Not for fake products, empty outreach, or gamed baselines.</li>
            <li>
              We may decline abuse or change terms for new signups; your claim
              uses terms published when your window started.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">7. How to claim</h2>
          <p className="text-slate-300">
            Email{" "}
            <a
              href="mailto:support@makeitrainapp.com"
              className="text-aqua underline"
            >
              support@makeitrainapp.com
            </a>{" "}
            with subject “Guarantee claim,” account email, which track (A or B),
            Results outreach log, and for Track B baseline + day-
            {GUARANTEE.windowDays} revenue proof. We respond within several
            business days.
          </p>
          <p className="text-xs text-slate-500">
            Also see{" "}
            <Link href="/terms" className="underline hover:text-slate-300">
              Terms
            </Link>
            .
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
