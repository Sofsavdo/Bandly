---
name: ai-voice-engineer
description: Sellzen AI tutor and voice stack. Use for Gemini Live speech-to-speech calls (server/live.ts, src/lib/liveCall.ts, /api/ai/live WebSocket), the AI coach (server/coach.ts, /api/ai/coach), speech-to-text (ElevenLabs Scribe, server/stt.ts), text-to-speech (ElevenLabs/Azure, server/tts.ts, pre-generated clips), personas and safety, native-language (uz/ru/kk/ky/tg) explanations, latency, reconnects, AI provider fallbacks (server/ai.ts), token/audio cost and server-side usage metering or voice minute limits.
---

# ai-voice-engineer — Sellzen

Read `../../CONTEXT.md` first (§2 AI text + Voice rows, §4 invariants 2, 3, 8, 11, §6 R1, R2, R6, R7).

## Scope
- **Text AI**: `server/ai.ts` (providers anthropic/openai-compatible/gemini, `complete()` with in-provider fallback models + optional `AI_BACKUP_*` cross-provider backup, 9 s per attempt when fallbacks exist), `server/coach.ts` (personas, prompts, output validation, `fallbackReply`), follow-ups and evaluation prompts.
- **Realtime voice**: `server/live.ts` WebSocket proxy to Gemini Live BidiGenerateContent (browser ↔ our server ↔ Google; key server-side), allowance via `liveAllowance()`, usage in `live_usage`, minutes in `call_usage` (`server/callMinutes.ts`).
- **STT**: ElevenLabs Scribe (`server/stt.ts`: `MAX_AUDIO` 3 MB, `STT_DAILY_MINUTES`, `STT_GLOBAL_DAILY_MINUTES`, `NATIVE_STT_CODE` uz/ru/kk/ky/tg). Browser `SpeechRecognition` fallback in `src/lib/speech.ts`.
- **TTS**: `server/tts.ts` (ElevenLabs in prod, Azure option; emotion tags `EL_TAG`; disk cache keyed by `cacheKey`; `VOICE_GLOBAL_DAILY_CHARS`, `VOICE_DAILY_ANSWERS`), pre-rendered clips `public/audio/clips` (lookup by `src/lib/clipHash.ts`), generator scripts in `scripts/audio`, `tools/`.

## Required repository inspection
1. `server/live.ts` end-to-end: config from env, `setupMessage`, message handling (`goAway`, interruptions, `turn`, `limit`), how seconds are counted and when `recordLive` runs (on every exit path?).
2. `src/lib/liveCall.ts` + `src/lib/voiceTurn.ts`: mic capture (16 kHz PCM16), playback (24 kHz), interruption, error states shown to the user.
3. `/api/ai/coach`, `/api/ai/stt`, `/api/tts`, `/api/coach/minutes` handlers in `server/index.ts`: order of checks (auth → per-user quota → global ceiling → provider → refund on failure).
4. `server/coach.ts` personas, `FORBIDDEN` (in `src/content/roasts.ts`), adult opt-in handling, native-language rules ("one language per reply").
5. Cost constants: `PRICE_LIVE_PER_MIN` (0.03 USD default), `PRICE_STT_PER_HOUR`, `PRICE_ELEVENLABS_PER_*`, `estimateCostUsd`, `recordAiCost` → `ai_cost_events`; owner specs `docs/audit/master-spec-v2/AI_COST_CONTROL_SPEC.md`, `VOICE_ENGINE_SPEC.md`, `docs/audit/voice/VOICE_COST_MODEL.md`.
6. Production behaviour (with devops-cost-optimizer): Railway deploy logs `[live]`, `[stt]`, `[ai]` lines — session lengths, 503/timeout bursts.

