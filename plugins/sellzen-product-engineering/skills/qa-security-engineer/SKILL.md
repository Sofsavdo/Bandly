---
name: qa-security-engineer
description: Sellzen testing and security. Use when adding or reviewing tests (tsx assert suites, npm run test:ci, ad-hoc Playwright E2E), hunting regressions, or auditing security — auth and session tokens, role checks, user data isolation, payment manipulation (Hamyon callbacks, amounts, replay), subscription boundaries, AI and voice quota abuse, answer-key exposure in the bundle, prompt injection, XSS/input validation, rate limiting, secrets handling and data integrity of progress sync and XP.
---

# qa-security-engineer — Sellzen

Read `../../CONTEXT.md` first (§4 invariants, §6 risks, §7 test commands).

## Scope
Prove that critical journeys work and that money, data, limits and answer keys cannot be abused. Every important change ships with tests.

## Required repository inspection
1. Test chain: `package.json` scripts `test` (≈ 90 files, chained with `&&`), `test:ci`, `test:backup`; CI `.github/workflows/ci.yml`.
2. Test style: open 2–3 existing suites in the area (e.g. `server/payments.test.ts` fake provider server, `server/session.test.ts`, `server/entitle.test.ts`, `scripts/build/chunks.test.ts`).
3. Security-relevant code: `server/db.ts` (sessions hashed, `byToken`, `requireRole`, rate counters), `server/index.ts` (rate limiter, body limits, admin/staff endpoints, CORS/headers, URL parsing), `server/telegram.ts` (`verifyInitData`, `verifyWidget`, webhook secret), `server/hamyon.ts` (`verifySign`), `server/xp.ts` caps, `server/live.ts` (WS auth, token in query — R2; unguarded `new URL` — R1), `server/static.ts` (path traversal), `server/certificates.ts` (photo magic-byte check, public view without account data).
4. Docs: `docs/audit/master-spec-v2/SECURITY_AND_PRIVACY_SPEC.md`, `TEST_STRATEGY.md`, `docs/audit/phase-0.1/AUTH_SECURITY_SPEC.md`.

## Technical standards
- Tests are deterministic: injected `now`, seeded randomness, no network except local fake servers on port 0.
- Security fixes are server-side and covered by a regression test that fails before the fix.
- Severity: critical (money/data/keys exposure or loss), high (auth bypass, quota bypass, crash), medium (abuse with limited impact), low (hardening).

## Project-specific rules
- Known open items to keep in view: R1 (WS upgrade `new URL` crash), R2 (token in WS query), R3 (lesson content public via `/api/content` and bundle), R4 (same-volume backups) — see CONTEXT.md §6.
- The answer-key leak guard is `scripts/build/chunks.test.ts`; it only runs meaningfully after `npm run build` (it skips without `dist`).
- Production checks are read-only: no load tests or exploit attempts against sellzen.uz without explicit owner approval.

## Critical journeys (must stay green; automate where possible)
1. Guest → `#/placement` → result → Telegram login (`#/login?next=`) → `#/start` → plan → first lesson.
2. Signed-in learner on two devices: progress edits on both → merge without loss (`progressMerge`, 409 path).
3. Free learner hits lesson wall → PaySheet → payment created → (fake) Hamyon `complete` → entitlement visible in `/api/me` → gated page opens; expiry closes it.
4. Mock Arena: fetch public test → answer → `POST /api/mock/grade` → band + `exam_results` row; guest gets 401.
5. AI Writing evaluation within quota; quota exhausted → 402; provider failure → quota refunded.
6. Live call: allowance computed, seconds recorded on abrupt disconnect, limit message at the cap.
7. Certificate issue → public `/certificate/<ID>` verify → revoke shows revoked.

## Security checklist
- **AuthN**: every non-public endpoint resolves `x-token` via `byToken` (401 otherwise); tokens never logged; sessions revocable (`/api/auth/logout`); Telegram signatures verified with bot token, `auth_date` freshness.
- **AuthZ / isolation**: resource ownership enforced in SQL (`WHERE player_id = ?`); groups/teacher views check membership; staff routes `requireRole`; admin actions audited. Test cross-user access explicitly (user B with user A's ids).
- **Payments**: forged callback (bad md5) → 403; replay → no double grant; amount tampering → no grant; plan/price from client ignored; open-payment and hourly caps enforced.
- **Quotas/AI abuse**: per-user and platform ceilings checked server-side before provider calls; refund on failure; concurrency (two parallel requests at quota edge) cannot exceed limit; prompt injection in candidate text cannot change scoring rules (`<candidate>` guard + strict output validation); FORBIDDEN topics filtered.
- **Answer keys**: `chunks.test.ts` after `npm run build`; also grep `dist/` for a known answer string when you add tests.
- **Input handling**: body size limits, JSON parse errors → 400, malformed URLs → 400 (HTTP fixed; WS upgrade still R1), path traversal on static/media, file upload type by magic bytes, HTML never injected unsanitised (`dangerouslySetInnerHTML` usage review).
- **XP/leaderboard integrity**: event ids deduplicated, per-source and daily caps (`server/xp.ts`), duel score/time bounds.
- **Secrets**: none in repo (`git grep -nE "sk-ant-|AIza|sk-[A-Za-z0-9]{20}|HAMYON_SHOP_KEY="`), `.env` gitignored, Railway variables only.
- **Privacy**: audio not stored; certificate public view exposes only intended fields; analytics aggregate only.

## Workflow
1. Read the change/diff; list affected journeys and invariants.
2. Write failing tests first for bugs (reproduce), then fix (with the owning skill).
3. Run targeted suites, then `npm run test:ci`. Paste the actual tail of the output in your report.
4. For UI journeys: build, start the server with a throwaway `DB_PATH` (never production), drive with Playwright (pre-installed; `require('playwright')`, `chromium.launch()`), 360 px viewport, capture console errors and screenshots.
5. Report: what was tested, how, results, residual risks. If something could not be tested (real providers, real devices, production URL), say so explicitly.

## Testing requirements
- `node:assert/strict`, top-level `await`, in-memory DB via `createDb()` defaults used by existing tests, injected `now`, fake HTTP servers for providers (`node:http` on port 0).
- Each file ends with `console.log('<suite>: OK')` and **must be appended to `package.json` `test`**.
- Never hit real AI/payment/Telegram APIs in tests or CI.

## Common mistakes to avoid
- Declaring "tests pass" from a partial run or without output.
- Testing only the happy path of payments/quotas.
- Adding a test file but not wiring it into `npm test`.
- Using the production DB or real keys for "quick checks".
- Fixing a security issue in the UI only.

## Deliverables
Test files (wired into CI), a findings table (severity, file:line, exploit scenario, fix, test), a journey verification log, and an explicit list of what remains unverified.
