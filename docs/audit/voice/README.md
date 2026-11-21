# Voice research set (2026-11-14)

Research, architecture and test plan for Sellzen's speech and voice engine. **Nothing here is implemented**; no provider integration was added, no paid API request was sent, and production code, database and deployment are unchanged.

| Document | Purpose |
|---|---|
| `SPEECH_PROVIDER_COMPARISON.md` | Source-checked facts per provider (STT, English TTS, Uzbek TTS, pronunciation, realtime) + primary/fallback hypothesis |
| `VOICE_ENGINE_ARCHITECTURE.md` | Interfaces, env config, honest failure, sessions, retries, metering/credits, telemetry, migration plan |
| `PRONUNCIATION_ASSESSMENT_SPEC.md` | Reading (scripted) and Speaking (unscripted) assessment, score model, limits |
| `UZBEK_SPEECH_SUPPORT.md` | Uzbek STT/TTS support and the Uzbek test matrix |
| `VOICE_BENCHMARK_PLAN.md` | Corpus (50 Uzbek, 50 learner, 30 TTS, 20 mixed), metrics, procedure, matrix template, test sentences |
| `VOICE_COST_MODEL.md` | Unit prices and per-minute / per-learner cost estimates |
| `VOICE_ACCEPTANCE_CRITERIA.md` | Measurable go-live gates per feature |
| `MIXED_LANGUAGE_TUTOR_SPEC.md` | Uzbek task → English answer → exact error quoted back → mixed uz+en feedback, personality and scolding rules |

Open owner decisions: OD-01, OD-07, OD-18, OD-21 … OD-24 (`phase-0.2/OWNER_DECISION_REGISTER.md` §7).
