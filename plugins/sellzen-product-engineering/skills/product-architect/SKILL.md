---
name: product-architect
description: Sellzen product architecture and strategy. Use when deciding what to build or in what order for Sellzen — feature prioritisation, roadmap, user journeys, UX flows, business logic, how General English, Exam Preparation and Mock Arena relate, cross-product integration, duplicated or inconsistent product logic, technical-debt prioritisation, or turning an owner request into a scoped plan. Not for writing UI code (frontend-engineer) or pricing math (monetization-engineer).
---

# product-architect — Sellzen

Read `../../CONTEXT.md` (relative to this file) before anything else, and `../../ROUTING.md` when the task spans several skills.

## Scope
- Product boundaries between **A. General English**, **B. Exam Preparation**, **C. Mock Arena** and the **shared intelligence layer**.
- Roadmap and prioritisation; scoping owner requests into PR-sized steps.
- User journeys: guest → placement → onboarding plan (`#/start`) → daily plan → lessons/exams → paywall → payment → retention loops.
- Business rules: free tier, what each plan unlocks, what is shared, how progress flows between products.
- Technical-debt triage with business impact.

## Required repository inspection
1. Route table and gates: `src/App.tsx` (`routes`), `src/lib/setupGate.ts` (`PUBLIC`, `FREE`, `authRoute`, `setupRoute`).
2. Plans and what they unlock: `src/config.ts` (`SALE_PLANS`, `TRACK_NAME`, `planForTrack`), `server/entitle.ts` (`planOf`, `assessLimit`), `server/freeQuota.ts` (free lessons/day, weekly free AI).
3. Navigation/IA: `src/components/Header.tsx`, `TabBar`, `sectionOf` usage in `App.tsx`.
4. Home and onboarding: `src/pages/Home.tsx`, `src/pages/Start.tsx`, `src/pages/Placement.tsx`, `src/lib/onboarding.ts`, `src/lib/dailyPlan.ts`.
5. Owner intent and open decisions: `docs/audit/master-spec-v2/PRODUCT_ARCHITECTURE.md`, `MASTER_PRODUCT_SPEC.md`, `ROADMAP_RECONCILIATION.md`, `docs/audit/phase-0.2/OWNER_DECISION_REGISTER.md`.
6. Reality check: `CONTEXT.md` §3 status table, then confirm the specific rows you depend on in code (`grep -rn` the feature) — a page existing is not proof it works.
7. Usage evidence when available: `/api/admin/analytics` output supplied by the owner, Railway logs (via devops-cost-optimizer). Never invent usage numbers.

## Product rules specific to Sellzen
- Grammar is part of General English. The legacy TrackId `grammar` means "General English entitlement"; never resurrect a Grammar subscription.
- Mock Arena mocks are free for signed-in users and bundled in every plan. If the owner wants Mock Arena sold separately, that is an OD-08 decision — surface it, don't silently implement it.
- One learner profile across products: level (`profile.level`), target band, exam date, mastery, mistakes, history. New features must read/write these, not create product-specific copies.
- Exam Preparation consumes General English mastery (weak grammar/vocab feeds exam plans); Mock Arena results feed both (`recordTestAnswers` in `src/lib/adaptive/record.ts`, `exam_results` on the server).
- Guests see home, placement, pricing and duel invites only (`PUBLIC` in `setupGate.ts`). Opening more routes to guests is a growth/monetization trade-off — involve growth-marketing and monetization-engineer.
- Telegram is the identity layer (OD-05). Do not design flows that require email/password.
- Honesty constraints (CONTEXT §4.9–4.10) are product requirements, not legal footnotes.

## Technical standards for product decisions
- Every recommendation cites evidence: file:line, test name, Railway log line or owner-provided metric. Mark assumptions explicitly.
- Use the status vocabulary from CONTEXT.md §3 (P / U / Partial / Planned) — never "done" for unverified features.
- Specify changes as contracts: route + gate classification, entitlement (which plan/track), data written (which `bandly.*` key or table), analytics signal, i18n impact.
- A feature is not "scoped" until it has a success metric, a guardrail metric (AI cost/user, error rate) and a rollback.

## Workflow
1. Restate the request as: user, job-to-be-done, product (A/B/C/shared), success metric (activation, D7 retention, paid conversion, ARPU, AI cost/user).
2. Map current state with file references and status category (P/U/Partial/Planned).
3. Detect duplication: search for existing modules doing the same thing (`grep -rn "<concept>" src server`). Examples of past duplication risks: two plan systems (legacy tracks vs `SALE_PLANS`), two placement paths (`#/placement` vs `#/skills`), mastery vs SRS for vocabulary.
4. Options (max 3) with cost, risk, regression surface and which invariants they touch. Recommend one.
5. Break into ordered PR-sized steps; name the lead skill for each (see ROUTING.md).
6. List owner decisions required (cite OD numbers) and what can proceed without them.

## Prioritisation heuristic (use, then state your reasoning)
Score = (impact on activation/retention/revenue × confidence) ÷ effort, then apply hard overrides:
data-loss/security risks (CONTEXT §6 R1, R4) first; anything blocking payment conversion second; content quality before content quantity for paid products.

## Deliverables
- Decision memo: problem, evidence, options, recommendation, risks, metrics, owner decisions needed.
- Journey diagram (Mermaid) when flows change.
- Step plan with skill owners, files, tests and rollback notes.
- Updates to `docs/` when a product rule changes (and to `CONTEXT.md` §1/§3 in this plugin if the model itself changes).

## Testing requirements
Product decisions that change gates or plans must come with updated tests: `src/lib/setupGate.test.ts`, `src/lib/entitlement.test.ts`, `server/entitle.test.ts`, `src/lib/freeRules.test.ts`.

## Common mistakes to avoid
- Treating `docs/audit/master-spec-v2/FEATURE_INVENTORY.md` as current (it describes an older baseline).
- Proposing features that already exist (groups, creator stats, certificates, duels, leagues, reminders exist).
- Planning around a separate Grammar product or a separately priced Mock Arena without an owner decision.
- Roadmaps measured in pages/features instead of activation, retention, conversion and cost.
- Deciding owner-reserved questions (region, DB platform, pricing tests, AI budget, age policy).
