/**
 * Quick-Start Library (Starter Tab 3) — static, downloadable templates.
 * Placeholders in [BRACKETS] are meant to be filled in by the user.
 */

export interface QuickStartTemplate {
  id: string;
  title: string;
  description: string;
  filename: string;
  content: string;
}

export const QUICK_START_TEMPLATES: QuickStartTemplate[] = [
  {
    id: "gumroad-description",
    title: "Gumroad Product Description",
    description:
      "A high-converting product page description built on the Grand Slam Offer structure. Fill in the brackets and publish.",
    filename: "gumroad-product-description.md",
    content: `# [PRODUCT NAME] — [BIG PROMISE IN ONE LINE]

**Stop [PAINFUL PROBLEM]. Start [DESIRED OUTCOME] — in [TIMEFRAME].**

## What you get

- ✅ [CORE DELIVERABLE] — [why it matters in one sentence]
- ✅ [BONUS 1] (worth $[X])
- ✅ [BONUS 2] (worth $[X])
- ✅ Free updates forever

## Who this is for

You built / need [CATEGORY] and you want [OUTCOME] without [THING THEY HATE].

## Why it works

[1-2 sentences of proof: your results, user results, or the mechanism that makes it work.]

## Guarantee

If [PRODUCT NAME] doesn't [SPECIFIC RESULT] within [X days], reply to your receipt email and get 100% of your money back. No forms. No hoops.

---

**Price: $[PRICE]** — less than [VALUE ANCHOR, e.g. "one takeout dinner"], for [OUTCOME THAT LASTS].

👉 Click "I want this" and get instant access.
`,
  },
  {
    id: "welcome-email-sequence",
    title: "Welcome Email Sequence (5 emails)",
    description:
      "A 5-email onboarding sequence that turns new signups into engaged, paying fans. Swipe, personalize, schedule.",
    filename: "welcome-email-sequence.md",
    content: `# Welcome Email Sequence — 5 Emails

## Email 1 — Instant welcome (send immediately)
**Subject:** You're in — here's your first quick win

Hey [FIRST NAME],

Welcome to [PRODUCT NAME]. You joined because you want [OUTCOME] — so let's get you a win right now.

**Do this today (takes 5 minutes):** [SMALLEST HIGH-IMPACT ACTION]

That one step puts you ahead of most people who [CATEGORY]. Tomorrow I'll show you [TEASE EMAIL 2].

— [YOUR NAME]

## Email 2 — The mistake (send day 2)
**Subject:** The #1 mistake [AUDIENCE] make

Most [AUDIENCE] fail at [GOAL] because they [COMMON MISTAKE].

Here's what to do instead: [YOUR APPROACH IN 2-3 SENTENCES].

Inside [PRODUCT NAME], the [FEATURE] does this for you. Try it here: [LINK]

## Email 3 — Proof (send day 4)
**Subject:** How [NAME/PERSONA] got [RESULT]

[SHORT CASE STUDY OR STORY — before, what they did, after. 4-6 sentences.]

The exact steps they used are waiting in your dashboard: [LINK]

## Email 4 — Objection crusher (send day 6)
**Subject:** "But what if [BIGGEST OBJECTION]?"

I hear this a lot: [OBJECTION].

Truth: [REFRAME + EVIDENCE].

That's exactly why [PRODUCT NAME] includes [FEATURE THAT SOLVES IT].

## Email 5 — The ask (send day 8)
**Subject:** Ready for the full system?

You've seen [RECAP OF VALUE SO FAR]. The next level is [PAID OFFER / UPGRADE]:

- [BENEFIT 1]
- [BENEFIT 2]
- [BENEFIT 3]

**[CTA BUTTON TEXT] → [LINK]**

Cancel anytime. Keep everything you've built.
`,
  },
  {
    id: "landing-page-outline",
    title: "Landing Page Outline",
    description:
      "A section-by-section blueprint for a landing page that converts cold traffic into trials and sales.",
    filename: "landing-page-outline.md",
    content: `# Landing Page Outline — High-Converting Structure

## 1. Hero (above the fold)
- **Headline:** [BIG PROMISE — outcome + timeframe + without pain]
- **Subheadline:** [Who it's for + the mechanism that makes it believable]
- **Primary CTA button:** [ACTION-ORIENTED TEXT, e.g. "Start free — get my plan"]
- **Trust line under CTA:** "Cancel anytime. No hidden fees."
- Visual: product screenshot or 20-second demo

## 2. Pain agitation
3 short bullets naming the exact frustrations your audience feels:
- "[PAIN 1 in their words]"
- "[PAIN 2 in their words]"
- "[PAIN 3 in their words]"

## 3. The mechanism (why this works)
One short paragraph: what's different about your approach. Name it if you can ("The [NAME] Method").

## 4. What you get (value stack)
| Item | What it does | Value |
|---|---|---|
| [CORE] | [1 line] | $[X] |
| [BONUS 1] | [1 line] | $[X] |
| [BONUS 2] | [1 line] | $[X] |

**Total value: $[SUM] — yours for $[PRICE]**

## 5. Social proof
2-3 testimonials with names/photos, or early numbers ("Join [N]+ creators").

## 6. Risk reversal
The guarantee, stated plainly: "[SPECIFIC RESULT] in [X days] or your money back."

## 7. FAQ (handle the top 4 objections)
1. [OBJECTION 1]? — [ANSWER]
2. [OBJECTION 2]? — [ANSWER]
3. [OBJECTION 3]? — [ANSWER]
4. [OBJECTION 4]? — [ANSWER]

## 8. Final CTA
Repeat the headline promise + CTA button. Add urgency only if it's real.
`,
  },
];
