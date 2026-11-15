# AI Cost Control Spec

Status: **design only, owner decision OD-25 (2026-11-15).** Nothing is implemented. Production code, live prices and existing subscriptions are unchanged. This spec builds on the credit ledger in `phase-0.2/FINAL_AI_CREDIT_SPEC.md` (double-entry ledger, reservation → settlement, crash recovery) and on the unit prices in `voice/VOICE_COST_MODEL.md`.

**Legend**
- **[O]**: owner decision.
- **[R]**: recommendation.
- **[U]**: unverified or still open.
- **[E]**: estimate, to be replaced by measured values after the 30-day test.

## 1. Goal and definitions
- **AI cost ratio** = Σ settled provider cost of all AI calls in a billing month ÷ Σ plan revenue for the same month. It is computed per plan, per country and in total.
- **Target:** **20–25 %** of plan revenue [O]. Basis = the plan price paid, as the owner stated. The dashboard also shows the ratio on **net** revenue (after payment fees and tax), because fees (OD-04 / OD-11) and tax (OD-12) are unknown [U].
- **Server-side only.** Every AI call goes through one server gate (§4). The browser only displays remaining allowances. Its timers and counters are never trusted.

## 2. Cost ledger: what is recorded for every AI call
| Field | Example |
|---|---|
| `user_id`, `plan_id`, `country`, `billing_month` | u_123, `all_access`, UZ, 2026-12 |
| `feature` | `live_voice`, `speaking_assessment`, `writing_assessment`, `practice_answer` (lessons, "Jim qolma!", any assessed answer), `coach_chat`, `tts_uz`, `free_demo`, `topup_*` |
| `provider`, `model`, `voice`, `region` | openai, `gpt-realtime-2.1-mini`, marin, eu |
| `units` | audio seconds in/out, characters, tokens in/out/cached |
| `cost_reserved_usd`, `cost_settled_usd`, `price_version` | from the versioned `provider_prices` table, with a source URL and date |
| `audio_session_id`, `request_id`, `reservation_id` | links to the voice architecture §5–6 |
| `source_of_units` | `provider_reported` or `estimated` (estimated rows are flagged) |

Aggregates (materialised daily) are cost by **user / plan / feature / provider / model / country / day**, with p50/p90/p99 cost per user.

## 3. Current estimate per plan [E] (FX 1 USD ≈ 12 500 so‘m [U])
Optimised unit costs from `VOICE_COST_MODEL.md` §10:
- Live voice minute: $0.02–0.05, if a cheap realtime model passes the benchmark.
- Assessed practice answer: $0.012–0.02.
- Speaking assessment (≤ 14 min): ≈ $0.15.
- Writing assessment: ≈ $0.05.
- Text coach chat: about $0.2–0.3 per month.

| Plan | Price | Revenue ≈ | **Budget 20–25 %** | Full use of every allowance | Ratio at full use | Typical use (≈ 30 % of allowances) | Ratio, typical |
|---|---|---|---|---|---|---|---|
| GENERAL | 69 000 | $5.52 | **$1.10–1.38** (13 800–17 250 so‘m) | 60 min $1.2–3.0 + 150 answers $1.8–3.0 + chat $0.2 = **$3.2–6.2** | 58–112 % | $1.0–1.9 | 17–34 % |
| EXAM | 99 000 | $7.92 | **$1.58–1.98** (19 800–24 750) | 30 min $0.6–1.5 + 10 speaking $1.5 + 10 writing $0.5 + 150 answers $1.8–3.0 + chat $0.2 = **$4.6–6.7** | 58–85 % | $1.4–2.0 | 18–25 % |
| ALL ACCESS | 129 000 | $10.32 | **$2.06–2.58** (25 800–32 250) | 60 min $1.2–3.0 + 20 speaking $3.0 + 20 writing $1.0 + 150 answers $1.8–3.0 + chat $0.3 = **$7.3–10.3** | 71–100 % | $2.2–3.1 | 21–30 % |
| FREE | 0 | — | global free budget (§7) | one 3-min demo $0.06–0.15 + small daily AI | — | — | — |

**Key fact for the owner:** a user who uses **every** allowance to the end costs **roughly 2.5–5× the 20–25 % budget**. The target holds only on **average**, with typical usage, cheap passing models and optimised assessment. The 30-day test measures exactly this (`PRICING_TEST_30D_REVIEW.md`).

## 4. The limit stack (checked server-side before every AI call)
A call proceeds only if **all** of these pass, in this order, and the reservation succeeds:
1. **Global kill-switch and daily ceiling:** `AI_GLOBAL_DAILY_CALLS` / `VOICE_GLOBAL_DAILY_MINUTES`. The default is 0, which means off (current fail-closed rule).
2. **Provider health:** circuit breaker (voice architecture §7).
3. **Plan entitlement:** the feature is included in the plan.
4. **Monthly plan allowance** (minutes or units) [O].

   | Allowance | GENERAL | EXAM | ALL ACCESS |
   |---|---|---|---|
   | Live voice | 60 min | 30 min | 60 min |
   | Speaking assessments | — | 10 | 20 |
   | Writing assessments | — | 10 | 20 |
