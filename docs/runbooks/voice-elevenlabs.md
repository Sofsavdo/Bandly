# Runbook — Mirzaev tutor voice (ElevenLabs) on Railway

Status: code is on the branch and **off by default**. Nothing changes in production until the owner (1) approves a deploy and (2) sets the variables below in Railway **themselves** (never in chat).

## What it does
- The Speaking page's tutor reactions (praise, jokes, roasts from `src/content/roasts.ts`) are spoken by **Mirzaev – Uzbek** on **`eleven_v4_turbo`** through the existing `POST /api/tts` route.
- Emotions become Eleven v4 audio tags on the server (`angry → [shouting]`, `laugh → [laughs]`, `disappointed → [sighs]`, `happy → [warmly]`, `impressed → [excited]`). Any `[...]` inside client text is stripped, so a learner cannot inject tags.
- Identical lines are cached on disk (`TTS_CACHE_DIR`) and cost nothing the second time.
- Every provider call (cache misses only) is written to `ai_cost_events`; `GET /api/admin/ai-costs?days=30` (header `x-admin: <ADMIN_TOKEN>`) returns cost by day / feature / provider / model.
- Limits (OD-25): **5 new voiced answers per learner per day** (`VOICE_DAILY_ANSWERS`, cached lines don't count) + platform daily character ceiling (`VOICE_GLOBAL_DAILY_CHARS`). A failed provider call refunds both. When a limit is hit the browser voice is used instead — the page keeps working.
- Fail-closed: without `ELEVENLABS_API_KEY` **or** with `VOICE_GLOBAL_DAILY_CHARS` unset/0, the voice is off (`/api/tts/status` → `enabled: false`) and the old browser/Azure path is used.

## Railway variables (service `bandly`, environment `production`)
| Variable | Value | Note |
|---|---|---|
| `TTS_PROVIDER` | `elevenlabs` | selects ElevenLabs instead of Azure |
| `ELEVENLABS_API_KEY` | *(new key from elevenlabs.io → API keys)* | enter in Railway only; never in chat or code |
| `VOICE_GLOBAL_DAILY_CHARS` | `2500` on Starter | Turbo = 0.5 credit per character; Starter = 40 000 credits/month ≈ 80 000 characters ≈ **2 600/day**. 2 500/day ≈ 37 500 credits/month, roughly 15–20 new voiced answers a day across all learners (cached lines are free). Raise it when the ElevenLabs plan is upgraded. |
| `VOICE_DAILY_ANSWERS` | `5` | owner decision OD-25 (default is already 5) |
| `ELEVENLABS_VOICE_ID` / `ELEVENLABS_MODEL` | *(optional)* | defaults: `RaNVfTYq3HYeFPLng6XN` (Mirzaev), `eleven_v4_turbo`; used to switch to the fallback voice |
| `PRICE_ELEVENLABS_PER_1K_CHARS` | *(optional)* | estimate for the cost ledger; default 0.04 (Turbo API list price) |
| `ADMIN_TOKEN` | *(already used for payments admin)* | needed to read the cost report |

## Check after deploy
1. Deploy log shows `TTS: elevenlabs`.
2. `GET /api/tts/status` → `{"enabled":true,"provider":"elevenlabs","model":"eleven_v4_turbo",...}`.
3. Open Speaking, answer once, hear Mirzaev; `GET /api/admin/ai-costs` shows one `tts_feedback` row.

## Roll back
Remove `TTS_PROVIDER` (or set `VOICE_GLOBAL_DAILY_CHARS=0`) in Railway → redeploy/restart → the browser voice is used again. No data migration is involved (the new `ai_cost_events` table is additive).

## Known limits
- Only the Speaking page reactions use it so far. Pronunciation pin-pointing («shkul» → school from the learner's real audio) needs an assessment provider (Azure key, OD-21) and is not built yet; today the error comes from the existing rule-based checks.
- Mirzaev has a 30-day withdrawal notice in the ElevenLabs library → keep a fallback voice (set `ELEVENLABS_VOICE_ID`).
- Credits on Starter are a monthly pool; the ledger cost is an **estimate** at API list price.
