---
name: growth-marketing
description: Sellzen growth, virality and retention. Use for product-led growth and acquisition loops in Uzbekistan/Central Asia — referral rewards (server/referral.ts), the Creator Program and commission attribution (server/creator.ts), duels, weekly leagues, share cards and shareable achievements, speaking challenges, UGC and Telegram/Instagram/TikTok campaigns, Telegram bot reminders, onboarding conversion, retention mechanics, growth experiments, CAC/LTV and marketing analytics.
---

# growth-marketing — Sellzen

Read `../../CONTEXT.md` first (§2 Growth/Analytics rows, §3 statuses) and `docs/SELLZEN_ANALYSIS_2026-11.md` (competitors and growth plan).

## Scope
Design and implement growth mechanics that move **paid conversion and retention**, not vanity metrics.

## Required repository inspection
1. Existing loops: `server/referral.ts` (ref codes, `attachReferral` at sign-up, `maybeRewardReferral` after first lesson/placement, `REF_XP` to both), `src/lib/referral.ts` (`captureRef` from `?ref=`, `#…?ref=`, Telegram `tgWebAppStartParam=ref_`), `src/components/InviteCard.tsx`.
2. Creator: `server/creator.ts` (`creatorStats`, `creatorsOverview`, `CREATOR_COMMISSION_PCT` — attribution only, no payouts), `src/pages/Creator.tsx`, role `creator`.
3. Social/competitive: duels (`/api/duel/*`, `src/pages/Duel.tsx` — share via `t.me/share/url`), leagues (`server/league.ts`, `server/leagueNotify.ts`), groups (`server/groups.ts`), boss fights, quests (`src/components/QuestsCard.tsx`), streak reminders (`server/reminders.ts`, `TG_REMINDERS`).
4. Shareables: `src/lib/shareCard.ts`, certificates + public verify page, placement result share (Telegram link on `src/pages/Placement.tsx`).
5. Funnel gates: `src/lib/setupGate.ts` (guest can see `#/`, `#/welcome`, `#/placement`, `#/pricing`), free quotas `server/freeQuota.ts`.
6. Measurement: `server/analytics.ts` (DAU/WAU/MAU by XP activity, D1/D7/D30, funnel steps, revenue, AI USD), `wallStats` (paywall → conversion), `refStats`, `creatorStats`.
7. Specs: `docs/audit/master-spec-v2/CREATOR_PROGRAM_SPEC.md`, `ANALYTICS_SPEC.md`; OD-14 (creator rules), OD-19 (no score guarantees), OD-20 (B2B schools).

## Market facts to design for
- Telegram is the dominant channel in Uzbekistan (auth, Mini App, sharing, IELTS channels). Instagram Reels and TikTok drive discovery.
- Competitors (2026-11): many free mock sites (multitest.uz, mocky.uz, mymockexam.uz, mockcenter.uz), ENWIS, CEFR AI (~29k UZS/mo), ScoreUp (Android), IELTS Buddy (Telegram Mini App), Makon AI (funded, 50k+ users). Mock tests alone are not a differentiator; Sellzen's edge is the Uzbek-explaining AI tutor + A1→exam path + game mechanics.
- Learn from GoPrep, Duolingo, Praktika at the level of *principles* (streaks, leagues, shareable progress, social proof, AI conversation as hero feature). Do not copy proprietary UI, names, art or copy.

## Original mechanics backlog (validate each with a metric before building big)
1. **Shareable result cards** (placement level, mock band, streak, league finish) as 1080×1920 PNG via `shareCard.ts`, with `?ref=` code embedded.
2. **Guest-viewable duel invite**: show challenger and score, require Telegram login only to play (needs a gate exception for `#/duel/<code>` — coordinate with product-architect/qa).
3. **Speaking challenges**: weekly prompt, 60-second answer with AI feedback, opt-in public leaderboard by fluency metrics (no audio stored unless explicit consent and policy).
4. **Two-sided referral reward in plan days** (e.g. +7 days All Access) instead of only XP — requires monetization-engineer sign-off on cost.
5. **Creator program**: unique code → attribution (exists) → commission on *paid* revenue (exists as % calc) → payout ledger and fraud rules (missing; OD-14).
6. **Teacher/centre groups free** (`groups.ts`) as B2B2C acquisition; homework reports for teachers.
7. **League announcements** in a Telegram channel (top-10 nicknames, opt-out respected).

## Standards
- Every experiment has: hypothesis, primary metric (signup→activation, D7, paid conversion, referral K-factor = invites sent × acceptance × activation), guardrail metric (AI cost/user, refund/cancel, spam reports), duration, and decision rule.
- Attribution must be server-side and first-touch with a 30-day window (current `captureRef` behaviour); self-referral and multi-account farming blocked (same `tg_id`, rewards only after real activity — keep `maybeRewardReferral` condition).
- Rewards that cost money (AI minutes, plan days) are capped per referrer per month.
- Messaging honesty: no guaranteed band scores (OD-19), no "official" claims, 18+ persona content only for opted-in adults and never in ads targeting minors.
- Privacy: public leaderboards use nicknames; never expose Telegram ids, full names or photos without consent.

## Project-specific rules
- Referral rewards today are XP (`REF_XP`, default 100, max 150) to both sides after the invitee's first lesson or placement; changing to plan days or AI minutes needs monetization-engineer sign-off.
- Creator commission is computed only when `CREATOR_COMMISSION_PCT` is set; there are no payouts — never promise creators automatic payments until a payout ledger exists (OD-14).
- Guest access is limited to `#/`, `#/welcome`, `#/placement`, `#/pricing`; any new guest route must keep AI/voice behind sign-in and quotas.
- Share links must point to `https://sellzen.uz/…` (not the railway.app domain; `brand.test.ts` checks SEO files) and carry `?ref=<code>` for signed-in sharers.
- Telegram bot username is still `@Bandly_robot`; user-visible copy must say Sellzen.

## Workflow
1. Define the loop as a diagram: trigger → action → share → recipient landing → activation → reward.
2. Check what exists (inspection list); extend instead of rebuilding.
3. Estimate economics: reward cost, expected conversion lift, payback (with monetization-engineer).
4. Implement minimal version + measurement (server counters or analytics funnel step).
5. Write the experiment readout template the owner will fill after 14–30 days.

## Testing requirements
Server tests for attribution and reward idempotency (`server/referral.test.ts`, `src/lib/referral.test.ts`, `server/creator.test.ts`), abuse cases (self-referral, repeated rewards, reward before activity), and gate tests if routes open to guests (`setupGate.test.ts`).

## Common mistakes to avoid
- Optimising views/downloads instead of paid conversion and retention.
- Rewards granted at sign-up (farmable) instead of after activity.
- Opening paid features to guests to "go viral" without cost caps.
- Copying a competitor's branded mechanic or copy.
- Shipping a loop without a way to measure it.

## Deliverables
Loop diagram, experiment brief, implementation + tests, measurement plan with queries/endpoints, and expected CAC/LTV impact with assumptions.
