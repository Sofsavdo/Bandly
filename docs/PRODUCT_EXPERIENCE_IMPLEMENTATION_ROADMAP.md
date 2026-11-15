# Product Experience Implementation Roadmap

Status: **plan for owner review. Nothing is started.** The priority order is set by the owner: 1) Real Exam Experience, 2) Gamified Learning, 3) AI Teacher Character.

Principle: **minimal change, no rewrite.** Each step extends existing files and routes, keeps every current feature working, and is reversible.

Effort is in developer-days (d) for one full-stack developer and **excludes content production and art**, which are listed separately.

## Overview
| Phase | Scope | Needs DB/accounts? | Engineering effort | Blocking non-engineering work |
|---|---|---|---|---|
| **E1** Exam shell (client) | Focus mode, navigator, flag, highlight, notes, play-once audio, stored deadline, local autosave and resume, submit confirmation | no | 8–10 d | owner review of wireframes |
| **E2** Full-format mock content plug-in | data format for 40-question IELTS sections, CEFR and SAT full sets; SAT module routing | no | 5–7 d | **original full-length content + audio** (PXD-05), methodologist review |
| **E3** Server attempts | server deadline, autosave API, idempotent submit, keys server-side (closes gap C2) | **yes** (M5: OD-01/02) | 10–12 d | residency/legal decisions |
| **G1** Gamified learning (client) | Learning Map, hearts + re-learn, combo, refined XP/streak, quests, boss, more achievements | no | 12–15 d | boss content check, map illustrations |
| **G2** Server gamification | server-computed XP, leagues/tiers, cross-device sync | **yes** (M3/M5) | 8–10 d | OD-26 (identity) |
| **T1** Teacher character in UI | character component with expression layers, mouth sync to the TTS clip, states, persona mapping | no | 6–8 d | **art set** (PXD-13), female voice choice (PXD-07) |
| **T2** Live AI Teacher | realtime provider and minute metering, teacher on the live session | partly (ledger exists) | 10–14 d | OD-21 provider, budget |

## E1 — Exam shell (first)
- **Scope:** `REAL_EXAM_EXPERIENCE_SPEC.md` §4 and §6 (E1 column) for the **existing** mini-tests and `FullExam`.
- **Existing code dependencies:** `MockTest.tsx`, `QuestionList.tsx`, `hooks.ts` (`useCountdown`), `Listening.tsx` (FilePlayer), `Reading.tsx`, `FullExam.tsx`, `App.tsx` routes, `styles.css`.
- **Backend:** none.
- **DB:** none; local storage key `bandly.attempts.v1`.
- **AI:** none.
- **UI components:** ExamShell (focus layout), Timer (deadline-based), QuestionNavigator, FlagButton, Highlighter, NotesPanel, ExamAudioPlayer (play-once), SubmitDialog, ResumeBanner.
- **Complexity:** medium. Highlighting across re-renders is the hardest part.
- **Acceptance criteria:** REAL_EXAM §6 tests (reload, kill tab, double submit, offline); no gamification on screen; 360 px layout.
- **Testing:** unit tests for the deadline, the autosave reducer and the navigator; Playwright on mobile and desktop.
- **Rollback:** a feature flag `exam_shell_v2`; the old `MockTest` stays for one release.
- **Release:** behind the flag for owner testing → 10 % of users (by local flag) → all.

## E2 — Full-format mocks
- **Scope:**
  - content schema for full sections (40 questions, parts, audio per part, Writing visuals, Speaking cards);
  - SAT 2-module routing (Module 2 easier or harder by Module 1 score; the estimate is labelled);
  - CEFR full set using the verified timings.
- **Dependencies:** `src/content/types.ts`, `examFormats.ts`, `tools/audio-tasks.ts` + `gen-audio-elevenlabs.mts` (audio for new Listening parts with UK voices).
- **Content (blocking):** per full IELTS mock about 2 500–2 800 reading words [U], 4 Listening scripts (about 30 min), 2 Writing tasks with an original chart, Speaking cards. About **3–5 content-days per mock** + review [estimate].
- **Audio cost:** one Listening mock is about 14 k characters, about 14 k ElevenLabs credits on v4 or about 7 k on Turbo (`VOICE_COST_MODEL.md`).
- **Acceptance criteria:** the format checks equal the verified data; two-reviewer answer keys; 5-learner timing pilot.
- **Rollback:** content is data; unpublish by a status flag.

## E3 — Server attempts (after M5)
- **Scope:** the `attempts` / `attempt_answers` tables from `DATABASE_DESIGN.md`, `deadline_at`, autosave PUT with sequence numbers, idempotent submit, server scoring with the same pure functions, and questions served without keys.
- **Dependencies:** accounts (today nickname + token), M2 PostgreSQL migration (OD-02), backup/restore runbooks (M1 exists).
- **Acceptance criteria:** MOCK_ARENA_SPEC §7 (keys absent before submit, refresh resumes, double submit gives one result).
- **Rollback:** the client falls back to E1 local mode if the API is unavailable.

