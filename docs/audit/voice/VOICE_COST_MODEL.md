# Voice Cost Model

Status: **estimate**. List prices in USD are from the official price pages retrieved 2026-11-14 (sources in `SPEECH_PROVIDER_COMPARISON.md` §7). The prices exclude tax, free tiers, negotiated discounts and currency conversion. Every number must be re-checked before pricing decisions. Real costs come from provider-reported usage during the benchmark, not from this sheet.

## 1. Unit prices used
| Item | Price | Source note |
|---|---|---|
| Azure STT real-time | $1.00 / audio hour ($0.0167/min) | calculator data, US East = West Europe |
| Azure pronunciation prosody add-on | $0.30 / hour per feature | "enhanced add-on". How it combines with the base STT charge is UNVERIFIED |
| Azure Neural TTS / Neural HD | $15 / $22 per 1M chars | |
| Google STT V2 standard | $0.016 / min (first 500k min/month) | that `chirp_3` bills at this rate is UNVERIFIED |
| Google Chirp 3 HD TTS | $30 / 1M chars (first 1M/month free) | |
| ElevenLabs Scribe v3 / v3 Live | $0.20 / $0.22 per hour | |
| ElevenLabs TTS v4 / v4 Turbo | $0.08 / $0.04 per 1K chars ($80 / $40 per 1M) | |
| ElevenLabs Realtime v1 Mini/Max | $0.08 / min **+ LLM usage** | |
| OpenAI `gpt-realtime-2.1` | audio in $32, out $64, cached in $0.40 per 1M tokens; text in $4, out $24 | |
| OpenAI `gpt-realtime-2.1-mini` | audio in $10, out $20, cached $0.30; text in $0.60, out $2.40 | |
| OpenAI `gpt-live-1` | $0.05 / min (per second) + backend model | WebRTC creation bills 15 s up front, credited against the session |
| OpenAI `gpt-transcribe` / `gpt-live-transcribe` | $0.0045 / $0.017 per min | |

OpenAI token rates (documented): user audio = **1 token per 100 ms** (600 tokens/min); assistant audio = **1 token per 50 ms** (1,200 tokens/min). Each new response re-reads the whole conversation as input. Earlier turns are billed as **cached** input only when the prompt cache hits, which is not guaranteed.

## 2. Reference conversation minute
Assumptions to validate in the benchmark:
- The learner speaks 30 s and the tutor 25 s.
- There are 5 s of silence and about 4 turns per minute.
- The system prompt is about 1,500 text tokens.
- The tutor speaks at about 15 characters per second, roughly 375 characters per minute.

## 3. Realtime speech-to-speech: 10-minute session (40 turns)
History grows by about 800 audio tokens a minute. Summed over 40 responses, about 164k audio tokens and 60k text tokens are re-read.

| Model | Good caching (most history cached) | No caching (worst case) | Per minute |
|---|---|---|---|
| `gpt-realtime-2.1` | fresh user audio 3k × $32 ≈ $0.10; cached history ≈ $0.06; output audio 5k × $64 ≈ $0.32; prompt ≈ $0.02 → **≈ $0.50** | history 164k × $32 ≈ $5.25 + output $0.32 + prompt $0.24 → **≈ $5.80** | **$0.05 – $0.58** |
| `gpt-realtime-2.1-mini` | ≈ $0.03 + $0.05 + $0.10 → **≈ $0.18** | ≈ $1.64 + $0.10 + $0.04 → **≈ $1.78** | **$0.018 – $0.18** |
| `gpt-live-1` | $0.50 + backend LLM | same | **$0.05 + LLM** |
| ElevenLabs Realtime v1 Mini | $0.80 + LLM | same | **$0.08 + LLM** |

Controls that keep costs near the low end:
- Cap each session at 10 minutes.
- Truncate or summarise history every 3–4 minutes, so a new session is seeded with the summary.
- Keep the system prompt stable at the top so the cache hits.
- Use `-mini` by default.
- Close the session after 60 s of silence.

Text tokens for the transcript of the assistant's audio are not included above (UNVERIFIED whether they are billed separately). Measure them in the benchmark.

## 4. Chained pipeline (STT → LLM → TTS) per conversation minute
| Step | Cost per minute |
|---|---|
| Learner STT (Azure, 30 s) | $0.0083 |
| Pronunciation (Azure STT + prosody on 30 s) | ≈ $0.0108 (UNVERIFIED combination) |
| LLM feedback/answer (4 short turns; depends on the `server/ai.ts` model) | ≈ $0.002 – $0.02 |
| Tutor TTS, 375 chars: Azure HD $0.008 · ElevenLabs v4 Turbo $0.015 · Google Chirp 3 HD $0.011 | $0.008 – $0.015 |
| **Total** | **≈ $0.03 – $0.055** |

