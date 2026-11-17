# Monetization Spec

Legend: **[H]** owner hypothesis (not approved) · **[R]** recommendation · **[U]** unresolved. **No price below is final; none may be hard-coded.**

## 1. Plan hypotheses [H]
| Plan | Hypothesis | Contents (owner text) |
|---|---|---|
| FREE | $0 | General English starter exercises, free Reading/Listening mocks, test bank, limited AI, basic progress |
| GENERAL ENGLISH | $5.99/mo | A1–C2, grammar, vocabulary, reading, listening, speaking, writing, pronunciation, AI conversation, personal plan, games/revision |
| EXAM PREPARATION | $7.99/mo | IELTS, CEFR, SAT, AI Speaking, Writing evaluation, exam plan, advanced analytics |
| ALL ACCESS | $9.99/mo | everything above + AI Voice Coach, higher AI credits |

**Rules:** no unlimited-AI plan (owner text); AI allowance is credits, set per plan and country (OD-09). Grammar is not sold separately (DR-01).

## 2. Data model [R]
```sql
CREATE TABLE app.plans (id text PRIMARY KEY, name_key text NOT NULL, active boolean NOT NULL DEFAULT true);
CREATE TABLE app.plan_entitlements (plan_id text REFERENCES app.plans, feature text, limit_value bigint, PRIMARY KEY (plan_id, feature));
CREATE TABLE app.country_prices (...)            -- see PRODUCT_ARCHITECTURE.md; amount_minor + currency per country/period, versioned
CREATE TABLE app.subscriptions (id uuid PRIMARY KEY, user_id uuid, plan_id text, country text, state text,
  current_period_end timestamptz, provider text, provider_ref text, UNIQUE (provider, provider_ref));
CREATE TABLE app.plan_credit_allowances (plan_id text, country text, monthly_credits bigint, daily_free_credits bigint, PRIMARY KEY (plan_id, country));
CREATE TABLE app.tax_settings (country text PRIMARY KEY, mode text, rate_bp int, note text);  -- values: owner/legal [U]
```
USD is a reference price only; the charged amount is the country row. Annual billing, promo codes, trials and discounts are rows too (**[U]** approval per country).

## 3. Entitlement flow
Server derives entitlements from `subscriptions` state (`active|grace|expired|cancelled|refunded`) → `requireEntitlement(feature)` on every protected API; the frontend only displays. Mapping of the three legacy tracks: OD-08.

## 4. Payments
Provider abstraction `PaymentProvider {createCheckout, verifyWebhook, parseEvent, refund}`; Hamyon (UZ) existing adapter is `BACKEND ONLY` / unproven. Webhooks: durable inbox, signature check, idempotent apply, reconciliation (`FINAL_MIGRATION_SPEC.md` §6). Failed payment → `grace` period length **[U]**; expiry and cancellation jobs; refunds recorded in an append-only table; admin refunds require reason (ADMIN_CMS_SPEC). The frontend success screen never grants access.

## 5. Economics guardrails
- Per user per month: AI cost (ledger) must stay under a **gross-margin target the owner sets [U]**; dashboards show cost per plan/country (`ANALYTICS_SPEC.md`).
- Mock Arena free tier has **infrastructure** cost (server, storage, bandwidth) even with zero AI cost (owner text); measured, not assumed.
- Provider prices live in `provider_prices` with source notes; every number `UNVERIFIED` until sourced.

## 6. Open owner decisions
OD-08 (plan ↔ feature mapping), OD-09 (credits, ceilings), OD-11 (international provider/entity), OD-04 (Hamyon shop for Bandly), new OD-12 (tax settings per country), OD-13 (trial/promo policy).

## Scenario note (source C2)
A UZS "market benchmark" price set (39 000 / 49 000 / 89 000 / 149 000 per month; annual = 10× monthly) exists in the sources. It includes a Grammar-only tier, which the architecture rejects, so it is kept only as a competitor-price reference. Fair-use rule: even "unlimited" marketing language needs an internal limit; recommended not to sell unlimited AI voice. Credits in the source (5 min speaking = 5, 1 writing = 5, deep grammar = 1, plan = 1, objective checks = 0) are illustrative; real credit prices come from `credit_prices` and verified provider costs.

## 7. Owner pricing decision (2026-11-15) — starting tariff, subject to a 30-day price test

> **Live on the site from 2026-11-17 (owner instruction "tarif rejalarni … shunga o‘zgartir").** This supersedes OD-25 item 8 for prices.
> - **Where it is defined:** `src/config.ts` `SALE_PLANS` / `SALE_PERIODS` / `periodPrice`.
> - **How to change a price:** set `PLAN_PRICE_GENERAL`, `PLAN_PRICE_EXAM` or `PLAN_PRICE_ALL` (monthly price in so‘m) in Railway, with no code change.
> - **What each plan opens:**
>   - GENERAL opens grammar;
>   - EXAM opens exam;
>   - ALL ACCESS opens both;
>   - Mock Arena stays free.
> - **Old subscriptions:** existing single-track subscriptions keep working; they are no longer sold.
> - **Not yet enforced:** per-plan AI monthly allowances (voice minutes, assessments). AI is not connected yet; the pricing page says so.
Source: owner message. Competitor prices quoted by the owner (Trylab 39 000 / 69 000, Flamona 43 000 / 69 000, PrepGo 82 500, Scorify 49 000 / 129 000, BandMate Pro 199 000 so‘m/month; GoPrep US App Store $19.99 / $29.99 quarter / $79.99 year) are **owner-supplied, not re-verified here [S]**.

