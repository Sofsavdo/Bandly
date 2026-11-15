# 30-Day Pricing Test — Review Workbook

Status: **prepared, not started.** The test starts only when paid plans, metering (`AI_COST_CONTROL_SPEC.md`) and a working payment provider exist, and the owner approves the start. Until then, production code, live prices and existing subscriptions are unchanged (OD-25 item 8).

## 1. What is being tested (owner decisions 2026-11-15)
| Plan | Price / month | 3 months | 12 months | Live voice | Speaking ass. | Writing ass. | Assessed answers |
|---|---|---|---|---|---|---|---|
| FREE | 0 | — | — | one 3-min demo | — | — | daily limited |
| GENERAL ENGLISH | 69 000 | 186 000 | 690 000 | 60 min | — | — | 5/day |
| EXAM PREPARATION | 99 000 | 267 000 | 990 000 | 30 min | 10 | 10 | 5/day |
| ALL ACCESS | 129 000 | 348 000 | 1 290 000 | 60 min | 20 | 20 | 5/day |
Target AI cost: 20–25 % of plan revenue. Mock Arena objective tests stay free. Prices are stored as data rows (`MONETIZATION_SPEC.md` §2).

## 2. Data to collect (filled from the ledger and payments, never estimated by hand)
### 2.1 Funnel and revenue
| Metric | GENERAL | EXAM | ALL ACCESS | Total |
|---|---|---|---|---|
| New FREE sign-ups | | | | |
| FREE demo used / blocked as repeat | | | | |
| Checkout started | | | | |
| Paid (1 m / 3 m / 12 m) | | | | |
| Conversion FREE → paid (%) | | | | |
| Gross revenue (so‘m) | | | | |
| Payment fees (so‘m) | | | | |
| Tax (so‘m, OD-12) | | | | |
| Net revenue (so‘m) | | | | |
| Refunds / chargebacks | | | | |
| Cancelled at day 30 (%) | | | | |
| Credit packs sold (count, so‘m) | | | | |

### 2.2 AI cost (settled, provider-reported)
| Metric | GENERAL | EXAM | ALL ACCESS | FREE |
|---|---|---|---|---|
| Total AI cost (USD) | | | | |
| AI cost ratio, gross (%) | | | | n/a |
| AI cost ratio, net (%) | | | | n/a |
| Cost per paying user: p50 / p90 / p99 (USD) | | | | |
| Live voice cost per minute, measured (USD) | | | | |
| Speaking assessment cost per unit (USD) | — | | | — |
| Writing assessment cost per unit (USD) | — | | | — |
| Practice answer cost per unit (USD) | | | | |
| Free demo cost per demo (USD) | — | — | — | |
| Lever activations (§5 of the cost spec) | | | | |

### 2.3 Allowance use
| Metric | GENERAL | EXAM | ALL ACCESS |
|---|---|---|---|
| Live voice minutes used: p50 / p90 / max | | | |
| % users who hit the voice limit | | | |
| Speaking assessments used: p50 / p90 | — | | |
| Writing assessments used: p50 / p90 | — | | |
| Days on which the 5-answer cap was hit (% of active days) | | | |
| % users who hit the per-user cost ceiling (should be ≈ 0) | | | |

### 2.4 Quality guardrails (from `voice/VOICE_ACCEPTANCE_CRITERIA.md`)
- Voice p95 turn latency.
- Assessment error and complaint rate.
- Share of AI answers labelled "unavailable".
- User complaints about limits.

## 3. Formulas
- `revenue_usd = revenue_som ÷ FX_day` (CBU daily rate stored per day [U])
- `ai_ratio_gross = Σ ai_cost_usd ÷ Σ revenue_usd_gross`, and `ai_ratio_net` uses net revenue
- `cost_per_user_pX` = percentile X of Σ ai_cost_usd per paying user in the month
- `contribution_per_user = net_revenue_per_user − ai_cost_per_user − infra_cost_per_user` (infra = Railway, storage and bandwidth ÷ active users)
- `break-even voice price per minute = (0.25 × revenue_usd − other_ai_cost) ÷ voice_minutes_used`
- Pack price check: `AI_CREDIT_TOPUP_SPEC.md` §2

## 4. Baseline estimate to compare against [E]
FX 1 USD ≈ 12 500 so‘m. All figures are estimates until the test replaces them (`AI_COST_CONTROL_SPEC.md` §3).

| Plan | Budget 20–25 % | Typical-use cost | Full-use cost |
|---|---|---|---|
| GENERAL | $1.10–1.38 | $1.0–1.9 | $3.2–6.2 |
| EXAM | $1.58–1.98 | $1.4–2.0 | $4.6–6.7 |
| ALL ACCESS | $2.06–2.58 | $2.2–3.1 | $7.3–10.3 |

The owner's sample mix (400 / 350 / 250 paying users) gives **94 500 000 so‘m gross per month**, about $7 560. At a 25 % AI cost share the total AI budget is about **$1 890 per month** for that mix.

## 5. Decision rules at day 30 [R, owner approves each change]
| Observation | Action for the next cycle |
|---|---|
| Plan AI ratio ≤ 20 % and few users hit limits | keep limits; consider adding minutes as a selling point |
| 20–25 % | keep |
| 25–30 % | apply cheaper models or levers permanently; review the 5/day cap and minute limits |
| > 30 % | lower that plan's allowance or raise its price for **new** subscribers; existing subscribers keep their limits until renewal, with notice |
| p90 user cost > 50 % of revenue | review the heaviest feature for that plan |
| Many users hit the voice limit, and pack sales are low | test a smaller, cheaper Voice pack |
| Conversion to EXAM is low and users mention the 30 voice minutes | test 45–60 min or better pricing-page copy |
| Free demo cost per paid conversion > 10 % of first-month revenue | shorten or gate the demo further |
| Measured voice cost per minute > $0.05 | do not raise voice minutes; re-run the provider benchmark |

## 6. Timeline
- **Day 0:** owner approves the start; limits and prices loaded as data; dashboard verified with test accounts.
- **Day 7:** early check, for abuse, outliers and a broken meter only. No price changes.
- **Day 30:** fill this workbook and propose changes; the owner decides.
- **Day 31+:** changes apply to new subscribers and next cycles only.

## 7. Open decisions this test depends on
- **OD-04 / OD-11:** payment provider and fees.
- **OD-12:** tax.
- **OD-21 / OD-23:** voice providers and benchmark.
- **OD-26:** demo identity check.
- **OD-27:** credit packs.
- **M5:** accounts, entitlements and the existing-subscription mapping (OD-08 precondition).