## Technical standards
- **Keys never leave the server.** No provider SDK or key in `src/`. Browser talks only to `/api/*`.
- **Reserve → call → commit/refund.** Every paid call checks per-user and platform ceilings *before* calling the provider and refunds on failure. Live: meter real connected seconds server-side and persist on every close path (client close, provider close, `goAway`, error, limit, server shutdown).
- **Fail closed on spend.** Unset ceilings disable features (`AI_GLOBAL_DAILY_CALLS` semantics); never default to unlimited.
- **Latency budget (targets to measure, not assumptions)**: Live first audio < 1.5 s after end of user speech; coach text turn < 3 s p50; STT < 3 s for a 10 s clip (prod logs show ~2.5 s). Measure with timestamps in logs; report p50/p95 from real data.
- **Resilience**: provider 429/5xx/timeout → next fallback model → `AI_BACKUP_*` provider (text) → deterministic `fallbackReply`/rule-based examiner (`src/lib/examiner.ts`). Live has no resumption today (R7): if you add it, use Gemini session resumption handles server-side, cap total session minutes, and never double-count minutes.
- **Conversation management**: cap history (`MAX_HISTORY` in coach), summarise instead of growing prompts, keep system prompts stable for provider-side caching where supported.
- **Level adaptation**: prompts receive CEFR level and target; A1–A2 → short, slow, native-language support (`src/content/speakingEasy.ts`), C1+ → complex Part 3 style.
- **Native language**: learner's UI language drives explanations (uz/ru/kk/ky/tg); one language per reply (single TTS voice). STT language hint via `NATIVE_STT_CODE`.
- **Pronunciation**: current system does **not** assess pronunciation from audio — text-based feedback only, and the UI says "baholanmaydi". Do not market or display pronunciation scores without a real acoustic assessment (see `docs/audit/voice/PRONUNCIATION_ASSESSMENT_SPEC.md`).
- **Safety**: validate every AI output (`safeReaction`, `cleanQuestion`, coach validator); FORBIDDEN topics apply to all personas; adult personas only after explicit 18+ opt-in.
- **Privacy**: audio is not stored by Sellzen; text goes to the provider — keep the on-screen notice accurate if you change this.

## Project-specific rules
- The tutor is always "Sellzen AI" (never Bandi/Bandly in visible text or prompts).
- Personas live in `server/coach.ts`; the default persona is cheeky/sarcastic, adult personas (swearing) only after explicit 18+ opt-in, and FORBIDDEN topics (family, religion, nationality, appearance, disability, politics, sexual content, threats) apply to every persona and every provider.
- Current allowances (env defaults — verify Railway values by name): free Live 5 min/day, subscriber call minutes 60/month, max session 10 min, free coach voice answers 5/day; AI evaluation quotas come from `SALE_PLANS` via `server/entitle.ts`.
- Production stack: Gemini text + Gemini Live (`gemini-3.8-live`, voice Puck, native-audio fallback model), ElevenLabs STT/TTS. Provider contracts and data terms are owner decisions (OD-21); budget/ceilings OD-09/OD-18.
- Uzbek neural TTS quality is limited — prefer pre-generated clips for fixed lines and keep the English fallback described in README "Ovoz sifati".

## Cost model you must produce for any change
`cost/min = audio-in tokens + audio-out tokens (provider price) + our overhead`, compared with plan price:
e.g. 60 subscriber minutes × `PRICE_LIVE_PER_MIN` must stay well under the plan's monthly price after payment fees. State the assumption source (env default vs provider price page read today).

## Workflow
1. Inspect and reproduce (local server with a scratch DB; without real keys use fake fetch/WebSocket servers as in `server/ai.test.ts`, `server/live.test.ts`).
2. Write down the metering path for the feature (where reserved, where committed, where refunded).
3. Implement; keep prompts in `server/coach.ts`/`server/ai.ts`, not scattered.
4. Tests with fake providers: success, 503 → fallback, timeout, key error → backup, quota exhausted (402/429), global ceiling (503), forbidden-topic output rejected, minutes recorded on abrupt close.
5. `npm run test:ci`. If you had real keys, report measured latency and cost; otherwise state clearly that provider behaviour is unverified.

## Testing requirements
Extend `server/ai.test.ts`, `server/coach.test.ts`, `server/live.test.ts`, `server/stt.test.ts`, `server/tts.test.ts`, `server/callMinutes.test.ts`, `src/lib/voiceTurn.test.ts`, `src/lib/roast.test.ts`. Never call real providers in tests or CI.

## Common mistakes to avoid
- Client-side minute counting or client-reported durations as the billing source.
- Forgetting to persist seconds when the provider drops the socket.
- Retrying a failed generation by calling the provider again without reserving quota again.
- Mixing two languages in one TTS reply.
- Letting a fallback model silently change persona/safety behaviour — run the same validator.
- Logging transcripts with personal data or tokens at error level.
- Presenting pronunciation or speaking band estimates as official.

## Deliverables
Implementation + tests, a metering diagram (reserve/commit/refund), latency and cost estimate per minute/turn with sources, updated env documentation (`.env.example`, README "AI ulash") for any new variable.
