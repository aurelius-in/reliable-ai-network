/**
 * Premium Library (Pro Tab 9) — Kennedy-style swipe files and
 * advanced templates. Placeholders in [BRACKETS] get filled in by the user.
 */

export interface PremiumTemplate {
  id: string;
  title: string;
  category: "Swipe file" | "Advanced template";
  description: string;
  filename: string;
  content: string;
}

export const PREMIUM_TEMPLATES: PremiumTemplate[] = [
  {
    id: "kennedy-sales-letter",
    title: "Direct-Response Sales Letter (Kennedy-style)",
    category: "Swipe file",
    description:
      "The classic long-form sales letter structure that has sold billions in info-products. Swipe the skeleton, fill in your product.",
    filename: "kennedy-sales-letter.md",
    content: `# The Direct-Response Sales Letter — Full Swipe

## Pre-head (top eyebrow line)
"Attention [AUDIENCE] who want [OUTCOME] without [PAIN]:"

## Headline
**"Who Else Wants [DREAM OUTCOME] In [TIMEFRAME] — Even If [BIGGEST OBJECTION]?"**

## Deck copy (2-3 lines under the headline)
If you've ever [PAINFUL MOMENT THEY KNOW WELL], this will be the most important
page you read this year. Here's why…

## 1. Lead with the problem (agitate)
Let's be honest about what's really going on:
- You [SPECIFIC STRUGGLE 1].
- You've tried [COMMON FIX] and it [WHY IT FAILED].
- Meanwhile, [ENVY TRIGGER — others getting the result].

It's not your fault. Nobody ever showed you [THE MISSING MECHANISM].

## 2. Introduce the mechanism
That's exactly why I built **[PRODUCT NAME]** — the only [CATEGORY] that
[UNIQUE MECHANISM IN ONE SENTENCE].

## 3. Proof stack
- [PROOF 1: result, number, or demo]
- [PROOF 2: testimonial]
- [PROOF 3: credential or origin story beat]

## 4. The offer (value stack)
Here's everything you get today:
| What you get | Why it matters | Value |
|---|---|---|
| [CORE] | [1 line] | $[X] |
| [BONUS 1] | [1 line] | $[X] |
| [BONUS 2] | [1 line] | $[X] |

**Total value: $[SUM]. Today: $[PRICE].**

## 5. Risk reversal
Try it for [X] days. If it doesn't [SPECIFIC RESULT], email me and I'll refund
every penny — and you keep [KEEPABLE BONUS].

## 6. Urgency (must be real)
[HONEST DEADLINE OR SCARCITY — price rises, bonus expires, cohort closes.]

## 7. The close
You have two options. Keep doing [STATUS QUO] and hope it changes. Or let
[PRODUCT NAME] do the heavy lifting starting today.

**[CTA BUTTON: "Yes — I want (OUTCOME)"]**

P.S. — Remember: [RESTATE OFFER + DEADLINE + GUARANTEE IN 2 LINES]. The P.S.
is the second-most-read part of any letter. Never skip it.
`,
  },
  {
    id: "price-raise-announcement",
    title: "Price-Raise Announcement Sequence",
    category: "Swipe file",
    description:
      "Three emails that turn a price increase into your biggest sales week. A legendary direct-response play.",
    filename: "price-raise-sequence.md",
    content: `# The Price-Raise Sequence — 3 Emails

The single easiest revenue spike in direct response: announce an honest price
increase, give a real deadline, and let urgency do the selling.

## Email 1 — The announcement (5 days out)
**Subject:** [PRODUCT NAME] price is going up on [DATE]

Straight to the point: on [DATE], [PRODUCT NAME] goes from $[OLD] to $[NEW].

Why? [HONEST REASON: more features, more demand, underpriced vs. value.]

Anyone who joins before [DATE] locks in $[OLD] — [forever / for 12 months].

**[CTA: Lock in the old price]**

## Email 2 — Proof + objection (2 days out)
**Subject:** 48 hours left at $[OLD]

Quick reminder — and a quick story.

[SHORT CASE STUDY: someone like them getting the result.]

The #1 question I've gotten: "[TOP OBJECTION]?" Answer: [2-LINE ANSWER].

Price goes to $[NEW] in 48 hours. **[CTA]**

## Email 3 — Last call (final day)
**Subject:** Final hours: $[OLD] ends tonight

No long email today. At midnight, [PRODUCT NAME] becomes $[NEW].

Join now and you lock in $[OLD]: **[LINK]**

After tonight this offer is gone. That's not marketing pressure — it's just
the calendar.

— [NAME]
`,
  },
  {
    id: "winback-letter",
    title: "Customer Win-Back Letter",
    category: "Swipe file",
    description:
      "Bring canceled customers back with the 'we miss you + reason why' letter. Typically converts 5-15% of a cold list.",
    filename: "winback-letter.md",
    content: `# The Win-Back Letter

**Subject:** Did I do something wrong?

Hey [FIRST NAME],

I noticed you left [PRODUCT NAME] a while back — and I wanted to check in
personally.

Since you've been gone, a lot has changed:
- [NEW THING 1]
- [NEW THING 2]
- [NEW THING 3]

Because you were one of our early users, I'd like to invite you back with
[SPECIFIC SWEETENER: 50% off first month back / a free bonus / extended trial].

This invite is only for past members and expires on [DATE].

**[CTA: Come back for (SWEETENER)]**

If [PRODUCT NAME] wasn't right for you, I'd genuinely love to know why — just
hit reply. I read every answer.

— [YOUR NAME], founder
`,
  },
  {
    id: "vsl-script",
    title: "60-Second VSL / Short-Form Ad Script",
    category: "Advanced template",
    description:
      "The hook–problem–mechanism–proof–CTA script for YouTube Shorts, Reels, and TikTok ads.",
    filename: "vsl-60s-script.md",
    content: `# 60-Second Video Sales Script

**[0-3s] HOOK (pattern interrupt — say it to camera)**
"[BOLD CLAIM OR QUESTION — e.g. 'Your app could be making you $500 a month.
Here's why it isn't.']"

**[3-12s] PROBLEM**
"You built [CATEGORY]. It works. But nobody's paying for it — because
building and selling are two totally different skills."

**[12-25s] MECHANISM**
"Here's what the pros do instead: [YOUR MECHANISM IN 1-2 LINES — the tripwire,
the offer stack, the one-idea-many-assets play]."

**[25-40s] PROOF / DEMO**
"[SHOW THE PRODUCT DOING THE THING. Narrate one concrete result or number.]"

**[40-52s] OFFER**
"[PRODUCT NAME] gives you [TOP 3 VALUE POINTS, rapid fire]. It's $[PRICE] —
less than [VALUE ANCHOR]."

**[52-60s] CTA + risk reversal**
"Try it free for 30 days — link below. If it doesn't [RESULT], cancel in one
click and pay nothing."
`,
  },
  {
    id: "launch-checklist",
    title: "7-Day Launch Checklist",
    category: "Advanced template",
    description:
      "A day-by-day countdown checklist from 'nothing live' to 'launched and selling' in one week.",
    filename: "7-day-launch-checklist.md",
    content: `# 7-Day Launch Checklist

## Day 1 — Lock the offer
- [ ] Run Idea Analyzer + Pricing Builder in RAIN
- [ ] Write your big promise at the top of a doc
- [ ] Pick ONE price. Done beats perfect.

## Day 2 — Build the page
- [ ] Publish a simple product page (Gumroad / Lemon Squeezy / Carrd)
- [ ] Paste in your generated sales copy
- [ ] Add one screenshot or 20-second demo video

## Day 3 — Set the funnel
- [ ] Create your tripwire (cheap first offer) from the Funnel Architect
- [ ] Link tripwire → core offer with one upsell email

## Day 4 — Make the content
- [ ] Generate 5 posts + 3 ad variations with the Content Generator
- [ ] Schedule them across the week

## Day 5 — Warm audience
- [ ] Tell friends / communities you're launching tomorrow
- [ ] Post a behind-the-scenes teaser

## Day 6 — LAUNCH
- [ ] Post everywhere at your audience's peak hour
- [ ] Reply to every single comment (this doubles reach)
- [ ] DM the 10 people most likely to buy

## Day 7 — Follow up
- [ ] Send the 'last chance' email to everyone who clicked but didn't buy
- [ ] Write down what worked; do more of it next week
`,
  },
];
