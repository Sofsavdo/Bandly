# Exam Preparation Spec (verification list)

Legend: **[F]** verified · **[R]** recommendation · **[U]** unresolved. Nothing here is implemented.

**SAT (digital):** official College Board current specification for: number of sections/modules, timing, question counts, adaptive module routing rules, score scale and what scores are reported, allowed calculator/tools, question types (student-produced response), accessibility accommodations. Date-stamp every fact; we do not simulate adaptivity unless the routing rule is published.
**IELTS:** current official format for Academic and General Training (section timing, task rules, band-score conversion publication). IELTS conversion tables used today in `lib/band.ts` must be re-verified.
**CEFR — two separate layers:**
- *Global proficiency:* CEFR descriptors (Council of Europe CEFR + Companion Volume) used for General English levels A1–C2. Internal level labels are "CEFR-aligned", never "certified".
- *Country-specific CEFR exams:* e.g., national multilevel/CEFR exam formats used in Uzbekistan, Kazakhstan, etc. **[U]** exact formats, issuers and rules per country are unknown and must be obtained from the official issuer before any module is designed; each country gets its own `exam_format` record.
Question banks: original items only; provenance and licence recorded per item.

## Acceptance additions from source C3
Each IELTS skill offers **Learn / Practice / Exam** modes. Reading: passage+questions side by side, highlight and notes, question navigator, flag for review, timer, saved answers, per-question explanations, accuracy by question type. Listening: four sections, audio player, replay limits in exam mode, transcript only after the exercise/learn mode, spelling-error detection. Writing: Task 1/2 separate, word count, timer, draft autosave, rubric feedback labelled "AI estimate", revision history and first-vs-revised comparison. Full exam: real-exam environment, answer sheet, detailed result.

## CEFR Multilevel (Uzbekistan) — verified 2026-11-14
Sources read in full: Cabinet of Ministers resolution No. 73 of 16.02.2022 (lex.uz, text including amendments up to resolution No. 411 of 29.07.2026), clauses 22, 27, 31; UzBMB Bulletin 1/2023 (A.A. Abbosov), Table 1.
- **[F]** Multi-level format covers B1, B2, C1 (English since 1 March 2022).
- **[F]** Listening 35 items / 45 min; Reading 35 items / 60 min; Writing 2 tasks (100–150 and 200–250 words) / 60 min; Speaking 3 task types / 15 min.
- **[F]** Listening and Reading are reported as standard scores (Rasch model); Writing and Speaking are rated by human raters. Cut-offs (2023): C1 65–75, B2 51–64, B1 38–50, below B1 1–37 (may have changed since).
- **[U]** Number of parts per section and exact task types: not in these official texts; third-party sites disagree (e.g. speaking described as 3 or 4 parts). Not used in the product.
- Implemented: `src/content/examFormats.ts` (format with per-field provenance), Exam → CEFR tab (`CefrPrep.tsx`): verified structure and cut-offs, learner's CEFR estimates (clearly not a Multilevel score), free practice links, writing practice in the official word ranges (rule-based check with min/max words). No official materials reproduced.
