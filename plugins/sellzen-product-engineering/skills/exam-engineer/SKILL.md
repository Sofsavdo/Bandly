---
name: exam-engineer
description: Sellzen exam systems. Use for IELTS Academic/General Training, CEFR Multilevel (Uzbekistan national exam), Digital SAT practice and the Mock Arena — test formats and data (examFormats.ts, readingTests/listeningTests, mockPublic.json), timers and attempts, server-side grading (server/mockGrade.ts, /api/mock/grade), raw-to-band tables (src/lib/band.ts), AI Writing/Speaking evaluation and band validation, full-exam composition, exam ladder, certificates, mock statistics and exam analytics.
---

# exam-engineer — Sellzen

Read `../../CONTEXT.md` first (§2 Exams row, §3 exam statuses, §4 invariants 1, 2, 9).

## Scope
Exam fidelity, scoring reproducibility and answer-key security for IELTS, CEFR Multilevel, Digital SAT and Mock Arena.

## Required repository inspection
1. Formats with provenance: `src/content/examFormats.ts` (`FormatField.verified`, `source`, `verifiedAt` 2026-11-14, `notesUz`) and its test.
2. Test banks: server-only keys `src/content/readingTests.ts`, `listeningTests.ts` (+ `reading*.ts`, `listening*.ts`, `readingFull*.ts`, `listeningFull1.ts`, `ladder*.ts`, `cefrReading1.ts`, `cefrListening1.ts`); public projection `src/content/mockPublic.json` from `scripts/gen-mock-public.ts`; `src/content/mockTests.ts` (client-safe); `src/content/mockPublic.test.ts`.
3. Grading: `server/mockGrade.ts` (`gradeMock`, `gradeRequest`, attempts), `src/lib/grade.ts`, `src/lib/band.ts` (`LISTENING_TABLE`, `READING_ACADEMIC_TABLE`, `READING_GENERAL_TABLE`, `rawToBand`), `server/bands.ts`, `server/mockStats.ts`.
4. Attempts/timers: `src/lib/examAttempt.ts`, `src/components/MockTest.tsx`, `src/pages/FullExam.tsx`, `/api/exam/full`, `composeFull` in `server/certificates.ts`.
5. AI examiners: `evaluateWriting`, `evaluateSpeaking`, `parseEvaluation`, `roundBand` in `server/ai.ts`; quotas `useAssessment` in `server/entitle.ts`; rule-based fallbacks `src/lib/writingCheck.ts`, `src/lib/examiner.ts`, `src/lib/speakingReview.ts`.
6. Certificates: `server/certificates.ts` (rules per module, eligibility, `VALID_MS` 1 year, `cefrOfBand`, revoke + audit), verify page `src/pages/CertificateVerify.tsx`.
7. SAT: `src/content/satPractice.ts` (18 original items, explicitly *no SAT score*). Ladder: `src/lib/examLadder.ts`.
8. Specs: `docs/audit/master-spec-v2/EXAM_PREPARATION_SPEC.md`, `MOCK_ARENA_SPEC.md`, `docs/REAL_EXAM_EXPERIENCE_SPEC.md`.

## Technical standards
- **Official vs original**: official facts (section counts, timings, task word counts, score scales) live only in `examFormats.ts` with `source` URL and `verified: true` after reading an authoritative source (ielts.org / IDP / British Council, College Board, lex.uz or the national testing centre for Multilevel). Everything else is "Sellzen practice content". Re-verify sources yearly or when the owner reports a change; update `verifiedAt`.
- **Never invent scoring rules.** IELTS raw→band tables are approximations published for practice — label results "taxminiy"; overall band rounding per IELTS published rule (computed server-side, `roundBand`). Multilevel: use only the officially published scale/cutoffs recorded in `examFormats.ts`. SAT: do not estimate a 400–1600 score from Sellzen items.
- **Answer-key protection**: keys and evidence only in server-imported modules; client receives questions without answers; grading only via authenticated `POST /api/mock/grade`; results written server-side (`exam_results`, `recordResult`). After editing any test, regenerate `mockPublic.json` and run `chunks.test.ts` (it scans `dist` for evidence strings).
- **Reproducibility**: same answers → same score, always. Normalise free-text answers deterministically (case, whitespace, accepted variants in the key). AI-evaluated bands: strict JSON schema, bands 0–9 in 0.5 steps, criterion bands validated, overall computed by code not by the model; store model id and prompt version with the result.
- **Timers**: client shows time, server records `startedAt` for full exams and rejects compositions outside allowed windows (see `composeFull`). Don't rely on client timers for anything that issues a certificate.
- **Format fidelity**: question types per section (TFNG/YNNG, matching headings, sentence/summary completion, MCQ, map/plan labelling), section lengths and timing as in `examFormats.ts`; IELTS Academic vs GT differ in Reading and Writing Task 1 — don't mix.

## Project-specific rules
- Mock Arena is free for signed-in users and must stay server-graded (no guest grading — 401).
- Certificates only for the full exam (4 skills + overall), one-year validity; they are Sellzen practice certificates, never "official IELTS/CEFR results" — keep wording on the certificate and verify page explicit.
- AI evaluation consumes plan quota (EXAM 10, ALL 20/month; free weekly taste) — coordinate any change with monetization-engineer.
- Exam results feed adaptive learning (`recordTestAnswers`) — keep question-type tags accurate.

## Workflow
1. Identify exam + section + whether the change touches official facts, content, grading or AI evaluation.
2. For official facts: fetch and cite the authoritative source (date read). If you cannot access it, mark `verified: false` and say so.
3. Implement content in server-side modules; regenerate public JSON; update tables/tests.
4. Run `npx tsx server/mockGrade.test.ts`, `src/lib/grade.test.ts`, `src/lib/band.test.ts`, `src/content/examFormats.test.ts`, `src/content/mockPublic.test.ts`, `server/certificates.test.ts`, `src/lib/examAttempt.test.ts`, then `npm run build && npx tsx scripts/build/chunks.test.ts`, then `npm run test:ci`.

## Testing requirements
Golden tests: fixed answer sheets → expected raw and band; malformed submissions (wrong test id, extra keys, huge arrays) → 400; unauthenticated → 401; AI evaluation parser rejects out-of-range or non-0.5 bands; certificate eligibility boundaries.

## Common mistakes to avoid
- Putting `answers`/`evidence` in a file imported by a page or component.
- Calling estimated bands "your IELTS score".
- Copying Cambridge test passages or official sample items.
- Letting the model compute overall band or certificate eligibility.
- Changing a band table without a source and without updating golden tests.

## Deliverables
Format/source table, content or engine changes, regenerated public JSON, golden tests, and a statement of what is official-verified vs Sellzen-original.
