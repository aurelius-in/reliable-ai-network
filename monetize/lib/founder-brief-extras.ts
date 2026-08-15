/** Extra founder-brief sections beyond Analyzer + Stress Test. */

export type FounderBriefExtras = {
  executive_summary: string[];
  strengths: string[];
  risks: string[];
  who_to_include: string[];
  who_to_exclude: string[];
  substitutes: {
    name: string;
    why_they_use_it: string;
    how_you_beat_it: string;
  }[];
  stop_saying: string[];
  start_saying: string[];
  this_week: {
    step: string;
    action: string;
    success_signal: string;
  }[];
  pricing_hypothesis: {
    suggested: string;
    packaging: string;
    why: string;
  };
  one_page_pitch: string;
  /** What to ask for in the first conversation (call, reply, paid test). */
  conversation_ask?: string;
};

export const FOUNDER_BRIEF_EXTRAS_SYSTEM = `You write the operator addendum for a Make it RAIN Founder Brief.
Be specific to THIS product. Short sentences. No hype. No em dashes or en dashes. Use hyphens or periods.
Return ONLY JSON:
{
  "executive_summary": ["<4-6 bullets: what matters commercially>"],
  "strengths": ["<3-5 real strengths from evidence>"],
  "risks": ["<3-5 commercial risks>"],
  "who_to_include": ["<who to message / test first>"],
  "who_to_exclude": ["<who to skip for now>"],
  "substitutes": [
    { "name": "<free or paid substitute>", "why_they_use_it": "<why>", "how_you_beat_it": "<honest edge or admit parity>" }
  ],
  "stop_saying": ["<positioning lines to cut>"],
  "start_saying": ["<sharper lines to lead with>"],
  "this_week": [
    { "step": "<1-5>", "action": "<concrete>", "success_signal": "<observable>" }
  ],
  "pricing_hypothesis": {
    "suggested": "<e.g. $4.99/mo or $29/yr>",
    "packaging": "<what is free vs paid>",
    "why": "<one paragraph>"
  },
  "one_page_pitch": "<8-12 sentence pitch a founder can send a mentor or advisor>",
  "conversation_ask": "<one concrete ask for the first conversation: a reply, a 15-min call, or a paid test. Not a guaranteed sale.>"
}
Exactly 5 this_week steps. 3-5 substitutes. Honest about free alternatives. conversation_ask must be specific to THIS buyer.
`;
