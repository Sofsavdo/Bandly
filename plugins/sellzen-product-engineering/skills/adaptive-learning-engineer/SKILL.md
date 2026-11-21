---
name: adaptive-learning-engineer
description: Sellzen adaptive learning engine. Use for mastery modelling (src/lib/adaptive/mastery.ts), error taxonomy, weakness detection, spaced repetition (srs.ts, Leitner), daily plans and recommendations (recommend.ts planDay, dailyPlan.ts), prerequisite graphs (curriculum graph.ts), exam-deadline and available-time planning, progress prediction (progress.ts, readiness.ts), recording attempts from lessons/tests (adaptive/record.ts, mistakes.ts), and cross-device synchronisation or server-side persistence of learner mastery data.
---

# adaptive-learning-engineer — Sellzen

Read `../../CONTEXT.md` first (§2 Adaptive row, §3 status "Adaptive engine: U", §6 R8).

## Scope and principle
Deterministic algorithms make every learning and scoring decision. An LLM may **phrase** explanations and plan rationales; it never selects tasks, changes mastery, or scores (see header comment of `src/lib/adaptive/recommend.ts`).

## Required repository inspection
1. `src/lib/adaptive/mastery.ts` — `PARAMS` (k, kEarly, tau per state, thresholds, intervals), `update`, `effectiveMastery` (forgetting decay), `stateOf` (`new|learning|known|needs_revision|mastered`), `reviewIntervalDays`. Note: constants are uncalibrated hypotheses.
2. `src/lib/adaptive/taxonomy.ts` (35 ids like `G.article`, `G.tense`, `W.task_response`, `S.fluency`), `graph.ts` (`validateGraph`, cycle detection, `uncoveredTaxonomy`), `recommend.ts` (weights `W`, `PREREQ_MIN`, `planDay`, `explain`, `adjustLoad`, reason codes).
3. `src/lib/adaptive/record.ts` (where attempts come from: grammar items, practice, words, reading/listening question types) and `store.ts` (`bandly.mastery.v1`, last 30 errors).
4. Other learner-model pieces that must stay consistent: `src/lib/srs.ts` (word boxes 1/3/7/14/30), `src/lib/mistakes.ts`, `src/lib/history.ts`, `src/lib/progress.ts` (band estimates, `BAND_CAP`, hours-per-band), `src/lib/readiness.ts`, `src/lib/dailyPlan.ts`, `src/lib/planPrefs.ts`, `src/lib/planLog.ts`, `src/lib/placement.ts`.
5. Curriculum inputs: `src/content/curriculum/inventory.ts` (legacy nodes), `pilot.ts` (9 draft nodes), lesson `status` in `src/content/lessons/*`.
6. Sync: `src/lib/cloud.ts`, `src/lib/cloudBoot.ts` (`syncable`), `src/lib/progressMerge.ts` (record-level merge rules for `bandly.mastery.v1`), server `putProgress`/`getProgress` in `server/db.ts`.
7. Spec: `docs/audit/master-spec-v2/ADAPTIVE_LEARNING_SPEC.md`.

## What the engine must consider (map each to code before changing anything)
| Signal | Current implementation |
|---|---|
| Current mastery | `MasteryRecord.m` + `effectiveMastery(now)` |
| Repeated errors | `recentErrors` (last 10 used) → `repeated_error` reason |
| Forgotten knowledge | exponential decay by state `tau`; `needs_revision` state; `dueAt` |
| Learning goals | `goalTags` (e.g. `ielts-writing-2`, `general`) |
| Exam deadlines | `examDate` → `exam_soon` weight `W.exam` |
| Prerequisites | node `prerequisites`, `PREREQ_MIN` 0.6, `assumed` from placement |
| Available time | `PlanOptions.minutes`, `adjustLoad` |

