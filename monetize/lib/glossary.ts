/**
 * Plain-language glossary for first-time app makers.
 * Each blurb should explain what the term means, why it matters,
 * and why it shows up at this step — without labeled headings.
 */

export type GlossaryEntry = {
  /** Display label in the popout title */
  term: string;
  /** Match phrases (lowercase). Longer aliases matched first. */
  aliases: string[];
  /** 2–4 short sentences. No section headings. */
  blurb: string;
  /**
   * When true, ExplainableText may auto-wrap this phrase in AI/body copy.
   * Keep false for everyday English words (stage, confidence, etc.).
   */
  autoLink?: boolean;
};

export const GLOSSARY: Record<string, GlossaryEntry> = {
  icp: {
    term: "ICP (ideal customer)",
    aliases: ["ideal customer profile", "icp"],
    autoLink: true,
    blurb:
      "The specific kind of person most likely to buy — not “everyone.” Naming them early keeps your messaging, pricing, and outreach aimed at people who actually feel the pain, instead of guessing and burning time on strangers who will never pay.",
  },
  product_brief: {
    term: "Product brief",
    aliases: ["product brief"],
    blurb:
      "A short, honest write-up of what you sell, who it’s for, and why they’d pay. Tools here read that brief like a coworker would. The clearer it is, the less generic (and more useful) every recommendation gets — so you don’t spend weeks chasing advice that doesn’t fit a weekend-built app.",
  },
  stage: {
    term: "Stage",
    aliases: ["stage"],
    blurb:
      "How far along you really are: idea, building, beta, launched, or already earning. Stage changes what “smart next move” means. A pricing tip for someone with paying customers can waste money if you’re still validating whether anyone wants it.",
  },
  traction: {
    term: "Traction",
    aliases: ["traction"],
    autoLink: true,
    blurb:
      "Proof people care — waitlist signups, pilot users, downloads, or dollars. Even tiny numbers beat vibes. Putting traction in your brief stops the tools from overselling a path you haven’t earned yet, and points you at tests that fit a small budget and little free time.",
  },
  monetization: {
    term: "Monetization",
    aliases: ["monetization", "monetize"],
    autoLink: true,
    blurb:
      "Turning interest into money on purpose — a price, an offer, and a path to pay — not hoping ads or downloads magically pay rent. This step exists so you pick a realistic way to earn before you spend months polishing features nobody will buy.",
  },
  commercial_score: {
    term: "Commercial score",
    aliases: ["commercial score", "monetization score"],
    blurb:
      "A directional grade of how sellable this looks from the evidence you gave — not a crystal ball and not a bank’s credit score. Use it to decide whether to push harder, gather proof, or simplify. It’s here early so you don’t sink weeks into the wrong path.",
  },
  confidence: {
    term: "Confidence",
    aliases: ["confidence"],
    blurb:
      "How much the advice is standing on real evidence versus guesses. Low confidence isn’t an insult — it means “don’t bet the farm yet.” It shows up so you know when to talk to buyers before you spend money on ads or another rebuild.",
  },
  assumptions: {
    term: "Assumptions",
    aliases: ["assumptions"],
    blurb:
      "Beliefs the plan depends on that you haven’t proven yet (who buys, what they’ll pay, whether the problem hurts enough). Listing them keeps you from treating a hunch like a fact. At this step they tell you what to check this week instead of studying marketing theory for months.",
  },
  kill_criteria: {
    term: "Kill criteria",
    aliases: ["kill criteria", "kill criterion"],
    autoLink: true,
    blurb:
      "Clear “stop or pivot” signals — for example, ten honest chats and zero interest. They protect your time and cash when the app was built fast and you can’t afford a long sunk-cost trap. Set them before you get emotionally attached to the build.",
  },
  commercial_answer: {
    term: "Hard commercial answer",
    aliases: [
      "hard commercial answer",
      "commercial answer",
      "commercial wedge",
    ],
    autoLink: true,
    blurb:
      "The forced outcome of the playbook: one primary buyer, one pain valuable enough to pay for, one smallest paid offer, and evidence for whether to push or stop — including an honest “wedge still unclear” when positioning is still too broad. More valuable than a polished maybe.",
  },
  demand_discovery: {
    term: "Daily Market Research",
    aliases: [
      "demand discovery",
      "demand radar",
      "daily market research",
      "live demand",
      "demand scan",
    ],
    autoLink: true,
    blurb:
      "One run that searches 25+ public communities for buyer conversations (pain, purchase intent, competitor frustration), ranks why each signal matters, and drafts outreach you approve. Not a guarantee someone buys.",
  },
  big_promise: {
    term: "Big promise",
    aliases: ["big promise", "grand slam offer"],
    autoLink: true,
    blurb:
      "The one outcome you promise buyers in plain language — the sentence that makes the offer feel worth paying for. Without it, pages and ads sound vague. You need it here so every later step (pricing, funnel, content) repeats the same sharp claim instead of reinventing the pitch.",
  },
  validation_plan: {
    term: "Validation plan",
    aliases: ["validation plan"],
    autoLink: true,
    blurb:
      "A short list of cheap tests that prove (or kill) the idea with real people — messages, calls, a simple checkout — not more coding. It’s the antidote to “I’ll market it after I finish the app.” Do this before you buy ads you can’t afford.",
  },
  quick_wins: {
    term: "Quick wins",
    aliases: ["quick wins"],
    blurb:
      "Actions you can finish this week that move money or learning forward. They’re sized for busy builders who shipped with AI in a few days — progress without a marketing degree or a three-month course.",
  },
  willingness_to_pay: {
    term: "Willingness to pay",
    aliases: ["willingness to pay", "willingness-to-pay"],
    autoLink: true,
    blurb:
      "What someone will actually hand over money for this outcome — not what you wish, and not what it cost you to build. Guessing low leaves you broke; guessing high with no proof stalls sales. This step grounds the price in buyer reality before you print a sales page.",
  },
  pricing_economics: {
    term: "Pricing economics",
    aliases: ["pricing economics"],
    blurb:
      "How the price, package, and buyer budget fit together so the business can actually work — not just a number that “feels fair.” First-time builders often undercharge or freeze. This step gives a defendable range you can test without a consultant.",
  },
  packaging: {
    term: "Packaging",
    aliases: ["packaging tradeoffs", "packaging"],
    blurb:
      "How you wrap the product for sale: one price, monthly plan, free + paid, seats, usage, and so on. The wrap changes who buys and how painful checkout feels. Sorting it now avoids rebuilding your whole offer after you’ve already confused early users.",
  },
  freemium: {
    term: "Freemium",
    aliases: ["freemium"],
    autoLink: true,
    blurb:
      "A free tier plus a paid upgrade. It can grow users fast, but free users aren’t customers — and support still costs time. Worth considering only if free usage clearly pushes people toward a paid plan you can afford to run.",
  },
  subscription: {
    term: "Subscription",
    aliases: ["subscription", "subscriptions"],
    blurb:
      "Buyers pay on a schedule (usually monthly) for ongoing access. Great when the product keeps helping every week; awkward if they only need it once. Choosing this early shapes your product roadmap and how much “polish” you need before charging.",
  },
  one_time: {
    term: "One-time purchase",
    aliases: ["one-time purchase", "one-time"],
    autoLink: true,
    blurb:
      "Pay once, own (or keep) access. Simpler to sell when trust is low and you don’t have recurring value yet. Tradeoff: you must keep finding new buyers. Useful for templates, tools, or first offers before you ask for a monthly commitment.",
  },
  value_anchor: {
    term: "Value anchor",
    aliases: ["value anchors", "value anchor"],
    autoLink: true,
    blurb:
      "A comparison that makes your price feel small next to the cost of the problem (freelancer hours, a wasted tool, a bad hire). Anchors help first-time sellers defend a price without sounding pushy — especially when you can’t outspend bigger brands on ads.",
  },
  pricing_experiment: {
    term: "Pricing experiment",
    aliases: ["pricing experiment"],
    blurb:
      "One small, timed price or package test with a clear success signal. Experiments beat endless second-guessing. At this step you get a next move you can run in days, not a pricing PhD.",
  },
  sweet_spot: {
    term: "Sweet spot",
    aliases: ["sweet spot"],
    blurb:
      "The recommended starting price inside a wider range — high enough to respect the value, low enough that a cold buyer might still try. It’s a launch pad to test, not a forever law carved in stone.",
  },
  sales_copy: {
    term: "Sales copy",
    aliases: ["sales copy"],
    autoLink: true,
    blurb:
      "The words on your page or pitch that turn interest into a yes — headline, benefits, and call to action. Most first apps fail at wording, not code. You get a draft here so you’re not staring at a blank page after you finally decide to sell.",
  },
  cta: {
    term: "CTA (call to action)",
    aliases: ["call to action", "cta"],
    autoLink: true,
    blurb:
      "The clear next step you ask for: Buy, Start trial, Book a call. Vague buttons (“Learn more”) leak momentum. Every offer needs one obvious ask so busy visitors aren’t left guessing.",
  },
  funnel: {
    term: "Funnel",
    aliases: ["sales funnel", "funnel"],
    blurb:
      "The path from stranger → interested → buyer, usually a few pages or offers in a row. Without a path, traffic dies on a homepage. Building a simple funnel matters more than fancy ads when your budget is tiny.",
  },
  tripwire: {
    term: "Tripwire",
    aliases: ["tripwire"],
    autoLink: true,
    blurb:
      "A cheap first purchase that turns a browser into a buyer. People who have paid you once are far more likely to buy the real product. It’s a low-risk on-ramp when you can’t afford big ad tests or long trust-building campaigns.",
  },
  core_offer: {
    term: "Core offer",
    aliases: ["core offer"],
    autoLink: true,
    blurb:
      "Your main paid product — the thing that should make most of the money. Everything else (freebies, cheap intros, upsells) should point here. Naming it keeps you from discounting the real product into oblivion.",
  },
  profit_maximizer: {
    term: "Profit maximizer",
    aliases: ["profit maximizer", "upsell"],
    autoLink: true,
    blurb:
      "An extra offer for people who already said yes — an upgrade, bundle, or done-with-you add-on. It raises revenue without needing brand-new traffic. Useful when ads are expensive and each buyer has to count.",
  },
  conversion: {
    term: "Conversion",
    aliases: ["conversion rate", "conversion"],
    autoLink: true,
    blurb:
      "The share of people who take the action you want (signup, purchase). Tracking it tells you whether the page or the traffic is the problem. You need that signal before you pour money into more visitors.",
  },
  mrr: {
    term: "MRR",
    aliases: ["monthly recurring revenue", "mrr"],
    autoLink: true,
    blurb:
      "Monthly recurring revenue — predictable subscription dollars each month. Even a small MRR number beats vanity downloads when you’re deciding whether the app is becoming a business.",
  },
  saas: {
    term: "SaaS",
    aliases: ["saas"],
    autoLink: true,
    blurb:
      "Software as a service — usually an app people pay to use online on a subscription. Knowing the category helps pricing and packaging; SaaS buyers expect ongoing value, not a one-and-done file.",
  },
  b2b: {
    term: "B2B",
    aliases: ["b2b"],
    autoLink: true,
    blurb:
      "Business-to-business — you sell to companies or teams, not individual consumers. Sales cycles and prices differ. Labeling this early steers buyer research and pricing toward who can actually approve a purchase.",
  },
  design_partner: {
    term: "Design partner",
    aliases: ["design partners", "design partner"],
    autoLink: true,
    blurb:
      "An early user who helps shape the product in exchange for access (sometimes discounted). They’re a shortcut to real feedback when you don’t have a marketing budget — better than building alone for months.",
  },
  pilot: {
    term: "Paid pilot",
    aliases: ["paid pilot", "paid pilots"],
    autoLink: true,
    blurb:
      "A short, paid trial with a real customer before a full launch. Money (even small) is stronger proof than compliments. Pilots are ideal when the product is rough and you need signal fast.",
  },
  waitlist: {
    term: "Waitlist",
    aliases: ["waitlist"],
    autoLink: true,
    blurb:
      "A list of people who want early access. It’s cheap demand evidence: if nobody joins, fix the promise before you polish features. Useful when the app isn’t ready to charge yet but you still need proof.",
  },
  gtm: {
    term: "Go-to-market",
    aliases: ["go-to-market", "gtm"],
    autoLink: true,
    blurb:
      "Your plan for reaching buyers and making the first sales — channels, message, and offer — not just shipping code. First-time builders often skip this and then wonder why a finished app is silent.",
  },
  distribution: {
    term: "Distribution",
    aliases: ["distribution"],
    blurb:
      "How people discover you: communities, search, partnerships, outbound, ads. A great product with no distribution stays free forever. Naming your real channels keeps advice realistic for a no-budget launch.",
  },
  persona: {
    term: "Buyer persona",
    aliases: ["buyer persona", "buyer personas"],
    autoLink: true,
    blurb:
      "A vivid sketch of one buyer type — their situation, pains, and where they hang out online. It’s a focusing tool so outreach isn’t spray-and-pray. You need it before writing ads or DMs you’ll regret.",
  },
  positioning: {
    term: "Positioning",
    aliases: ["positioning"],
    autoLink: true,
    blurb:
      "How you want to be remembered versus alternatives — “for X who need Y without Z.” Clear positioning makes cheap marketing work harder. Fuzzy positioning makes every post and ad sound like everyone else.",
  },
  objection: {
    term: "Objection",
    aliases: ["objections", "objection"],
    blurb:
      "The reason someone hesitates (“too expensive,” “I can DIY,” “not sure it works”). Writing answers in advance turns awkward sales chats into short yes/no conversations — critical when you can’t buy trust with a big brand budget.",
  },
  risk_reversal: {
    term: "Risk reversal",
    aliases: ["risk reversal"],
    autoLink: true,
    blurb:
      "Something that lowers the buyer’s fear — refund, trial, or clear cancel. Strangers won’t wire money to an unknown indie app easily. A fair guarantee often raises sales more than another feature.",
  },
  a_b_test: {
    term: "A/B test",
    aliases: ["a/b tests", "a/b test", "ab test"],
    autoLink: true,
    blurb:
      "Trying two versions (headline A vs B) and keeping the winner based on real clicks or sales. Beats arguing in your head. Start tiny — you don’t need a data science team to learn which sentence sells.",
  },
  north_star: {
    term: "North star",
    aliases: ["north star"],
    autoLink: true,
    blurb:
      "The one outcome the next stretch of work is aimed at (first 10 sales, first $500 month). It stops random feature building. Pick it so a few free hours a week still move the business, not just the repo.",
  },
  roadmap: {
    term: "Roadmap",
    aliases: ["roadmap"],
    blurb:
      "A simple sequence of goals over the next 30/60/90 days. Not a corporate binder — a calendar of what matters next. It keeps AI-sped builds from turning into endless tinkering with no sales.",
  },
  bottleneck: {
    term: "Bottleneck",
    aliases: ["bottleneck"],
    autoLink: true,
    blurb:
      "The step in your path where the most people (or money) get stuck — traffic, signup, or checkout. Fixing the bottleneck beats improving everything a little. That’s how small budgets still make progress.",
  },
  monetization_brief: {
    term: "Monetization Brief",
    aliases: ["monetization brief"],
    blurb:
      "A shareable memo of your commercial plan — score, paths, pricing logic — so you can align with a cofounder or advisor without rebuilding the story from chat history. Export it when you’re ready to act, not after months of note-taking.",
  },
};

/** Stable id → entry */
export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return GLOSSARY[id];
}

/** Sorted aliases for scanning text (longest first). Auto-link entries only. */
let _aliasIndex: { alias: string; id: string }[] | null = null;

export function glossaryAliasIndex(): { alias: string; id: string }[] {
  if (_aliasIndex) return _aliasIndex;
  const rows: { alias: string; id: string }[] = [];
  for (const [id, entry] of Object.entries(GLOSSARY)) {
    if (!entry.autoLink) continue;
    for (const alias of entry.aliases) {
      rows.push({ alias: alias.toLowerCase(), id });
    }
  }
  rows.sort((a, b) => b.alias.length - a.alias.length);
  _aliasIndex = rows;
  return rows;
}