5. **Daily cap on assessed answers:** **5 per day** across lessons, "Jim qolma!" and any other AI-costing answer [O]. Unassessed browser-only practice (no provider cost) is not limited.
6. **Per-user monthly cost ceiling** (§5).
7. **Plan-level budget state** (§5): this may route to a cheaper model. It never silently lowers quality without labelling it.
8. **Extra credits** (`AI_CREDIT_TOPUP_SPEC.md`): used only after the plan allowance is exhausted.

On refusal the UI states the reason and what still works. For example: "Bugungi 5 ta AI baholash tugadi — ertaga yana. Darslar va testlar ishlayveradi." (Today's 5 AI assessments are used up — more tomorrow. Lessons and tests keep working.) No fake answer and no hidden degradation.

## 5. How the 20–25 % target is enforced without breaking promises [R]
Advertised allowances, such as "60 daqiqa", must be deliverable, or the pricing page would mislead. Two layers do this:
- **Per-user hard ceiling** = cost of that user's **full advertised allowance at the worst-case unit cost**, plus 10 %. It is an emergency stop against bugs and abuse, and it never cuts an honest user before their advertised limit.
- **Plan-level target 20–25 %** is managed by **automatic server levers**, applied in this order and each logged:
  1. Prompt caching and history summarisation (voice cost model §3).
  2. Shorter TTS feedback, using cached fixed phrases.
  3. Pronunciation assessed on a 3-minute sample of a speaking mock instead of all 14 minutes (the score is labelled as sample-based).
  4. Routing to the cheapest model that **passed** the acceptance gates for that feature.

  Alerts:
  - The owner is alerted when a plan's month-to-date ratio exceeds **22 %**.
  - If it exceeds **25 % for 3 days in a row**, the server proposes a limit change for the **next** cycle, and the owner approves.

  Advertised limits are never reduced in the middle of a paid period.
- **Strict mode (optional switch, off by default):** a per-user ceiling equal to 25 % of that user's plan price. This is only allowed if the pricing page shows the limits as "fair use up to …". It is recorded as a separate owner decision.

## 6. Reservation and settlement (reuse of `FINAL_AI_CREDIT_SPEC.md`)
- **Reserve:**
  - Live voice reserves `min(remaining minutes, session cap)` × the worst-case cost per minute.
  - A speaking assessment reserves one unit plus the worst-case cost of 14 minutes.
  - A practice answer reserves one of the 5 daily answers plus its worst-case cost.
- **Settle** on provider-reported usage. Minutes count by actual billed seconds, rounded up to the next second. Units count only when a result was delivered.
- **Failed or empty provider results** release the unit and the reservation. The learner is not charged for our failure.
- **Crash recovery and duplicate prevention** follow FINAL_AI_CREDIT_SPEC §5. Day boundaries follow the learner's local day (`localDayKey`), as in §7 of that spec.

## 7. FREE demo and anti-abuse [O + R]
- **Rule [O]:** one live voice demo per person, **max 3 minutes**, once.
- **Recommended protection** (several signals; any one already used blocks the demo):
  1. **Verified phone number.** Store only a salted hash, never the raw number. One demo per number. The SMS/OTP or Telegram-login provider is an open decision (OD-26).
  2. Device signal: a random device id kept in browser storage. It is easy to clear, so it is never the only signal.
  3. IP and network rate limits: e.g. at most 3 demos per IP per day, so mobile carrier NAT does not block a whole city.
  4. **Global daily demo budget:** e.g. $5/day in the test [E], so mass abuse has a bounded cost.
  5. The demo runs on the cheapest passing model, Savage is off, and the session hard-stops at 180 s with an on-screen timer.
- **Privacy:** phone hashes and device ids are personal data. Retention follows OD-07, and they are listed in the privacy notice.

## 8. Pricing-page copy (EXAM vs GENERAL voice minutes) [O]
> **Exam Preparation** — 30 daqiqa jonli AI suhbat **va qo‘shimcha 10 ta to‘liq Speaking mock baholash** (har biri 14 daqiqagacha, IELTS formatida). Imtihonga tayyorgarlikda asosiy vaqtingiz baholanadigan mocklarga ketadi, shuning uchun jonli suhbat daqiqasi General English'dagidan kam.
> **General English** — 60 daqiqa jonli AI suhbat: kundalik gaplashish va so‘zlashuvni mashq qilish uchun.

*(English gloss: Exam Preparation gives 30 minutes of live AI conversation **plus 10 full Speaking mock assessments**, each up to 14 minutes in IELTS format. Most exam-prep time goes into scored mocks, so live minutes are lower than in General English. General English gives 60 minutes of live AI conversation for everyday speaking practice.)*

## 9. Dashboards and reports (owner view)
- AI cost ratio per plan, month to date and projected, against the 20 % and 25 % lines.
- Cost per user: p50 / p90 / p99, and the top 1 % of users with their feature mix (abuse check).
- Cost per unit per provider and model, measured and compared with the list price.
- Allowance use: % of users who hit each limit, and the minutes and units used by percentile.
- Free demo: demos per day, cost, blocked repeat attempts.
- Lever activations (§5) with timestamps.

## 10. Open items
- **OD-26:** method for verifying one person per demo (SMS provider, Telegram login, other).
- **OD-27:** credit pack prices and expiry (`AI_CREDIT_TOPUP_SPEC.md`).
- **OD-12:** tax.
- **OD-04 / OD-11:** payment fees.
- The FX rate source for USD-priced providers (recommended: Central Bank of Uzbekistan daily rate, stored per day) [U].
