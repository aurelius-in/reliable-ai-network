# Make it RAIN — Architecture & Tool Reference

**Product:** Make it RAIN (RAIN Monetize)  
**Live:** https://makeitrainapp.com  
**Code:** `reliable-ai-network/monetize` (this repo)  
**Notes / RAIN-wide index:** `RAIN/docs/make-it-rain-architecture.md`

This document is the technical source of truth for how the app is built and what each of the **15 journey tools** does, consumes, and produces.

---

## 1. System overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Marketing site (/) · Pricing · Auth · Checkout · Billing       │
└────────────────────────────┬────────────────────────────────────┘
                             │ session (Supabase Auth)
┌────────────────────────────┴────────────────────────────────────┐
│  Dashboard — 15-tool pie journey (DashboardTabs + *Tab.tsx)     │
│  Shared product brief → every tool via resolveCreation()        │
└───┬──────────────┬──────────────┬──────────────┬────────────────┘
    │              │              │              │
┌───┴───┐    ┌─────┴─────┐  ┌────┴────┐   ┌────┴────┐
│ Grok  │    │  Apollo   │  │ Stripe  │   │ Resend  │
│ (xAI) │    │ leads/    │  │ billing │   │ email   │
│ JSON  │    │ companies │  │         │   │         │
└───────┘    └───────────┘  └─────────┘   └─────────┘
                             │
                    ┌────────┴────────┐
                    │ Supabase Postgres│
                    │ + RLS            │
                    └─────────────────┘
```

### Stack

| Layer | Choice |
|-------|--------|
| App | Next.js 15 App Router, TypeScript, Tailwind 4 |
| Auth / DB | Supabase Auth + Postgres + RLS |
| Billing | Stripe Checkout, portal, webhooks; 30-day Pro trial |
| LLM | Grok (xAI) via OpenAI-compatible chat + structured JSON (`lib/grok.ts`) |
| Enrichment | Apollo.io (people leads, company firmographics) |
| Email | Resend (`lib/email.ts`) |
| Hosting | Vercel (`reliableainetwork/rain-monetize`) |

### Tiers (tool counts)

| Tier | Price | Tools unlocked |
|------|-------|----------------|
| Starter | $29/mo | 4 — Analyzer, Buyers, Pricing, Library |
| Growth | $79/mo | 9 — + Funnel, Traffic, Launch, Content, Progress |
| Pro | $149/mo | 15 — + Strategy, Sales, Results, Revenue, DFY, Premium |

Journey order and labels: `lib/journey.ts`. Tier gating: `lib/tiers.ts` + `requireTier()` in API routes.

---

## 2. Shared product context (the spine)

Every AI tool resolves a **creation** (product brief) before calling Grok.

**Resolver:** `lib/tool-request.ts` → `resolveCreation()`  
**Prompt block:** `lib/product-context.ts` → `formatProductContextBlock()`  
**Select columns:** `CREATION_CONTEXT_SELECT`

### Creation fields (expert intake)

| Field | Purpose |
|-------|---------|
| `title`, `description`, `type` | Core product narrative |
| `stage` | idea / building / beta / launched / revenue |
| `traction` | Founder-reported metrics |
| `current_price` | Packaging today |
| `competitors_notes` | Named alternatives (parsed for Apollo) |
| `evidence_docs` | Up to 5 text/PDF excerpts (JSONB) |
| `github_repo_url` + `github_context` | Public repo metadata + README |
| `product_url` + `website_context` | Marketing URL scrape (+ Jina fallback) |

**UI:** `DescribeProductForm` (create) + `EditEvidencePanel` (update on Analyzer).  
**APIs:** `POST/PATCH /api/creations`, `POST /api/creations/evidence`, `POST /api/creations/github`.  
**SQL:** `supabase/schema.sql`, `creations_expert.sql`, `creations_website.sql`.

### Evidence grades (Analyzer)

Claims are labeled:

- **observed** — URL scrape, GitHub, uploaded docs, Apollo firmographics  
- **founder_reported** — description, traction, checklist “yes”  
- **assumed** — model inference without direct evidence  

Checklist (localStorage → Analyzer body): `lib/evidence-quality.ts`.

### Cross-tool data flow

```
DescribeProductForm / EditEvidence
        │
        ▼
   creations row ──────────────────────────────┐
        │                                      │
        ▼                                      ▼
 Analyzer ──► buyers, pricing, library fill, content seed
        │
 Buyers ────► Funnel/Traffic/Sales defaults, Library fill
 Pricing ───► Library/Premium fill, First-dollar cards
 Revenue / Funnel ──► Progress First-dollar path
 Assets (generated_assets) ──► pie completion, Progress stats