## G1 — Gamified learning (client)
- **Scope:** GAMIFIED_LEARNING_SPEC §2–§5, in client-only form.
- **Existing code:** `Learn.tsx` (becomes the Map), `Lesson.tsx` + `LessonItem` / `LessonSpeak` / `LessonWrite` (lesson header, hearts, combo, feedback sheet), `game.ts` (XP rules, streak, achievements), `store.ts`, `dailyPlan.ts` (quests), `mistakes.ts`, `adaptive/*` (boss item selection, struggling and coasting rules).
- **Backend:** none. The XP caps already exist.
- **DB:** none (local).
- **AI:** none. Teacher reactions use the existing roast lines and the cached TTS.
- **UI components:** LearningMap, MapNode, NodeSheet, LessonHeader (hearts/combo), FeedbackSheet, RelearnFlow, BossIntro, BossResult, QuestCard, AchievementGrid, StreakWeek.
- **Complexity:** medium-high. The Map rendering and the deterministic boss selection are the main work.
- **Acceptance criteria:**
  - XP anti-farming tests (GAMIFIED §3.1).
  - Hearts never dead-end.
  - Map states equal `isUnlocked()`.
  - Reduced-motion behaviour.
- **Rollback:** a flag `learning_map_v1`; the list view stays available.
- **Release:** owner test → all users. No data migration, because XP and streak values are kept as they are.

## G2 — Server gamification (after accounts and DB)
- `xp_transactions` with a unique source, server-recomputed XP from attempts, weekly cohort leagues, freeze and repair stored on the server, anti-abuse flags.
- Until G2, the league stays labelled "sinov" without prizes.

## T1 — Teacher character in the UI
- **Dependencies:** the art set (PXD-13), `server/tts.ts` emotion tags (exists), `src/lib/tts.ts` / `speech.ts` playback (exists), `COACH_EMOTIONS`, `roasts.ts` emotions.
- **Scope:**
  - a `TeacherAvatar` component (expression layers, blink, amplitude mouth sync through Web Audio on the playing `<audio>`);
  - state machine idle → listening → thinking → speaking(emotion);
  - placement in lessons, speaking practice, dashboard;
  - neutral examiner only in the Speaking mock.
- **Acceptance criteria:** AI_TEACHER §8 (assets ≤ 250 KB per character, reduced motion, never on exam screens).
- **Rollback:** a flag; the Bandi mascot remains as a fallback until PXD-08 is decided.

## T2 — Live AI Teacher
- Realtime provider chosen by the voice benchmark (OD-21, OD-23).
- Minutes reserved per session (`AI_COST_CONTROL_SPEC.md` §4–§6): GENERAL 60, EXAM 30, ALL ACCESS 60 per month, FREE one 3-minute demo.
- The teacher states are driven by session events.
- Not before the cost gate in `VOICE_ACCEPTANCE_CRITERIA.md` §5 passes.

## Cross-checks with existing documents
| Question | Answer |
|---|---|
| Can the new UI work with the current backend? | **E1, G1 and T1: yes**, because they are client-only and use existing endpoints (`/api/tts`, `/api/sync`, `/api/leaderboard`). E3 and G2 need the M5 server attempts and accounts. |
| Data for gamification? | GAMIFIED §6 table; client storage now, the target tables are already designed in `DATABASE_DESIGN.md` (Gamification, Learning state). |
| XP vs mastery? | They are separate. XP is a reward following GAMIFIED §3.1. Mastery is the deterministic engine. XP never changes mastery, and mastery never comes from an LLM. |
| Exam timer and autosave vs architecture? | Today's timer is a client countdown without autosave, and it **conflicts** with MOCK_ARENA_SPEC (server `deadline_at`). E1 closes the UX gap locally; E3 implements the spec. |
| AI Teacher vs Voice Engine? | Compatible. Turn-based feedback already uses `/api/tts` with emotion tags and cost logging; realtime is pending OD-21. |
| AI costs vs plan limits? | The teacher animation has no AI cost. Voiced feedback is capped at 5 new answers a day plus the global character ceiling. Live minutes follow the OD-25 limits. All of this sits within `AI_COST_CONTROL_SPEC.md`. |
| Free / premium boundaries? | One conflict: full objective mock gated today vs DR-19 "objective mocks free" (PXD-09). |
| Conflicts with Phase-0 docs? | `TECHNICAL_ARCHITECTURE.md` "keep Bandi, no redesign", now superseded by the owner's brief (PXD-08). `UI_UX_SPECIFICATION.md` mascot states are replaced by the teacher states. |

## First implementation step (recommendation)
**E1 Exam shell on the existing mini-tests**, behind a flag:
- It needs no database, no AI, no new paid service and no content.
- It fixes a real user risk today: answers are lost on reload and there are no exam tools.
- Every later full mock plugs into it.
- Estimated at 8–10 developer-days.
- Start only after the owner approves the exam wireframes (REAL_EXAM §5) and PXD-09 / PXD-11.
