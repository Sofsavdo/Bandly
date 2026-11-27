# Sellzen — shared project context (all skills read this first)

> Source of truth is the repository, not this file. Facts below were verified against commit `71c9c85` (`main`,
> 2026-11-18) plus branch `claude/bandly-analysis-improvement-ywgxrb`, Railway project **Sellzen** (production,
> service `bandly`), on **2026-11-21**. Re-verify anything you rely on: run the commands, read the file, check the logs.

## 1. What Sellzen is

AI-powered English learning and exam preparation SaaS for Uzbekistan first, then Kazakhstan, Kyrgyzstan, Tajikistan,
Turkmenistan. Domain `sellzen.uz` (Railway custom domain, also `www.`). Rebranded from **Bandly** on 2026-11-18:
visible text says Sellzen / "Sellzen AI"; internal identifiers keep the old name on purpose
(`bandly.*` localStorage keys, `/data/bandly.sqlite`, persona id `'bandi'`, Railway service `bandly`, and backup file names). Telegram bot is `@Sellzenbot` (since 2026-11-21; old `@Bandly_robot` retired): /start enforces a subscription to @Sellzen_AI and asks for the Telegram contact (`server/botFlow.ts`); name, description, commands and avatar are set on startup. The npm package, CSS classes, audio worklet, Telegram widget callback and pay event were renamed to Sellzen on 2026-11-21; README "Brend" table lists what stays and why.
**Never rename internal `bandly.*` keys** — synced progress, server validation (`/^bandly\./` in `putProgress`) and
existing users depend on them. `scripts/build/brand.test.ts` fails if "Bandly"/"Bandi" reappears in visible text.

### Product model (target) vs. code (actual)

| Target product | What it contains | How the code actually models it |
|---|---|---|
| **A. General English** (A1–C2, grammar inside it) | lessons, grammar, vocab, reading, listening, speaking, writing, games, AI tutor | Routes `#/learn`, `#/grammar`, `#/practice`, `#/games/*`, `#/coach`, `#/shadow`. Plan id `general`. **Legacy TrackId `grammar` = General English entitlement** (a naming leftover; do not reintroduce Grammar as a separate product). |
| **B. Exam Preparation** (IELTS Academic/GT, CEFR Multilevel, Digital SAT) | AI Writing/Speaking examiner, plans, simulations | Routes `#/exam`, `#/ielts`, `#/exam/writing`, `#/exam/speaking`, CEFR/SAT pages. Plan id `exam`. TrackId `exam`. |
| **C. Mock Arena** | full/timed mocks, analytics | Routes `#/mocks`, `#/mocks/full`, `#/mocks/<kind>/<id>`. TrackId `mocks` exists but **mocks are free for signed-in users** and every paid plan includes `mocks`; Mock Arena is *not* a separately sold product today. |
| **Shared intelligence layer** | profile, history, mastery, weaknesses, recommendations, entitlements, analytics | Mostly **client-side** (`src/lib/store.ts`, `src/lib/adaptive/*`, `src/lib/mistakes.ts`, `src/lib/history.ts`) synced as an opaque blob (§4). Entitlements, XP, grading, AI quotas are server-side. |

Plans live in **one place**: `src/config.ts` `SALE_PLANS` (general 69 000 / exam 99 000 / all 129 000 UZS per month;
periods 30/90/365 days via `periodPrice`), overridable per env `PLAN_PRICE_GENERAL|EXAM|ALL` (`server/pricing.ts`).
`planOf()` in `server/entitle.ts` derives the plan from `subscriptions` rows: exam+grammar → all, exam → exam, grammar → general.

## 2. Architecture map (where things are)

