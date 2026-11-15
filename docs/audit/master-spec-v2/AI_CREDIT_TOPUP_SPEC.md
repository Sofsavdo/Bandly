# AI Credit Top-up Spec (extra AI beyond the plan)

Status: **design only, owner decision OD-25 item 7 (2026-11-15).** Pack prices are not set: the formula is fixed, the numbers come after the 30-day test (OD-27). Nothing is implemented, and production prices and subscriptions are unchanged.

## 1. What can be bought
| Pack (example names) | Contents | Who can buy |
|---|---|---|
| **Voice +30** | 30 extra live AI voice minutes | paid subscribers [R]; FREE users only if the owner allows it (OD-27) |
| **Speaking +5** | 5 extra full Speaking assessments (each ≤ 14 min) | EXAM, ALL ACCESS |
| **Writing +10** | 10 extra Writing assessments | EXAM, ALL ACCESS |
| **Practice +25** | 25 extra assessed practice answers (lessons, "Jim qolma!"); spending is still capped at 10 per day so the 5-a-day habit stays | all paid plans |

Packs are sold in **feature units, not abstract tokens**, so the learner knows what they get. Internally each unit maps to ledger credits (`phase-0.2/FINAL_AI_CREDIT_SPEC.md` §1).

## 2. Price formula [R]
`pack_price ≥ (units × measured p90 unit cost × FX × (1 + payment fee + tax)) ÷ target_ratio`, rounded up to 1 000 so‘m.
- `target_ratio` = 0.25 by default: packs keep the same 20–25 % AI cost share as plans.
- The **p90** unit cost (not the average) is used, because buyers of packs are heavy users.

Illustration only. These are list-price estimates, FX 12 500, with fees and tax set to 0 because they are unknown. **They are not a price proposal.**

| Pack | Units × unit cost | Cost ≈ | Price at 25 % ≈ |
|---|---|---|---|
| Voice +30 | 30 × $0.03 | $0.90 | ≈ 45 000 so‘m |
| Speaking +5 | 5 × $0.15 | $0.75 | ≈ 38 000 so‘m |
| Writing +10 | 10 × $0.05 | $0.50 | ≈ 25 000 so‘m |
| Practice +25 | 25 × $0.02 | $0.50 | ≈ 25 000 so‘m |

Sanity rule: a pack must not make the upgrade look pointless. For example, two Voice +30 packs on GENERAL should cost more than the difference between GENERAL and ALL ACCESS, unless the owner wants packs to be the cheaper path.

## 3. Rules [R]
1. **Order of use:** plan allowance first, then pack units, oldest pack first.
2. **Validity:** a pack is valid for **90 days** from purchase. Expiry is shown at checkout and in the account. Consumer-law check for expiry [U].
3. **No cash value**, not transferable. Refund only for unused units within the period required by law. The refund amount is a ledger reversal (append-only).
4. The daily cap on assessed practice answers rises to **10/day** only while Practice units remain. Live voice packs keep the per-session cap.
5. **Cancellation:** if a subscription ends, unused pack units stay valid until their expiry, but only features included in a plan the user holds can use them. For example, Speaking units need EXAM or ALL ACCESS [R; OD-27].
6. **Price shown before purchase,** charged once, in so‘m for UZ (country price rows for KZ/KG/TJ later).

## 4. Ledger and payment flow
1. **Checkout:** `PaymentProvider.createCheckout(pack_id, country_price_row)`. This is the existing provider abstraction in `MONETIZATION_SPEC.md` §4; Hamyon (UZ) is still unproven (OD-04).
2. **Webhook** (signature checked, idempotent, durable inbox) → an append-only purchase row, then ledger entry `topup_credit` with the units, `expires_at` and `price_version`.
3. **Consumption:** the gate (`AI_COST_CONTROL_SPEC.md` §4, step 8) reserves from pack units only after the plan allowance is empty. Settlement is as for plan units.
4. **Expiry job:** turns expired units into `topup_expired` entries; nothing is deleted.
5. **Reporting:** pack revenue and pack AI cost are reported separately and also inside the plan ratio dashboard.

## 5. UX
- When a limit is reached, the learner sees what is used up, when it resets, and the matching pack with its price.
- There is no auto-renew of packs. There are no dark patterns: no pre-checked boxes and no countdown pressure.
- Pack purchase history is listed in the account, with remaining units and expiry dates.

## 6. Open decisions
- **OD-27:** pack list, final prices, validity period, whether FREE users may buy, and the behaviour after cancellation.
- **OD-04 / OD-11:** payment provider.
- **OD-12:** tax.
