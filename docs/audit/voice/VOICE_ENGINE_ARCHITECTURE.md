# Voice Engine Architecture

Status: **design only — nothing here is implemented.** It supersedes the interface sketch in `master-spec-v2/VOICE_ENGINE_SPEC.md` (which stays as history) and must be read with `SPEECH_PROVIDER_COMPARISON.md`, `PRONUNCIATION_ASSESSMENT_SPEC.md`, `VOICE_COST_MODEL.md` and `phase-0.2/FINAL_AI_CREDIT_SPEC.md`.

## 0. What exists today (must keep working)
| Piece | File | Behaviour | Production state (2026-11-14) |
|---|---|---|---|
| Browser STT | `src/lib/speech.ts` (`SpeechRecognition` / `webkitSpeechRecognition`) | turn-based listening with silence/max timers, interim text; audio goes to the browser vendor, not to Bandly | **on** — Lesson speaking step, Skill check, Challenge ("Jim qolma!"), Coach page |
| Browser TTS | `src/lib/speech.ts` `say()` / `bestVoice()` | picks the best installed en-GB/en-US voice | **on** |
| Server Uzbek TTS | `server/tts.ts`, `src/lib/tts.ts`, `POST /api/tts` | Azure `uz-UZ-MadinaNeural` via REST, SSML prosody, disk cache, per-user daily limit | **off** (no `TTS_KEY`; log "TTS: none") |
| AI coach (text) | `server/coach.ts`, `server/ai.ts` | provider-agnostic LLM, fail-closed without `AI_GLOBAL_DAILY_CALLS` | **off** (no key) |

**Rule:** these remain the default path. A new provider is added behind a flag, compared side by side, and only replaces the browser path after an approved migration step (§9). No existing feature is removed.

## 1. Product modes → engine pieces
| Mode | Flow | Interfaces used |
|---|---|---|
| **A. Speaking** (conversation) | mic → realtime session (VAD, barge-in) → tutor audio; parallel transcript; after each learner turn: pronunciation (unscripted) + LLM grammar/vocabulary/relevance; difficulty adapts from the learner's mastery (`src/lib/adaptive`) | `RealtimeVoiceProvider`, `SpeechToTextProvider` (transcript, if the realtime one is not reliable), `PronunciationAssessmentProvider`, LLM (`server/ai.ts`) |
| **B. Reading** | cached native reference audio (US or UK) → learner reads the same text → scripted assessment with word/phoneme alignment → replay / repeat weak words | `TextToSpeechProvider` (pre-generated), `PronunciationAssessmentProvider` (scripted), `AudioStorageProvider` (reference clips only) |
| **C. AI Teacher** | spoken explanations in English or Uzbek; interface language, explanation language and practice language are independent settings (`src/i18n/settings.ts`); 5 personalities; memory = summarised learner state, not raw audio | `RealtimeVoiceProvider` **or** chained STT → LLM → TTS; `TextToSpeechProvider` (uz) |