## Technical standards
- Pure functions, injected clock (`now`) and local day key (`localDayKey`); no `Date.now()` inside algorithms. Seeded PRNG for property tests (see `adaptive.test.ts`).
- Invariants to keep (tested): wrong never raises mastery; correct never lowers it; no "mastered" in a single day (`masteredMinDays`); bounds 0..1; plan respects minutes budget; deterministic output for identical input.
- Parameter changes require: rationale, before/after simulation on synthetic learners, and a note that calibration with real data is pending (or the data you used).
- Only `approved`/`published` curriculum nodes may be scheduled for learners; `pilot` lessons are shown with their label; `draft` never.
- Keep mastery keyed by stable ids (taxonomy ids / node ids). Renaming ids orphans users' data — write a migration in `progressMerge`/store load if unavoidable.

## Project-specific rules
- Mastery is keyed by taxonomy/node ids in `bandly.mastery.v1`; a breaking shape change needs a new key version (`…v2`) with a loader that migrates `v1`, plus a `progressMerge` rule for the new key.
- Placement (`src/lib/placement.ts`) sets `profile.level`; levels below it are passed as `assumed` prerequisites — don't force A1 grammar on a B2 learner.
- Band/progress estimates go through `src/lib/progress.ts` (`BAND_CAP`: low-level tests can't show high bands; "≈150 hours per band" is a heuristic) and are always labelled taxminiy.
- Day boundaries: adaptive uses the learner's **local** day key; server XP/quotas use **Tashkent** time (`server/day.ts`). Keep that distinction explicit when moving logic server-side.
- Exam goals come from onboarding (`src/lib/onboarding.ts`, `planPrefs.ts`): target band, exam date, minutes/day — use them, don't ask again.

## Cross-device and server-side persistence
Today mastery syncs inside the opaque progress blob (works across devices; merge = latest `lastSeen` per node; errors merged). Limits: server cannot query it, 600 KB blob cap, conflicts resolved client-side.
If the task requires server-side learner data (teacher dashboards, calibration, server-chosen plans):
1. Add explicit tables (e.g. `mastery(player_id, node_id, m, attempts, distinct_days, last_seen, due_at, …)` and `attempts` append-only) via backend-architect's additive pattern.
2. Dual-write: client continues the blob, plus `POST` batched attempts to the server; server recomputes mastery with the **same** pure functions (import from `src/lib/adaptive/*` — they are framework-free) so results are identical.
3. Backfill from existing blobs once, idempotently, behind an admin endpoint; verify parity on a sample before switching reads.
4. Never drop the blob path until all clients are migrated.

## Workflow
1. Identify which signal/decision the task changes; locate the exact function.
2. Write the expected behaviour as test cases first (learner scenarios with timestamps).
3. Implement; run `npx tsx src/lib/adaptive/adaptive.test.ts`, `record.test.ts`, `src/lib/progressMerge.test.ts`, `src/lib/daily.test.ts`, `src/lib/progress.test.ts`, `src/lib/readiness.test.ts`; then `npm run test:ci`.
4. Explain the user-visible effect (what the daily plan will now show and why) in Uzbek-friendly terms for the UI copy (via frontend-engineer).

## Testing requirements
Scenario tests (new learner, returning after 30 days, repeated article errors, exam in 10 days with 20 min/day), merge tests for two devices editing the same node, property tests for invariants. Append new files to `package.json` `test`.

## Common mistakes to avoid
- Letting an LLM decide what is "mastered" or which lesson comes next.
- Using wall-clock `Date.now()` inside the model (untestable, timezone bugs).
- Scheduling draft/pilot-unreviewed nodes as if approved.
- Changing merge semantics without a two-device test (data loss risk).
- Treating SRS (words) and mastery (skills) as duplicate systems to delete — they serve different granularity; integrate, don't remove.
- Presenting progress predictions (hours to band) as guarantees.

## Deliverables
Algorithm change + scenario/property tests, parameter rationale, data-migration notes for stored records, and a short explanation of user-visible impact.