| Plan | 1 month | 3 months (≈ −10 %) | 12 months (2 months free) | USD anchor (other countries) |
|---|---|---|---|---|
| FREE | 0 | — | — | $0 |
| GENERAL ENGLISH | 69 000 so‘m | 186 000 | 690 000 | $5.99 |
| EXAM PREPARATION | 99 000 so‘m | 267 000 | 990 000 | $7.99 |
| ALL ACCESS (recommended) | 129 000 so‘m | 348 000 | 1 290 000 | $9.99 |

Period prices check out (3 × monthly × 0.9 rounded down to the thousand; yearly = 10 × monthly). The owner's revenue example (400 / 350 / 250 users) totals **94 500 000 so‘m/month gross** (the first figure 93 800 000 in the message was a typo; the table total is right), before payment fees, tax, marketing, servers and AI.

| AI allowance per month | FREE | GENERAL | EXAM | ALL ACCESS |
|---|---|---|---|---|
| AI voice (live AI Tutor) | one demo, max 3 min, once per person | 60 min | 30 min | **60 min** (was 120; OD-25 §5) |
| AI Writing assessment | — | — | 10 | 20 |
| AI Speaking assessment | — | — | 10 | 20 |
| AI Teacher | daily limited | limited | limited | extended + all personalities |

Rules carried over: objective Mock Arena tests and their automatic results stay **free**; no unlimited AI; grammar is not sold separately; KZ/KG/TJ prices set locally after their own test.

**Implementation rule (owner):** prices and limits are **data** (`plans`, `plan_entitlements`, `country_prices` in §2), not code constants, until the 30-day test (conversion, AI cost per user) confirms them. The legacy demo tracks in `src/config.ts` / `server/pricing.ts` (exam 149 000, grammar 79 000, mocks 99 000) are **not** changed until the M5 migration with a mapping for any existing subscriber (OD-08 precondition).

### Unit economics check (variable AI cost only; FX assumption 1 USD ≈ 12 500 so‘m [U]; payment fees and tax [U], OD-12)
| Plan | Revenue ≈ USD | Full use of every allowance | Typical use (≈ 40 %) | Verdict |
|---|---|---|---|---|
| GENERAL 69 000 | $5.5 | 60 live min: $1.1 (cheap realtime, good caching) … $11 (worst) + speaking practice (cap needed, ≈ $0.02/answer) | ≈ $1–3 | OK **only** with a cheap realtime model and a daily cap on assessed practice answers |
| EXAM 99 000 | $7.9 | 30 min $0.5–5.4 + 10 speaking mocks $1.5–5.5 + 10 essays $0.2–0.8 | ≈ $1–4 | OK |
| ALL ACCESS 129 000 | $10.3 | *(superseded: computed with 120 min; see `AI_COST_CONTROL_SPEC.md` §3 for 60 min)* 120 min $2.2–22 + 20 speaking $3–11 + 20 essays $0.4–1.6 | ≈ $2.5–8 | **Risk**: profitable only if realtime runs on the cheapest model that passes the benchmark (≈ $0.02–0.05/min) and speaking assessment is optimised (§ VOICE_COST_MODEL §10) |

Observations for the owner:
1. EXAM (99 000) gets **fewer** live voice minutes (30) than GENERAL (69 000, 60 min). Intended (Exam's value is the 10 scored speaking mocks), but users may read it as "the dearer plan gives less" → state it clearly on the pricing page, or give Exam 60 min too.
2. "Birinchi AI Speaking demo" in FREE needs a size (recommended 3–5 min once, cheapest realtime model; ≈ $0.05–0.9 per new user).
3. A "speaking assessment" needs a definition (recommended: one full IELTS/CEFR speaking mock, max ≈ 14 min audio); a "writing assessment" = one task up to the official word range.
4. Extra minute packs for users who run out are recommended (priced at ≥ 2× worst-case cost per minute).

### OD-25 decisions (owner, 2026-11-15) — supersede the observations above
1. EXAM keeps **30** live voice minutes; GENERAL keeps 60. The pricing page explains why (copy in `AI_COST_CONTROL_SPEC.md` §8).
2. FREE demo: **once per person, max 3 minutes**, with anti-abuse protection against repeat accounts (`AI_COST_CONTROL_SPEC.md` §7).
3. Units: 1 Speaking assessment = one full IELTS Speaking mock of max 14 minutes; 1 Writing assessment = one complete Writing task in the official format and word range.
4. Assessed AI answers in practice (lessons, "Jim qolma!" and any other AI-costing answer): **5 per day**, plus the monthly plan limits, plus the AI Cost Budget — all three enforced together.
5. ALL ACCESS live voice: **60 min/month** (initial 30-day test limit).
6. AI Cost Control: real cost per user, plan, feature and provider; target AI cost **20–25 % of plan revenue**, enforced server-side → `AI_COST_CONTROL_SPEC.md`.
7. Extra AI credits beyond the plan → `AI_CREDIT_TOPUP_SPEC.md`.
8. No change to production code, live prices or existing subscriptions now; all economics prepared for the 30-day review → `PRICING_TEST_30D_REVIEW.md`.
