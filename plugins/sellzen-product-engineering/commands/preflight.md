---
description: Pre-merge checklist for a Sellzen change — tests, i18n, answer-key leak check, invariants review
argument-hint: "[base ref, default origin/main]"
---

Run the Sellzen pre-merge preflight against base **$ARGUMENTS** (default `origin/main`).

1. `git diff --stat <base>...HEAD` — summarise what changed and which products/invariants it touches (this plugin's `CONTEXT.md` §4).
2. Run, in order, and quote the real output tail of each:
   - `npm run i18n:check`
   - `npm run build`
   - `npx tsx scripts/build/chunks.test.ts` (answer keys not in `dist`)
   - `npm test`
   - `npm run test:backup` if backup code changed
3. Confirm every new `*.test.ts` file appears in the `test` script of `package.json`.
4. If the diff touches `server/payments.ts`, `server/hamyon.ts`, `server/entitle.ts`, `server/freeQuota.ts`, `server/ai.ts`, `server/live.ts`, `server/stt.ts`, `server/tts.ts`, `server/mockGrade.ts`, `server/db.ts`, `src/lib/cloud*.ts`, `src/lib/progressMerge.ts` or any `src/content/*Tests.ts`, run the `release-gatekeeper` agent on the diff.
5. List regression risks (routes, guest gates, sync, quotas, bundle size delta of `dist/assets/app-*.js`).
6. Verdict: READY / READY WITH NOTES / NOT READY. Never report a step as passed unless it ran in this session.