## 2. Interfaces (TypeScript, server side)
```ts
type Lang = 'en-US' | 'en-GB' | 'uz-UZ' | 'ru-RU' | 'kk-KZ' | 'ky-KG' | 'tg-TJ';
interface Capabilities {
  languages: Lang[];              // only languages that PASSED the benchmark, not the vendor list
  streaming: boolean;
  wordTimestamps: boolean;
  phonemes: boolean;              // pronunciation only
  prosody: Lang[];                // pronunciation: e.g. ['en-US'] for Azure
  codeSwitch: 'none' | 'dominant' | 'midSentence';
  bargeIn: boolean;               // realtime only
  retrySafety: 'idempotent' | 'unsafe_after_send';   // FINAL_AI_CREDIT_SPEC §6
  usageReporting: 'exact' | 'estimated';
}
interface ProviderHealth { ok: boolean; reason?: 'no_credentials' | 'invalid_credentials' | 'quota' | 'down' | 'disabled_by_owner'; checkedAt: number }

interface SpeechToTextProvider {
  id: string; capabilities: Capabilities; health(): ProviderHealth;
  transcribe(audio: AudioInput, opts: { langs: Lang[]; keyterms?: string[] }, ctx: CallCtx): Promise<Transcript>;
  stream(opts: { langs: Lang[]; keyterms?: string[] }, ctx: CallCtx): SttStream;   // push(chunk) / partial / final / close
}
interface TextToSpeechProvider {
  id: string; capabilities: Capabilities; health(): ProviderHealth;
  synthesize(text: string, voice: VoiceRef, ctx: CallCtx): Promise<AudioClip>;    // cacheable
  stream(text: AsyncIterable<string>, voice: VoiceRef, ctx: CallCtx): AsyncIterable<AudioChunk>;
}
interface RealtimeVoiceProvider {
  id: string; capabilities: Capabilities; health(): ProviderHealth;
  /** Returns a short-lived browser credential; the long-lived key never leaves the server. */
  openSession(cfg: RealtimeConfig, ctx: CallCtx): Promise<{ sessionId: string; clientSecret: string; expiresAt: number; transport: 'webrtc' | 'websocket' }>;
  closeSession(sessionId: string): Promise<UsageReport>;
}
interface PronunciationAssessmentProvider {
  id: string; capabilities: Capabilities; health(): ProviderHealth;
  assess(audio: AudioInput, req: { lang: 'en-US' | 'en-GB'; referenceText?: string; granularity: 'phoneme' | 'word' }, ctx: CallCtx): Promise<PronunciationResult>;
}
interface AudioStorageProvider {           // default: NO learner audio stored
  putReference(key: string, clip: AudioClip): Promise<string>;   // Bandly-generated reference audio only
  putLearner?(key: string, clip: AudioClip, consent: ConsentRecord, ttlDays: number): Promise<string>; // only with explicit opt-in (OD-22)
  delete(key: string): Promise<void>;
}
interface CallCtx { userId: string; audioSessionId: string; requestId: string; reservationId: string; deadlineMs: number; signal: AbortSignal }
```
`PronunciationResult` keeps provider fields separate (accuracy, fluency, completeness, prosody | null, per-word error type, per-phoneme accuracy, offsets) — see `PRONUNCIATION_ASSESSMENT_SPEC.md` §3. Grammar/vocabulary/relevance are **not** part of it.

## 3. Configuration (environment-based, server only)
| Variable | Example | Meaning |
|---|---|---|
| `VOICE_STT_PROVIDER` / `VOICE_STT_FALLBACK` | `azure` / `google` | one id each, or `browser` |
| `VOICE_TTS_EN_PROVIDER`, `VOICE_TTS_EN_VOICE_US`, `VOICE_TTS_EN_VOICE_UK` | `azure`, `en-US-Ava:DragonHDLatestNeural`, `en-GB-Ada:DragonHDLatestNeural` | chosen by native-speaker review |
| `VOICE_TTS_UZ_PROVIDER`, `VOICE_TTS_UZ_VOICE` | `azure`, `uz-UZ-MadinaNeural` | existing `TTS_KEY` / `TTS_REGION` / `TTS_VOICE` stay valid as aliases |
| `VOICE_REALTIME_PROVIDER`, `VOICE_REALTIME_MODEL` | `openai`, `gpt-realtime-2.1` | |
| `VOICE_PRON_PROVIDER` | `azure` | |
| Credentials | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, `ELEVENLABS_API_KEY`, `OPENAI_API_KEY` | **Railway variables only.** Never in the repository, never in chat, never sent to the browser. |
| Limits | `VOICE_GLOBAL_DAILY_MINUTES`, `VOICE_USER_DAILY_MINUTES`, `VOICE_SESSION_MAX_MINUTES` | default **0 = feature off** (same fail-closed rule as `AI_GLOBAL_DAILY_CALLS`) |

Startup validates every value against an allow-list (model ids and voice names from the comparison doc). Unknown or missing → that provider's `health()` is `no_credentials`/`invalid_credentials`, the feature reports *unavailable*, and the startup log names which voice features are off.

## 4. Honest failure behaviour
- Missing/invalid credentials, quota exhausted, provider down → the UI shows "Ovozli rejim hozir mavjud emas — matnli rejim ishlayapti" (voice mode unavailable — text mode works) and the browser/text path continues. **No synthetic or canned answer is ever presented as AI output, and no score is ever shown that a provider did not return.**
- A partial result is labelled partial (e.g. prosody absent for `en-GB` → "Talaffuz ohangi bahosi faqat American English uchun mavjud").
- `/api/voice/status` returns per-feature `{ available, provider, reason }` without secrets, mirroring `/api/ai/status`.