| Layer | Facts | Key files |
|---|---|---|
| Frontend | React 18 + TypeScript 5.6 + Vite 5, **no router library**: hash routes in a table (`routes` in `src/App.tsx`), guest/onboarding gates in `src/lib/setupGate.ts`. Global state = small store over localStorage (`src/lib/store.ts`, `useProfile`). Icons `lucide-react`. CSS tokens in `src/styles.css` + `src/design3.css` (dark mode automatic). Fonts self-hosted (`@fontsource`). | `src/App.tsx`, `src/pages/*`, `src/components/*`, `src/lib/*` |
| Build | Two deliberate chunks: `boot` (React + i18n) must load before `app` (`vite.config.ts` manualChunks). `app` ≈ 1.74 MB / 569 KB gzip. `scripts/build/chunks.test.ts` forbids boot→app static imports and **fails if answer evidence leaks into `dist`**. | `vite.config.ts`, `scripts/build/*` |
| i18n | UI languages `uz` (source), `en`, `ru`, `kk`, `ky`, `tg` (`src/i18n/index.ts` `LANGS`). Every visible string goes through `L('…')`; `npm run i18n:check` enforces it (codemod guard + catalog freshness). Translations live in the repo (`src/i18n/locales/{en,ru,kk,ky,tg}.json`, keyed by the Uzbek source); `scripts/i18n/locales.test.ts` requires 100 % of the catalog; DB overrides via Studio remain possible. Server messages via `trServer()`. | `src/i18n/*`, `server/i18n.ts`, `scripts/i18n/*` |
| Backend | **One Node 22 process**, plain `node:http` (no framework) in `server/index.ts` (~615 lines, if-chain router), run with `tsx`. Serves `dist/` + API + WebSocket (`/api/ai/live`). Rate limit 120 req/min/IP on `/api/*`. Errors via `ApiError(status, msg)`. | `server/index.ts`, `server/static.ts` |
| Database | **SQLite via `node:sqlite`** (experimental API), file `DB_PATH=/data/bandly.sqlite` on a 5 GB Railway volume. Schema created in code with `CREATE TABLE IF NOT EXISTS` + additive `ALTER TABLE … ADD COLUMN` guarded by column checks — no migration runner. Single instance only. Tables: players, sessions, progress, xp_log, xp_events, payments, subscriptions, ai_usage, ai_global_usage, ai_cost_events, call_usage, live_usage, stt_usage, free_unlocks, free_walls, duels, duel_players, league_groups, league_members, groups, group_members, content, content_versions, studio tests, mock_stats, exam_results, certificates, cert_rules, cert_settings, admin_audit, band_records, i18n. | `server/db.ts` + `ensure*Table` in each module |
| Auth | Telegram only when `TELEGRAM_BOT_TOKEN` is set (Login Widget on web, `initData` in Mini App; `/api/join` returns 410). Sessions: random token per device, **only SHA-256 hash stored** (`sessions`), idle expiry 180 days. Client sends `x-token` header. Roles: `admin` / `methodologist` / `creator` / `teacher` (`players.role`, plus `ADMIN_NICKNAMES` env); `requireRole()`. Legacy `ADMIN_TOKEN` header `x-admin`. | `server/db.ts`, `server/telegram.ts`, `src/lib/account.ts` |
| Payments | **Hamyon card-to-card transfer** (not recurring billing): `/api/pay/create` → exact amount (+1 so'm if taken) → Hamyon `prepare`/`complete` callbacks with md5 signature (`verifySign`) → `applyResult` grants once (idempotent) → reconcile poll every 90 s. Limits: 3 open payments/player, 10/hour. No refunds module, no auto-renewal. Demo mode when `HAMYON_*` unset (`PAY_DEMO`). | `server/hamyon.ts`, `server/payments.ts`, `server/pricing.ts`, `src/components/PaySheet.tsx`, `src/lib/pay.ts` |
| Entitlements | Server truth: `subscriptions(player_id, track, until)`. Client mirrors `planUntil` from `/api/me`; `src/lib/entitlement.ts` `hasTrack()`; `src/components/Gate.tsx` hides UI. AI features check server-side (`useAssessment`, call minutes, live allowance). **Lesson content is client-gated only** (see §6). | `server/entitle.ts`, `server/freeQuota.ts` |
| AI text | Provider layer for Anthropic / OpenAI-compatible / Gemini (`server/ai.ts`): fallback models within provider, optional cross-provider `AI_BACKUP_*`. Production: Gemini (`gemini-3.8-flash`, coach uses Flash-Lite first). Global daily ceiling `AI_GLOBAL_DAILY_CALLS` is **fail-closed** (unset/0 ⇒ coach off, owner decision OD-09). Per-user `AI_DAILY_LIMIT`, `AI_COACH_DAILY_LIMIT`. Cost events in `ai_cost_events`. Prompt-injection guard: candidate text wrapped in `<candidate>` and marked untrusted; outputs validated (bands 0–9 step 0.5, overall computed server-side). | `server/ai.ts`, `server/coach.ts`, `server/mockGrade.ts` |
| Voice | **Gemini Live** speech-to-speech proxied through our server WebSocket `/api/ai/live` (16 kHz PCM16 up, 24 kHz down; key never reaches the browser). Allowance: staff → max session; subscriber → own plan only, no free fallback (Premium `PREMIUM_DAILY_MINUTES` 30/day; monthly: General `COACH_CALL_MONTH_MINUTES` 60, Exam `PLAN_EXAM_VOICE_MINUTES` 90, All Access `PLAN_ALL_VOICE_MINUTES` 120 — card ↔ server parity in `server/planParity.test.ts`); free → `LIVE_FREE_WEEKLY_MINUTES` (5 per week, resets Monday Tashkent; counted from `live_free_usage`, free calls only) and optional platform cap `LIVE_FREE_GLOBAL_DAILY_MINUTES`; max session `LIVE_MAX_SESSION_MINUTES` (10). **No session resumption** — `goAway` ends the call. STT: ElevenLabs Scribe (`server/stt.ts`, 3 MB cap, daily minute caps). TTS: ElevenLabs (prod) or Azure, disk cache `tts-cache/`, `VOICE_GLOBAL_DAILY_CHARS`. Pre-generated clips: `public/audio/clips` (2 817 files) and `public/audio/listening` (20). Browser Web Speech remains a fallback. | `server/live.ts`, `src/lib/liveCall.ts`, `server/stt.ts`, `server/tts.ts`, `server/elevenlabs.ts`, `server/callMinutes.ts` |
| Adaptive | Deterministic mastery model (`src/lib/adaptive/mastery.ts`, PARAMS are *uncalibrated hypotheses*), 35-id error taxonomy, curriculum graph validation, `planDay()` recommender with reason codes; Leitner SRS for words (`src/lib/srs.ts`). Persisted in localStorage key `bandly.mastery.v1`; synced across devices inside the progress blob with record-level merge (`progressMerge.ts`, latest `lastSeen` wins per node). Server cannot query mastery. | `src/lib/adaptive/*`, `src/lib/srs.ts`, `src/lib/cloud.ts`, `src/lib/progressMerge.ts` |
| Content | Lessons: 62 units / 186 lessons / 2 046 items (incl. Starter units `a1-s1`, `a1-s2`, optional) (`src/content/lessons/*`, lesson DSL `src/lib/lessonDsl.ts`), **all units `status: 'pilot'`**. Curriculum graph: `inventory.ts` (legacy nodes) + `pilot.ts` (9 nodes, `reviewStatus: 'draft'`). Studio CMS stores editable copies in DB (`server/content.ts`, `seedContent` adds missing static units, never overwrites). | `src/content/**`, `server/content.ts`, `src/pages/Studio.tsx` |
| Exams | IELTS: reading/listening tests with answer keys **server-only** (`src/content/readingTests.ts`, `listeningTests.ts`); browser gets `src/content/mockPublic.json` generated by `scripts/gen-mock-public.ts`; grading `POST /api/mock/grade` (auth required); band tables in `src/lib/band.ts` (Academic + GT reading). Exam formats as data with provenance and `verified` flags (`src/content/examFormats.ts`, verified 2026-11-14). CEFR Multilevel: 1 reading + 1 listening set. SAT: 18 original R&W items, **no SAT score estimated**. Full exam composed server-side (`composeFull`). Certificates SZ-XXXX-XXXX-XXXX, 1-year validity, public verify page `/certificate/<ID>`. | `server/mockGrade.ts`, `server/certificates.ts`, `src/content/examFormats.ts`, `src/lib/examLadder.ts` |
| Growth | Referral codes (`players.ref_code`, reward `REF_XP` to both after first lesson/placement), creator stats with optional `CREATOR_COMMISSION_PCT` (attribution only, no payouts), duels (48 h, ≤ 8 players, server-validated), weekly league tiers + Telegram notices, groups/classes for teachers, Telegram streak reminders, share card (`src/lib/shareCard.ts`), static SEO tools `public/vositalar/*.html` generated by `scripts/seo/gen.ts`. | `server/referral.ts`, `server/creator.ts`, `server/league*.ts`, `server/groups.ts`, `server/reminders.ts` |
| Analytics | `server/analytics.ts` (DAU/WAU/MAU, D1/D7/D30, revenue, AI USD), anonymous daily events (`server/events.ts`), and user-level cohorts (`server/userEvents.ts`: `user_events` deduped per player/name/day, `cohortReport()` — activation, retention, free→paid, renewal, ARPU, AI cost per active user/eval). See `docs/SELLZEN_P1_EVOLUTION_2026-11-22.md`. | `server/analytics.ts`, `/api/admin/analytics` |
| Ops | Railway, builds from the repo **`Dockerfile`** (Railway auto-detects it even though the service builder setting reads RAILPACK — confirmed in the 2026-11-21 build log; CMD `node --disable-warning=ExperimentalWarning --import tsx server/index.ts`), healthcheck `/api/health`, region **sfo** (far from Tashkent), 1 replica, volume `/data`. Daily auto-backup to `/data/backups` keeping 14 days — **same volume, not off-site**. CI: `.github/workflows/ci.yml` runs `npm run test:ci` on PR and push to `main`. | `Dockerfile`, `DEPLOY.md`, `server/autoBackup.ts`, `scripts/backup/*`, `docs/runbooks/*` |

## 3. Implementation status (evidence-based)

Categories: **P** production-ready (running in prod per Railway logs *and* covered by tests) · **U** implemented but
unverified end-to-end · **Partial** · **Planned** (spec only). Update this table when evidence changes.

| Area | Status | Evidence / gap |
|---|---|---|
| Telegram sign-in, sessions | P | webhook active in logs; `session.test.ts`, `telegram.test.ts` |
| Progress sync across devices | P (blob) / Partial (as data layer) | `PUT /api/progress` in logs; rev-based 409 conflict + merge; server can't analyse it |
| Lessons A1–C2 | Partial | 144 lessons exist and are tested structurally; **all pilot, no expert review**; entitlement client-side |
| Adaptive engine | U | deterministic + tested; parameters uncalibrated; feeds plan cards; mastery opaque to server |
| Placement test | P (short) | 41-line bank, A1–C1 only, ~20 items; requires sign-in (guests see only the landing, 2026-11-21 owner decision) |
| IELTS Reading/Listening mocks | P | server grading, keys server-only, `mockGrade.test.ts`, `chunks.test.ts` |
| AI Writing/Speaking evaluation | U | runs in prod (Gemini), 503/timeouts observed 2026-11-19; scoring not calibrated against human examiners |
| Gemini Live tutor | U | sessions logged daily; no resumption; latency/cost per minute not measured in prod |
| STT / TTS (ElevenLabs) | U | used in prod; daily caps in code |
| CEFR Multilevel | Partial | format verified from official source (lex.uz), 1 reading + 1 listening set |
| Digital SAT | Partial | 18 practice items, no adaptive modules, no score |
| IELTS General Training | Partial | GT reading band table only; no GT tasks |
| Payments (Hamyon) | U | callbacks reach prod; only a cancelled payment observed in the 7-day window; no refunds, no recurring |
| Subscriptions/entitlements | P (server AI quotas) / Partial (content) | `entitle.test.ts`; lesson unlocks client-side |
| Referral / creator | U | code + tests; no payouts, no fraud rules (OD-14 open) |
| Certificates | U | issue + verify implemented; low real usage |
| Analytics | T | user-level cohort report + client events (`/api/uevent`); no experiment framework yet |
| Multilingual UI | Partial | 6 locales wired; non-uz coverage depends on DB translations |
| Native-language explanations in lessons | Partial | explanations authored in Uzbek; ru/kk/ky/tg rely on UI translation pipeline |
| Postgres / multi-instance | Planned | `docs/audit/phase-0.2/FINAL_MIGRATION_SPEC.md`, OD-02 open |
| Off-site backups, error tracking | Planned | OD-04 open |
| Recurring billing, Payme/Click/Uzum | Planned | — |

## 4. Invariants — never break these

1. **Answer keys and evidence never reach the browser.** Only `mockPublic.json` is client-side; grading happens in `server/mockGrade.ts`. Keep `chunks.test.ts` green.
2. **Server decides money and limits**: payments verified by signature + amount, subscriptions granted once, AI/voice quotas reserved *before* the provider call and refunded on failure (`useAssessment`/`refundAssessment`, `useGlobalAi`/`refundGlobalAi`).
3. **AI global ceiling stays fail-closed.** Missing env must disable spend, never enable unlimited spend.
4. **XP is server-capped** (`server/xp.ts`: per-event 150, per-source daily, total 1000/day; `mock`, `referral` are server-only sources).
5. **Every visible string via `L()`**; run `npm run i18n:check` and `npx tsx scripts/i18n/extract.ts` when you add strings.
6. **Schema changes are additive** (`CREATE TABLE IF NOT EXISTS`, guarded `ADD COLUMN`). No drops/renames without an approved migration plan and backup.
7. **`bandly.*` storage keys and `x-token` header contract stay stable.** New synced keys must match `/^bandly\.[\w.:-]{1,80}$/` and fit `PROGRESS_MAX` (600 KB).
8. **API keys only on the server** (Railway variables). Never in `src/`, never in logs, never in chat.
9. **Exam honesty**: bands are always "taxminiy/estimated"; no official affiliation; no invented official scoring rules; `examFormats.ts` `verified:false` fields are labelled as unverified.
10. **Content honesty**: pilot content shows the pilot label; nothing is called expert-reviewed without a recorded review.
11. **Persona safety**: `FORBIDDEN` topics in `src/content/roasts.ts` are enforced for static and AI output; 18+ personas require opt-in.

## 5. Engineering rules (apply to every skill)

1. Inspect existing code before modifying it (read the module, its test, its callers: `grep -rn`).
2. Never rewrite a working system without a stated, evidence-based reason.
3. Extend existing modules instead of creating parallel ones (e.g. a new quota goes next to `server/freeQuota.ts`/`entitle.ts`, not a new "billing" folder).
4. Follow conventions: plain functions taking `db: DatabaseSync` and `now = Date.now()` for testability; Uzbek code comments are normal here; server modules expose `ensure*Table(db)`.
5. Minimal, focused diffs. One concern per PR.
6. Never expose secrets or credentials.
7. Never fabricate API responses, metrics or production results. If a provider/URL is unreachable, say so.
8. Never claim tests passed unless you ran them and saw the output.
9. No production data changes or destructive migrations without explicit owner approval in this conversation.
10. Explain important architectural decisions (in the PR/summary, and in `docs/` when durable).
11. List likely regressions before implementing (routes, gates, sync, quotas, i18n, bundle).
12. Estimate AI and infrastructure cost impact for anything that calls a provider or adds a service.
13. Preserve user data (progress blob, subscriptions, certificates, XP).
14. Document important changes (README section or `docs/`).
15. Prefer maintainable solutions over cleverness; no new dependency without a reason the existing stack can't cover.

## 6. Known risks and open findings (verify before acting)

| # | Finding | Where | Severity |
|---|---|---|---|
| R1 | ~~WS upgrade `new URL()` crash~~ **Fixed 2026-11-21**: malformed upgrade now closes the socket; regression test in `server/live.test.ts` | `server/live.ts` | Closed |
| R2 | **Fixed 2026-11-21**: client sends the token as WS subprotocol `['sellzen.v1', 'tk.<token>']`; server still accepts `?token=` temporarily for cached old clients — remove that fallback after ~30 days | `server/live.ts` `tokenFromProtocols`, `src/lib/liveCall.ts` | Low (cleanup) |
| R3 | `GET /api/content` is unauthenticated and the lesson bundle ships all lessons → paid lessons are client-gated only | `server/index.ts`, `src/content/lessons` | Medium (business) |
| R4 | Backups live on the same volume as the DB. **Code ready 2026-11-21**: `server/offsite.ts` uploads each snapshot to an S3-compatible bucket when `BACKUP_S3_*` is set — stays open until the owner creates the bucket and sets the variables | `server/autoBackup.ts`, `server/offsite.ts` | High until configured |
| R5 | Railway region `sfo` ≈ 250 ms RTT from Tashkent; volume-attached service has downtime on every deploy (502 "connection dial timeout" seen) | Railway | Medium |
| R6 | Single AI vendor in prod; Gemini 503 bursts observed; `AI_BACKUP_*` exists on branch but not configured | `server/ai.ts` | Medium |
| R7 | Gemini Live has no session resumption / reconnect | `server/live.ts` | Medium (UX) |
| R8 | Mastery data opaque to the server → no server-side analytics, cohort calibration or teacher dashboards on mastery | `src/lib/adaptive/store.ts` | Medium (strategic) |
| R9 | All lessons pilot; placement bank tiny (A1–C1); SAT/CEFR thin | `src/content/*` | Medium (quality) |
| R10 | Hash routing → only `public/vositalar/*.html` is indexable | `src/App.tsx` | Medium (growth) |
| R11 | `docs/audit/master-spec-v2/FEATURE_INVENTORY.md` describes an older baseline (`b51f705`) — many "MISSING" rows are now built. Treat specs as intent, code as truth. | docs | Info |

## 7. Commands

```bash
npm ci                    # Node >= 22.12
npm run dev               # Vite on :3100 (proxies /api to :3101)
npm run server            # API on :3101 (reads .env if present)
npm test                  # ~90 tsx assert suites chained in package.json "test"
npm run test:ci           # i18n:check + typecheck + build + tests + backup suite (what CI runs)
npm run i18n:check        # L() guard + catalog freshness; fix with: npx tsx scripts/i18n/extract.ts
npm run seo:gen           # regenerate public/vositalar, sitemap, robots
npx tsx scripts/gen-mock-public.ts   # regenerate answer-free mockPublic.json after editing tests
```

Tests are plain `tsx` scripts using `node:assert/strict`, each ending with `console.log('<name>: OK')`.
**A new test file must be appended to the `test` script in `package.json`**, otherwise CI never runs it.
There is no E2E framework in the repo; for UI checks use the pre-installed Playwright ad hoc against `npm start` with a
throwaway `DB_PATH` (never the production DB).

## 8. Documentation map (intent, not proof)

- `docs/audit/master-spec-v2/*` — owner's master spec: product architecture, monetization, adaptive, exam, mock arena, voice, multilingual, creator, analytics, security, test strategy.
- `docs/audit/phase-0.2/OWNER_DECISION_REGISTER.md` — decisions OD-01…OD-21 and which are still open. Check before deciding anything the owner owns (region, DB platform, pricing/trials, AI budget, age policy, creator payouts, launch order).
- `docs/audit/voice/*` — provider comparison, cost model, Uzbek speech support.
- `docs/runbooks/*` — backup/restore, rollback, Telegram, ElevenLabs.
- `docs/SELLZEN_ANALYSIS_2026-11.md` — 2026-11-21 audit, competitors, growth plan.
