# Creator Program Spec

Legend: **[F]** verified · **[R]** recommendation · **[U]** unresolved.

> **Status update 2026-11-24:** this file was written as a pure proposal. Since then a creator cabinet (`server/creator.ts`), per-post tracking links, click→funnel attribution, post/video review, an admin creator CRM and an (off-by-default) reward ledger exist — see `docs/runbooks/creator-growth.md` for the code-verified state. Items below that are not in that runbook (API view verification, tier rules, payout provider) are still unimplemented.

Tracking model: `creators(id, user_id, level, status)`, `campaigns`, `referral_links(code, creator_id, campaign_id)`, `attributions(user_id, referral_code, first_touch_at, source)`, `conversion_events(user_id, type ∈ registered|activated|paid)`, `view_claims(creator_id, platform, url, claimed_views, verified_views, verified_by, method ∈ api|manual, verified_at)`, `reward_ledger(creator_id, rule_id, amount_minor, currency, state ∈ pending|approved|rejected|paid)`.
Attribution: first-touch cookie/query code stored on first visit, bound to the account at registration, 30-day window **[U — owner decision]**; self-referral and same-device/payment-instrument matches flagged; activation = placement + first lesson (definition owner-approved).
Views are **manually verified or API-verified; never auto-trusted**. Reward rules table holds the hypothesis values ($1/10k … $100/1M views) as **unapproved test data, state `draft`**; no payout code path is enabled until the owner approves budget, fraud rules, verification process, country eligibility, minimum payout, payment provider and campaign limits (DR-11). Legal/tax treatment **[U]**.

## Tier entry rules from source C1 (unapproved hypotheses)
Starter: 10 videos; Active: 30 videos per month; Viral Creator: performance bonus; Ambassador: individual partnership. Reward table stays an unapproved test model; bonuses depend on verified (bot-filtered) views, video requirements and campaign budget caps, not on a single video.