## 5. Sessions, transport and timing
- **Audio session id** (`aud_<uuid>`) created by the server for every Speaking/Reading/Teacher session; every provider call, usage record and telemetry event carries it. One credit reservation per session (§6).
- **Transport:** realtime → WebRTC from the browser with an ephemeral client secret (OpenAI documents `/v1/realtime/client_secrets`); STT streaming and assessment → browser sends 16 kHz mono PCM to Bandly's server over WebSocket, server relays to the provider (so the key stays server-side and usage is metered exactly). Reference TTS → pre-generated MP3/Opus served from storage/CDN.
- **Timeouts:** connect 5 s; first partial transcript 3 s; first TTS audio 2.5 s; assessment 10 s for ≤30 s audio; session hard cap `VOICE_SESSION_MAX_MINUTES`; idle (no speech) 60 s → close session to stop billing (OpenAI notes active time is billed even when silent for `gpt-live-1`).
- **Retry policy:** idempotent calls (cached TTS, file STT before bytes sent) → 2 retries with 250 ms / 1 s backoff + jitter; streaming/realtime after audio was sent → **no silent retry** (`retrySafety='unsafe_after_send'`): close, settle actual usage, offer "qayta urinish"; fallback only to a provider marked equivalent for that language and allowed by data residency (OD-01).
- **Rate limits:** per user (minutes/day, sessions/hour), per IP for session creation, global daily minutes ceiling; provider limits documented in the comparison (e.g. Azure default 100 concurrent STT, OpenAI Build tier 400 RPM).

## 6. Usage metering and credits (reuses `FINAL_AI_CREDIT_SPEC.md`)
1. **Reserve** before opening a session: `maxMinutes × costPerMinute(provider, model)` from `VOICE_COST_MODEL.md` (state `reserved`).
2. **Meter** from provider-reported usage where available (OpenAI `response.done` usage tokens; ElevenLabs/Google/Azure billed duration or characters) — never from client-side timers alone; mark `usageReporting='estimated'` where only our own measurement exists.
3. **Settle** on close/timeout/crash-recovery with actual usage; release the remainder. Crash window handling per FINAL_AI_CREDIT_SPEC §5 (a session with no close event is settled at its hard cap after the sweep timeout, flagged for review).
4. Usage record adds: `audio_session_id`, `provider`, `model`, `voice`, `lang`, `input_audio_ms`, `output_audio_ms`, `chars`, `tokens_in/out/cached`, `cost_usd_estimated`, `cost_usd_settled`.
5. Plan allowances (OD-18) are enforced on reserved minutes, not on settled ones, so a user cannot exceed the allowance mid-session.

## 7. Provider health and telemetry
- Health probe per provider every 5 min with a **free** call where one exists (list voices / list models / token mint); never a paid synthesis or transcription. Circuit breaker: 3 consecutive failures → `down` for 2 min.
- Telemetry per call (no audio, no transcript text by default): provider, model, lang, `ttfb_ms` (first partial / first audio), `turn_latency_ms` (end of user speech → first tutor audio), `barge_in_ms`, error code, audio duration, dropouts/underruns reported by the client player, WER sample flag (only for consented benchmark sessions).
- Dashboards: p50/p95 latency per provider and language, error rate, cost per active minute, fallback rate. Alerts on p95 turn latency > 1.5 s or error rate > 2 % over 15 min.

## 8. Data handling
- Default: **no learner audio stored**; transcripts kept only per OD-07 retention and deletable by the user; reference audio (Bandly-generated) may be cached.
- Voice is potentially biometric/personal data (Azure explicitly assigns notice/consent/deletion duty to the customer). Before any cloud voice feature: consent text, provider list and processing countries shown to the user; under-18 rules per OD-06/OD-06b.
- Provider settings to request: OpenAI Zero Data Retention (approval-based), ElevenLabs Zero Retention Mode (Enterprise), Google data logging **off** (default), Azure real-time (no storage at rest).

## 9. Migration plan (requires owner approval at each step)
1. **Benchmark only** (`VOICE_BENCHMARK_PLAN.md`) with consented test audio; no production change.
2. **Server voice status + interfaces** behind flags, default off; browser path unchanged.
3. **Reading mode pilot** (pre-generated reference audio + Azure scripted assessment) for opt-in testers.
4. **Speaking mode pilot** (realtime) with minute ceilings; browser STT remains the fallback.
5. Switch defaults per feature only when `VOICE_ACCEPTANCE_CRITERIA.md` is met; rollback = flip the env variable back to `browser`.

## 10. Open decisions
OD-01 (residency/law), OD-07 (retention), OD-09/OD-18 (allowances and budget), new **OD-21** (provider contracts), **OD-22** (voice consent and recording policy), **OD-23** (benchmark recording budget and reviewers), **OD-24** (default reference accent) — see `phase-0.2/OWNER_DECISION_REGISTER.md` §7.
