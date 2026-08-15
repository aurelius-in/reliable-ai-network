# Service ladder model

**Status:** Phase 0 messaging live; Phase 0b checkout upsells on `/checkout`. Schema stub in `supabase/service_ladder.sql`.  
**Principle:** The subscription is a lower-cost commercialization **advisory and operating layer**. It helps founders decide what to do, why, and what is working. It does not claim to replace human selling or specialist execution.

Related: `../assets` notes `26-08-04_service_ladder_ab.md` (in RAIN notes repo), homepage variants `lib/home-ab.ts`, DFY `lib/dfy.ts` + `components/tabs/DfyTab.tsx`.

---

## Layers

| Layer | Job | In-app today | Out of band |
|-------|-----|--------------|-------------|
| **1. Strategy & administration** | ICP, pricing/economics, channels, lead sources, campaign plans, evidence, results loops | Analyzer, Buyers, Pricing, Strategy, Funnel/Traffic/Launch plans, Progress, Results, Monetization Brief | — |
| **2. Execution** | Content production, campaigns, ads, lead sourcing, outreach, sales conversations, close | Drafts/scripts/Apollo DIY; Pro DFY queue | Optional specialist / partner work from an **execution brief** |

Core app **owns Layer 1** and **prepares clear execution briefs** for Layer 2.

---

## Packaging

1. **Self-serve advisory subscription** — Starter / Growth / Pro (`lib/tiers.ts`). Entry offer.  
2. **Higher tiers** — more tools, automation, tracking, deeper guidance.  
3. **Optional done-for-you services** — priced separately; never required for product value.

Messaging emphasis: *Make better commercialization decisions, keep the plan current, and know what to do next.*  
Avoid: *The software will run every sales activity and close customers.*

---

## Capability map

### A. ROI and time-saved

- **Now:** Results tab weekly visitors/signups/sales/revenue + AI diagnosis.  
- **Target:** User-entered subscription cost, campaign cost, hours, leads, opps, sales, revenue → simple value vs cost; estimated time saved from generated plans/briefs (labeled estimates, no unsupported ROI claims).  
- **DB:** `roi_entries` (see SQL stub).

### B. Done-for-you handoff

- **Now:** Instant MD brief + one Pro queued request/month; statuses in JSON only.  
- **Target:** Structured execution brief from Product Brief + ICP + offer + channels + evidence; request types for content, campaigns, ads, leads, outreach; admin status transitions.  
- **Reuse:** `buildDfyInstantBrief`, `generated_assets` type `dfy_request`.

### C. Content execution package

- **Now:** Content tab `ContentBundle`.  
- **Target:** Editorial plan tied to ICP/offer/funnel/channel/outcome; modes: DIY / AI draft / request DFY.  
- **Reuse:** Content + Traffic sprint + Launch calendar — unify presentation, don’t duplicate generators.

**David Diaz lesson (2026-08-04):** Do not sell “AI writes content” or “AI sells.” Sell: founder supplies lived experience and judgment; system removes research/planning/drafting/repurposing friction; human approves; track conversations and refine. Target flow:

`story/voice notes → voice profile → week campaign → human edit → publish plan → response tracking → refine`

Optional Layer-2 content production is a **pull** when DIY becomes the bottleneck (same pattern as David hiring LinkedIn content help). Full notes: RAIN `assets/August/26-08-04_david_diaz_feedback.md`.

### D–E. Packaging & messaging

- Pricing page + tiers copy state Layer 1 vs optional Layer 2.  
- Homepage **A** tests first-paying-customer + demand discovery; **B** agency price anchor; **C** decision layer. Buyers tab includes live demand scan (HN/Reddit). See RAIN `assets/market-intelligence/`.

---

## Minimum database changes (Phase 1–2)

See `supabase/service_ladder.sql`:

1. `roi_entries` — per-user (and optional creation) economics log.  
2. Optional `execution_briefs` — persisted handoff snapshot (or store full brief JSON on `dfy_request.content`).  
3. Expand allowed `assetType` strings in app code (no enum in DB today).  
4. Later: Stripe Price IDs for à la carte services (not in Phase 0).

---

## Required UI changes (phased)

| Phase | UI |
|-------|-----|
| **0** | Homepage C advisory copy; B trust clarification; DFY “execution handoff” framing; tiers star copy |
| **1** | DFY: more service types; persist/download richer brief; admin queue page |
| **2** | Results: ROI / time-saved panel; Content: DIY vs AI vs DFY choice |
| **3** | Pricing + GoDaddy-style checkout add-ons (live on `/checkout`) |

---

## New workflows

1. **Decide loop:** Product Brief → tools → Monetization Brief → this-week plan.  
2. **Handoff:** User requests specialist help → system builds execution brief from existing outputs → queue → delivery.  
3. **Measure:** Log costs/hours/outcomes → Results updates “what to do next.”  
4. **Content package:** Plan → choose DIY / AI / DFY per item → track publish.

---

## Existing modules (avoid duplication)

| Need | Reuse |
|------|--------|
| ICP / buyers | BuyersTab, Apollo |
| Pricing / economics | PricingTab |
| Evidence | creations + evidence APIs |
| Plans | Funnel, Traffic, Launch, Strategy |
| Content drafts | ContentTab |
| Metrics | ResultsTab, ProgressTab |
| Shareable strategy memo | monetization-brief, shared_reports |
| Human craft queue | DfyTab /api/dfy |

---

## Risks: SaaS vs professional services

| Risk | Mitigation |
|------|------------|
| Users think $149 includes campaign management | Copy: “plans and briefs; optional specialist execution” |
| DFY hides core value | Core tools never gated on DFY purchase |
| Unsupported ROI claims | Only show user-entered math + labeled estimates |
| Agency mirror (variant B) overpromises | Clarify strategy layer; keep $10k menu as *market rates*, not MIR deliverables |
| Partner white-label pressure (Furqan-class) | Referrals/affiliates OK; don’t reposition MIR as agency |

---

## Phased implementation plan

| Phase | Goal | Exit criteria |
|-------|------|----------------|
| **0** Messaging | A/B/C + DFY/tiers language | Live; counter tracks home_ab + exit survey |
| **0b** Checkout upsells | GoDaddy-style Layer-2 add-ons on `/checkout` | Catalog in `lib/checkout-upsells.ts`; ops email on select |
| **1** Handoff | Richer brief + admin status | Ops can mark delivered; ≥1 real DFY cycle |
| **2** Economics + content package | ROI entries + content modes | Users can log a week of economics |
| **3** Services catalog | Stable Stripe Price IDs per add-on (optional env) | Subscription still useful with $0 add-ons |

**Homepage A/B kill rule:** ≥300 sessions/variant (or ≥50 attributed signups) before retiring a loser.