```

Saved AI outputs live in `generated_assets` (`type` + JSON `content`), keyed by `user_id` / optional `creation_id`.

---

## 3. Shared report system

| Piece | Path |
|-------|------|
| Build MD brief | `lib/monetization-brief.ts` |
| Share snapshot | `POST /api/reports/share` → `shared_reports` |
| Public page | `/r/[token]` → `ProfessionalReportView` |
| Export UI | `MonetizationBriefExport` (download, link, email) |
| SQL | `supabase/shared_reports.sql` |

Snapshots freeze product + analysis and/or pricing at share time (revocable via `revoked_at`).

---

## 4. First-dollar & distribution patterns

- **`FirstDollarPath`** (`components/FirstDollarPath.tsx`) — offer, price, who, channel, ask, pay how, this-week steps; used on Analyzer, Funnel, Revenue, Pricing, Progress.  
- **This-week sprints** — Traffic (`this_week_sprint`), Content (`this_week_publish`).  
- **Template fill** — Library & Premium via `lib/fill-template.ts` + buyers/pricing/analysis.

---

## 5. The 15 tools (detailed)

Convention for each tool:

- **Id / UI / journey** — tab id, on-screen title, pie label  
- **Tier / phase** — unlock + journey phase  
- **Job** — one-sentence purpose  
- **Inputs** — user + system context  
- **Outputs** — structured result  
- **API / prompt / UI** — code entry points  
- **Evidence / external** — what hardens the run  
- **Exports / handoffs** — downloads and next tools  

---

### 1. Idea Analyzer — `analyzer`

| | |
|--|--|
| **UI title** | Commercial opportunity brief |
| **Journey** | Idea Analyzer · Plan · Starter |
| **Job** | Stress-test monetization potential before more build time. |
| **Inputs** | Creation (full expert context); evidence checklist answers; optional Apollo enrich from `competitors_notes`. |
| **Outputs** | `IdeaAnalysis`: score, reasoning, confidence, assumptions, kill criteria, paths, quick wins, validation plan, big promise, **citations**, **competitor_enrichment**. |
| **API** | `POST /api/analyze` |
| **Prompt** | `prompts/idea-analyzer.ts` (+ global rigor in `prompts/rigor.ts`) |
| **UI** | `components/tabs/AnalyzerTab.tsx`, `AnalysisResult.tsx`, `EvidenceChecklist`, `EditEvidencePanel`, `FirstDollarPath`, `MonetizationBriefExport` |
| **Evidence** | Full product context; checklist; URL/GitHub/docs; Apollo firmographics for named competitors. |
| **Exports** | Monetization Brief MD; share link `/r/[token]`; email. |
| **Handoffs** | → Buyers, Pricing, Funnel, Sales (first-dollar jumps). |

---

### 2. Find Your Buyers — `buyers`

| | |
|--|--|
| **UI title** | Find the people who'll actually pay you |
| **Journey** | Find Your Buyers · Plan · Starter |
| **Job** | Name ICP personas, objections, and who to message first. |
| **Inputs** | Creation; goal chips. |
| **Outputs** | `BuyerProfilesResult`: headline, personas, `best_first_target`. |
| **API** | `POST /api/buyers`; leads `POST /api/buyers/leads` |
| **Prompt** | `prompts/buyer-profiles.ts` |
| **UI** | `BuyersTab.tsx`, `ApolloLeadsPanel` |
| **Evidence** | Product context; Apollo people search (API key). |
| **Exports** | Buyers MD download; Copy DM from openers. |
| **Handoffs** | Seeds Funnel/Traffic/Sales/Content audience defaults; Library/Premium fill; Sales target buyer. |

---

### 3. Pricing Builder — `pricing`

| | |
|--|--|
| **UI title** | Pricing economics |
| **Journey** | Pricing Builder · Plan · Starter |
| **Job** | Defensible model, ranges, willingness-to-pay logic, experiment. |
| **Inputs** | Creation (full expert context). |
| **Outputs** | `PricingRecommendation`: model, ranges/sweet spot, anchors, sales copy, WTP, packaging tradeoffs, experiment. |
| **API** | `POST /api/pricing` |
| **Prompt** | `prompts/pricing-recommendations.ts` |
| **UI** | `PricingTab.tsx`, `PricingResult.tsx`, `FirstDollarPath`, `MonetizationBriefExport` |
| **Evidence** | Product context (price, traction, comps, URL, docs, GitHub). |
| **Exports** | Brief MD + share; copy sales block. |
| **Handoffs** | Library/Premium price fill; Progress/Revenue first-dollar price. |

---

### 4. Offer & page starters — `library`

| | |
|--|--|
| **UI title** | Offer & page starters |
| **Journey** | Offer & page starters · Plan · Starter |
| **Job** | Fill proven page/email/listing templates with product + buyers + price. |
| **Inputs** | Creation; `initialAnalyses`, `initialBuyers`, `initialPricings`. |
| **Outputs** | Filled markdown templates (client-side; no Grok call). |
| **API** | None (static `lib/templates.ts` + `fill-template.ts`) |
| **UI** | `LibraryTab.tsx` |
| **Evidence** | Fill quality rises with Analyzer / Buyers / Pricing assets. |
| **Exports** | Per-template Copy + Download. |
| **Handoffs** | Ship pages this week; pairs with Funnel copy. |

---

### 5. Funnel Architect — `funnel`

| | |
|--|--|
| **UI title** | Path to paid (funnel) |
| **Journey** | Funnel Architect · Execute · Growth |
| **Job** | Tripwire → core → profit maximizer with copy and motion. |
| **Inputs** | Creation; audience; price band; motion (outbound / PLG / hybrid); buyer-aware defaults. |
| **Outputs** | `FunnelPlan`: stages, next steps, motion, `first_dollar_offer`. |
| **API** | `POST /api/funnel` |
| **Prompt** | `prompts/funnel-architect.ts` |
| **UI** | `FunnelTab.tsx`, `FirstDollarPath`, `OutputCaveat`, glossary terms |
| **Evidence** | Product context; buyer defaults. |
| **Exports** | Funnel MD. |
| **Handoffs** | → Sales, Traffic; Progress aggregates first-dollar from funnel. |

---

### 6. Get Eyes on Your Offer — `traffic`

| | |
|--|--|
| **UI title** | Distribution without a big ad budget |
| **Journey** | Get Eyes on Your Offer · Execute · Growth |
| **Job** | Rank channels and ship a Mon–Fri distribution sprint. |
| **Inputs** | Creation; time/week; comfort (buyer-aware default). |
| **Outputs** | `TrafficPlan`: channels, weekly plan, golden rule, **`this_week_sprint`**. |
| **API** | `POST /api/traffic` |
| **Prompt** | `prompts/traffic-engine.ts` |
| **UI** | `TrafficTab.tsx`, sprint cards, jumps to Sales/Content |
| **Evidence** | Product context. |
| **Exports** | Distribution MD; copy Monday post. |
| **Handoffs** | → Content pack; → Sales kit. |

---

### 7. 30-Day Launch Plan — `launch`

| | |
|--|--|
| **UI title** | Your next 30 days, planned to the day |
| **Journey** | 30-Day Launch Plan · Execute · Growth |
| **Job** | One concrete action per day until live. |
| **Inputs** | Creation; audience defaults; Apollo on outreach days. |
| **Outputs** | Launch plan with weeks/days, scripts, milestones. |
| **API** | `POST /api/launch` |
| **Prompt** | `prompts/launch-plan.ts` |
| **UI** | `LaunchTab.tsx`, Apollo on outreach days |
| **Evidence** | Product context; ICP for leads. |
| **Exports** | Launch MD. |
| **Handoffs** | Uses Sales/Traffic/Content artifacts in the calendar narrative. |

---

### 8. Content Generator — `content`

| | |
|--|--|
| **UI title** | One idea → a week of content |
| **Journey** | Content Generator · Execute · Growth |
| **Job** | LinkedIn/X, ads, listing, emails + Mon–Fri publish order. |
| **Inputs** | Creation; tone; audience; Analyzer `big_promise` + Buyers positioning seed. |
| **Outputs** | `ContentBundle` + optional **`this_week_publish`**. |
| **API** | `POST /api/content` |
| **Prompt** | `prompts/content-generator.ts` |
| **UI** | `ContentTab.tsx`, `OutputCaveat` |
| **Evidence** | Product context + analysis/buyers seeds when present. |
| **Exports** | Full bundle MD. |
| **Handoffs** | Pairs with Traffic sprint. |

---

### 9. Momentum & next move — `progress`

| | |
|--|--|
| **UI title** | Momentum & next move |
| **Journey** | Momentum & next move · Measure · Growth |
| **Job** | Checklist to first revenue + suggested next money move. |
| **Inputs** | Milestone progress; asset stats; Revenue/Funnel/Analyzer for passive first-dollar. |
| **Outputs** | Saved milestones (`progress_logs`); derived First-dollar path; jump CTAs. |
| **API** | `POST /api/progress` |
| **Prompt** | None (deterministic + asset heuristics). |
| **UI** | `ProgressTab.tsx`, `FirstDollarPath`, `lib/milestones.ts` |
| **Evidence** | Indirect — quality of path depends on upstream assets. |
| **Exports** | First-dollar path MD via shared component. |
| **Handoffs** | Jumps to Analyzer / Pricing / Buyers / Funnel / Content / Sales / Results / Launch. |

---

### 10. Strategy Tools — `strategy`

| | |
|--|--|
| **UI title** | Think like a strategist |
| **Journey** | Strategy Tools · Measure · Pro |
| **Job** | Four sub-tools: competitors, pricing optimization, roadmap, A/B tests. |
| **Inputs** | Creation; sub-tool selection. |
| **Outputs** | CompetitorAnalysis / PricingOptimization / RoadmapPlan / AbTestPlan. |
| **API** | `POST /api/strategy`; enrich `POST /api/strategy/competitors/enrich` |
| **Prompt** | `prompts/strategy-tools.ts` |
| **UI** | `StrategyTab.tsx` (download on each result; Apollo enrich on competitors) |
| **Evidence** | Product context; Apollo company enrich (manual button). |
| **Exports** | MD per sub-tool. |
| **Handoffs** | Pricing experiments ↔ Pricing/Revenue; tests ↔ Results. |

---

### 11. Direct Sales Tools — `sales`

| | |
|--|--|
| **UI title** | Sell it yourself — without feeling salesy |
| **Journey** | Direct Sales Tools · Measure · Pro |
| **Job** | Openers, follow-ups, objections, call agenda + lead list. |
| **Inputs** | Creation; channel; tone; target buyer (buyer-aware default). |
| **Outputs** | `SalesKit`; Apollo leads panel. |
| **API** | `POST /api/sales`; leads via buyers leads API |
| **Prompt** | `prompts/sales-kit.ts` |
| **UI** | `SalesTab.tsx`, first-dollar ask card, CSV export |
| **Evidence** | Product context; Apollo people. |
| **Exports** | Kit MD + openers CSV. |
| **Handoffs** | From Funnel/Traffic first-dollar; → Results for logging replies. |

---

### 12. What's Working — `results`

| | |
|--|--|
| **UI title** | What's working? Let the numbers talk |
| **Journey** | What's Working · Measure · Pro |
| **Job** | Log weekly funnel numbers; diagnose bottleneck; next tests. |
| **Inputs** | Product picker; visitors/signups/sales/revenue; optional demo data. |
| **Outputs** | Metrics entries + `MetricsAnalysis` (working, bottleneck, tests). |
| **API** | `POST /api/results` (`log` \| `analyze`) |
| **Prompt** | `prompts/metrics-optimizer.ts` |
| **UI** | `ResultsTab.tsx`, chart, jump to Traffic/Sales/Funnel/Content |
| **Evidence** | User-entered numbers (strongest “observed” loop in the app). |
| **Exports** | Analysis MD. |
| **Handoffs** | Bottleneck → distribution / sales / funnel tools. |

---

### 13. Ways to Get Paid — `revenue`

| | |
|--|--|
| **UI title** | Revenue model map |
| **Journey** | Ways to Get Paid · Scale · Pro |
| **Job** | Compare revenue models; pick what to build first; unit economics. |
| **Inputs** | Creation; goal. |
| **Outputs** | `RevenueStreamsPlan`: streams, build_first, **unit_economics**, **first_dollar_path**. |
| **API** | `POST /api/revenue` |
| **Prompt** | `prompts/revenue-streams.ts` |
| **UI** | `RevenueTab.tsx`, `FirstDollarPath`, `OutputCaveat` |
| **Evidence** | Product context; labeled assumptions in economics. |
| **Exports** | Revenue MD. |
| **Handoffs** | Progress first-dollar; → Sales/Traffic/Funnel jumps. |

---

### 14. Done-For-You — `dfy`

| | |
|--|--|
| **UI title** | Monthly custom asset request |
| **Journey** | Done-For-You · Scale · Pro |
| **Job** | One queued human-crafted asset/month + instant downloadable brief. |
| **Inputs** | Creation (creationId stored); asset type; audience/goal/tone; notes; buyers/pricing enrich brief. |
| **Outputs** | Queue row (`dfy_request` asset); instant brief MD via `lib/dfy-brief.ts`. |
| **API** | `POST /api/dfy` |
| **Prompt** | None for queue; brief is deterministic template. |
| **UI** | `DfyTab.tsx` |
| **Evidence** | Brief includes product, buyer target, sweet-spot price when available. |
| **Exports** | Instant brief MD (does not consume monthly slot). |
| **Handoffs** | Uses product picker; queue shows product name. |

---

### 15. Premium Library — `premium`

| | |
|--|--|
| **UI title** | Priority Support + Premium swipe files |
| **Journey** | Premium Library · Scale · Pro |
| **Job** | Operator-grade swipe files filled like Library + priority support mailto. |
| **Inputs** | Creation; analyses/buyers/pricings for fill. |
| **Outputs** | Filled templates from `lib/premium-library.ts` (no Grok). |
| **API** | None for templates |
| **UI** | `PremiumTab.tsx` |
| **Evidence** | Same fill pipeline as Library. |
| **Exports** | Copy + Download per swipe. |
| **Handoffs** | Support channel for stuck operators. |

---

## 6. Key code map

| Concern | Location |
|---------|----------|
| Journey pie / completion | `lib/journey.ts`, dashboard pie UI |
| Tool tabs | `components/tabs/*Tab.tsx`, `DashboardTabs.tsx` |
| Prompts | `prompts/*.ts` |
| Types | `types/index.ts` |
| Product context | `lib/product-context.ts`, `lib/tool-request.ts` |
| Website scrape | `lib/website-public.ts` |
| GitHub fetch | `lib/github-public.ts` |
| PDF/text evidence | `lib/evidence-text.ts` |
| Template fill | `lib/fill-template.ts` |
| Apollo | `lib/apollo.ts` |
| Shared reports | `lib/shared-report.ts`, `app/r/[token]` |
| SQL migrations | `supabase/*.sql` |
| Migration helper | `scripts/migrate-pooler.mjs` |

---

## 7. Honesty / trust constraints

- Global anti-invention rules: `prompts/rigor.ts` appended in `lib/grok.ts`.  
- `OutputCaveat` on AI surfaces — evidence-level honesty + feedback.  
- Marketing may promise speed; product must keep evidence inventory and confidence labels visible.  
- DFY is a **queue**, not instant auto-generate for the polished asset.  
- URL scrape is static HTML (+ Jina text fallback); not a full browser render.

---

## 8. Related docs

- App setup / env: repo root `README.md`  
- RAIN colony architecture (agents, platform): `RAIN/docs/architecture.md`  
- Video / narration encyclopedia (marketing): `RAIN/marketing/26-07-24_comprehensive_narration_context.md`  
- This file mirrored for notes index: `RAIN/docs/make-it-rain-architecture.md`
