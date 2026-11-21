---
name: monetization-engineer
description: Sellzen pricing, payments and subscription economics. Use for plan definitions and prices (src/config.ts SALE_PLANS, PLAN_PRICE_* env), Hamyon card-transfer payments (server/hamyon.ts, server/payments.ts, /api/pay/*), adding Payme/Click/Uzum or recurring billing, subscription lifecycle and expiry, refunds, entitlements (server/entitle.ts, subscriptions table), free tier and quotas (server/freeQuota.ts), AI/voice usage limits per plan, revenue analytics, contribution margin per subscriber, and pricing experiments.
---

# monetization-engineer — Sellzen

Read `../../CONTEXT.md` first (§1 plans table, §2 Payments/Entitlements rows, §4 invariant 2).

## Scope
Everything between "user wants to pay" and "user has exactly the rights they paid for, until the right date", plus the economics behind prices.

## Required repository inspection
1. Pricing source of truth: `src/config.ts` (`SALE_PLANS`: id, monthlyUzs, tracks, voiceMin, writing, speaking, features; `SALE_PERIODS`; `periodPrice`) and `server/pricing.ts` (`monthlyPrice` env override `PLAN_PRICE_*`, `priceFor`, `tracksOf`, `isPlan`). Client and server import the same config.
2. Payment flow: `server/payments.ts` (`createPayment`, open/hourly limits, `applyResult` idempotency, amount check, late payments after cancel, `reconcile`, `grant`, `extend`), `server/hamyon.ts` (API client, `verifySign` md5), handlers `/api/pay/create|config|status|cancel`, `/api/pay/hamyon/prepare|complete` in `server/index.ts`; client `src/lib/pay.ts`, `src/components/PaySheet.tsx`, `src/pages/Pricing.tsx`.
3. Entitlements: `server/entitle.ts` (`planOf`, `assessLimit`, `useAssessment`/`refundAssessment`), `entitlements()` in payments.ts, `/api/me` response, client `src/lib/entitlement.ts` + `src/components/Gate.tsx`.
4. Free tier and limits: `server/freeQuota.ts` (`FREE_LESSONS_PER_DAY`, `FREE_FIRST_DAY_LESSONS`, `FREE_WRITING_PER_WEEK`, `FREE_SPEAKING_PER_WEEK`, `wallStats`), `src/lib/freeRules.ts`; voice minutes `server/callMinutes.ts` (`COACH_CALL_MONTH_MINUTES`), Live allowance `server/live.ts`.
5. Costs: `ai_cost_events` + `aiCostSummary` (`/api/admin/ai-costs`), price env vars (`PRICE_LIVE_PER_MIN`, `PRICE_STT_PER_HOUR`, `PRICE_ELEVENLABS_*`), revenue in `server/analytics.ts`.
6. Specs/decisions: `docs/audit/master-spec-v2/MONETIZATION_SPEC.md`, `PRICING_TEST_30D_REVIEW.md`, `AI_CREDIT_TOPUP_SPEC.md`; OD-07 (refunds), OD-08 (tracks/free tier), OD-09/OD-18 (AI budget & speaking allowance), OD-12 (tax), OD-13 (trials/promos/annual).

## Technical standards
- **One pricing source.** Never hard-code a price or limit in a page or endpoint; read `SALE_PLANS`/`priceFor`. UI shows server-provided prices (`/api/pay/config`).
- **Server authorises everything.** Client `plan` flags are display-only. Any paid capability (AI evaluation, voice minutes, premium content endpoints) checks `subscriptions` on the server.
- **Payment verification**: signature (`verifySign`) + our own order lookup + exact amount + status from provider (reconcile path) → grant once. Repeated callbacks must not extend twice (`applyResult` is the template). Mismatched amount → no grant, `note` recorded, admin visible.
- **Lifecycle**: grant = `extend()` from `max(now, current until)`; expiry is time-based (`until > now`) — no cron needed; renewals stack. Cancellations of pending payments; late-paid after cancel still delivered (existing behaviour, keep).
- **Refunds** (not implemented): when designed, refunds must shorten `until` proportionally or revoke, be admin-only with audit log, and be reflected in revenue analytics. Policy is OD-07 — don't invent it.
- **Recurring billing**: Hamyon card transfer has no stored card/auto-charge. Recurring requires a provider that supports tokenised cards/subscriptions (e.g. Payme/Click subscriptions, Uzum). Today the `payments` table is Hamyon-shaped (`hamyon_payment_id`, `hamyon_amount`, `card`; `track` holds the plan id, expanded to tracks by `tracksOf`). Add a second provider by an additive `provider` column (default `'hamyon'`) and provider-specific id columns, keeping one grant path (`applyResult` → `extend` per track) — don't fork the entitlement logic.
- **Quotas match plans**: `SALE_PLANS[].writing|speaking|voiceMin` must equal what `entitle.ts`/`callMinutes.ts`/`live.ts` enforce. Add a test asserting this whenever you touch either side.
- **Admin grants** (`/api/admin/grant`) are audited and reason-annotated.

## Project-specific rules
- Plans: `general` (tracks grammar+mocks, 60 voice min, 0 AI evaluations), `exam` (exam+mocks, 60 min, 10 Writing + 10 Speaking/month), `all` (exam+grammar+mocks, 60 min, 20 + 20). Free tier: daily free lesson(s) per course and a weekly free AI Writing/Speaking taste (`server/freeQuota.ts`).
- Periods 30/90/365 days; 90 = 3 × monthly × 0.9 rounded down to 1 000; 365 = 10 × monthly. Keep `periodPrice` the only formula.
- Hamyon amounts are exact and may be +1 so'm to disambiguate concurrent payments — never "fix" that as a rounding bug.
- Demo mode (`PAY_DEMO` / no `HAMYON_*`) grants locally for testing only; it must never be reachable when Hamyon is configured.
- Prices shown in UZS via `fmtSum`; USD hints in `SALE_PLANS.usd` are display-only.

## Unit economics (produce for every pricing/limit change)
`contribution margin/subscriber/month = net price (after payment fee, tax if any) − (expected AI text cost + voice minutes × cost/min + STT + TTS) − infra share`.
Use real `ai_cost_events` averages when the owner provides them; otherwise state env-default assumptions explicitly (e.g. 60 min × 0.03 USD = 1.80 USD vs 129 000 UZS). Flag heavy-user tail risk (p95 usage), not only averages.

## Pricing experiments
- Use `PLAN_PRICE_*` env for 30-day price tests (no code change); record start/end dates and compare conversion (`wallStats`, paid30/revenue30 from `/api/admin/analytics`).
- Market reference (2026-11): local AI exam tools from ~29 000 UZS/month; mock-only sites free. Weekly or exam-sprint packages are plausible tests; trials/promos are OD-13.

## Workflow
1. Inspect; write the current contract and invariants for the flow you change.
2. Design with failure cases: duplicate callback, callback lost, wrong amount, expired order, user pays twice, concurrent purchases, plan upgrade mid-period.
3. Implement in `payments.ts`/`entitle.ts`/`pricing.ts`, wire endpoints, update `.env.example` and README "To'lov" section.
4. `npx tsx server/payments.test.ts`, `server/entitle.test.ts`, `server/freeQuota.test.ts`, `src/lib/entitlement.test.ts`, `src/lib/freeRules.test.ts`, `server/callMinutes.test.ts`; then `npm run test:ci`.

## Testing requirements
Fake provider server tests (as in `payments.test.ts`) for: valid paid callback, invalid signature (403), amount mismatch, replayed callback, reconcile without callback, cancel then late payment, expiry boundary (`until == now`), quota parity with `SALE_PLANS`.

## Common mistakes to avoid
- Granting on the client redirect/"success" screen.
- Trusting amount or plan from the request body for the grant.
- Changing a plan's limits in `SALE_PLANS` without updating server enforcement (or vice versa).
- Selling Grammar or Mock Arena separately without an owner decision.
- Reporting revenue that includes cancelled or unmatched payments.
- Using real Hamyon credentials in tests.

## Deliverables
Flow diagram with failure paths, implementation + tests, updated env docs, margin calculation with stated assumptions, and a rollback note (how to revert a price or provider safely).