The chained pipeline is cheaper and fully meterable, but turn latency and barge-in are worse. The benchmark decides whether it is good enough for Speaking mode. It is the default candidate for AI Teacher explanations.

## 5. Reading mode
- **Reference audio** is generated once and cached. For example, 1,000 sentences × 90 chars × 2 accents = 180k chars costs about $4 with Azure HD, $5.40 with Google Chirp 3 HD, or $14.40 with ElevenLabs v4 (all one-time).
- **One assessed attempt** (10 s of audio) costs about $0.0028 for STT plus $0.0008 for prosody, roughly **$0.0036**. One hundred attempts cost about **$0.36**.

## 6. Uzbek TTS
- An Azure neural explanation of about 100 chars costs about $0.0015.
- The existing disk cache in `server/tts.ts` makes repeated phrases free.
- ElevenLabs v4 costs about $0.008 for the same 100 chars.

## 7. Monthly cost per active learner (speaking allowance is an unapproved hypothesis, OD-18)
| Allowance | Chained pipeline | `2.1-mini` realtime | `2.1` realtime | `gpt-live-1` (+LLM) |
|---|---|---|---|---|
| 30 min | $0.9 – $1.7 | $0.5 – $5.4 | $1.5 – $17 | $1.5 + LLM |
| 60 min | $1.8 – $3.3 | $1.1 – $11 | $3 – $35 | $3 + LLM |
| 120 min | $3.6 – $6.6 | $2.2 – $22 | $6 – $70 | $6 + LLM |

Add Reading mode: 300 attempts a month ≈ $1.1. Compare this with the hypothesis prices in DR-05 ($5.99–$9.99, unapproved).

**Implications:**
- Full `gpt-realtime-2.1` with unlimited minutes cannot fit the hypothesis prices.
- Realtime minutes must be capped per plan and reserved before each session (`VOICE_ENGINE_ARCHITECTURE.md` §6).
- The default speaking path should be `-mini`, `gpt-live-1`, or the chained pipeline, whichever passes the benchmark.

## 8. Credit reservation values (initial, to tune)
- **Reserve per session:** `VOICE_SESSION_MAX_MINUTES` × the high-end per-minute rate of the configured model (worst case, no cache).
- **Settle** on provider-reported usage.
- **Global daily ceiling:** `VOICE_GLOBAL_DAILY_MINUTES` (default 0 = off) prevents a runaway bill even if many users start sessions at once.

## 9. Cost of the recommended split (see architecture §11)
- AI Tutor live chat, 120 min/month at full use: `2.1-mini` ≈ $2.2–$22, `gpt-live-1` ≈ $6 + LLM, ElevenLabs Realtime ≈ $9.6 + LLM, full `gpt-realtime-2.1` ≈ $6–$70. Average use is usually below the allowance, but pricing must survive full use → 120 min fits only a top plan, or a cheaper realtime model that passes the benchmark.
- Speaking practice feedback turn (≈ 30 s answer + ≈ 150 chars of voiced feedback): STT + assessment ≈ $0.011 + LLM ≈ $0.005 + ElevenLabs v4 TTS ≈ $0.012 → **≈ $0.03 per answer**; 300 answers/month ≈ $9 at the high end, ≈ $4–5 with Azure/Google TTS for neutral lines and ElevenLabs only for emotional ones. Fixed roast phrases without slots are pre-generated once and cached.

## 10. Check against the owner's tariffs (2026-11-15; `MONETIZATION_SPEC.md` §7)
Revenue at 1 USD ≈ 12 500 so‘m [U]: GENERAL $5.5, EXAM $7.9, ALL ACCESS $10.3 per month, before fees and tax.
- **One AI Speaking assessment** (full mock, ≈ 12–14 min audio): naive (Azure STT + Azure assessment on all audio + LLM) ≈ $0.35–0.55; **optimised** (cheap STT for the transcript, e.g. Scribe v3 $0.22/h ≈ $0.05, + Azure scripted pronunciation on a 3-min sample ≈ $0.07, + LLM ≈ $0.02–0.04) ≈ **$0.15**. 20/month: $3 optimised vs $11 naive.
- **One AI Writing assessment:** LLM only, ≈ $0.02–0.08 depending on model.
- **Live voice minutes:** fit the plans only on a model at ≈ $0.02–0.05 per minute (`2.1-mini` with caching, or `gpt-live-1` at $0.05 + backend) — full `gpt-realtime-2.1` at up to $0.58/min would make 120 min cost more than the ALL ACCESS price. Benchmark acceptance must therefore include a cost gate (`VOICE_ACCEPTANCE_CRITERIA.md` §5).
- **Assessed speaking practice** (lessons, "Jim qolma!") is not in the owner's limit table → recommend a fair-use daily cap (e.g. 20 assessed answers/day) so a heavy user cannot cost more than the plan.
