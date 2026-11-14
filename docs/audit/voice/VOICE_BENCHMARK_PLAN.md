# Voice Benchmark Plan

Status: **plan only — not run.** Running it requires owner approval (OD-23), provider keys in Railway variables (never in chat), and consent from every person recorded. No paid request has been sent.

## 1. Goals
Pick a primary and fallback provider for each function — Uzbek STT, English learner STT, pronunciation assessment, English reference TTS (US + UK), Uzbek TTS, realtime tutor — using **identical inputs** and **blind human ratings**, and decide whether each function meets `VOICE_ACCEPTANCE_CRITERIA.md`.

## 2. Corpus (minimums)
| Set | Size | Content | Who |
|---|---|---|---|
| **U** Uzbek speech | **≥ 50 utterances**, 5–20 s, ≥ 20 speakers | matrix in `UZBEK_SPEECH_SUPPORT.md` §2 (accents, speed, fillers, noise, devices, terms) | adult volunteers, written consent |
| **L** English learner speech | **≥ 50 utterances** from ≥ 20 learners, A2–C1 | 25 **read** (reference text known → scripted assessment) + 25 **spontaneous** answers to Bandly speaking prompts | same; CEFR level from Bandly placement |
| **T** English TTS sentences | **≥ 30 sentences** (Appendix A) | stress, connected speech, questions, numbers, names, long sentences | synthesised by each candidate voice, US and UK |
| **M** Mixed-language sentences | **≥ 20 sentences** (Appendix B) | Uzbek + English terms; read by ≥ 5 speakers → ≥ 100 recordings | volunteers |
| **R** Realtime conversations | 10 scripted scenarios × 3 min per provider | interruptions, long pauses, background noise, level change, mixed language | 3 testers |

Recording: 16 kHz+ mono WAV (48 kHz for TTS capture), stored only in the owner-controlled location, deleted after the benchmark unless consent says otherwise. Ground-truth transcripts by two native transcribers; disagreements adjudicated by a third.

## 3. Providers under test (ids from `SPEECH_PROVIDER_COMPARISON.md`)
- STT: Google `chirp_3` (V2, `eu` for Uzbek), Azure real-time `uz-UZ` / `en-US` / `en-GB`, ElevenLabs `scribe_v3` and `scribe_v3_live`, OpenAI `gpt-transcribe` (English; Uzbek only if the API accepts `uz`) — browser Web Speech as baseline.
- Assessment: Azure Pronunciation Assessment (scripted; unscripted; STT→scripted).
- English TTS: Azure `en-US-Ava` / `en-US-Andrew` / `en-GB-Ada` / `en-GB-Ollie` `:DragonHDLatestNeural`; Google Chirp 3 HD 2 US + 2 UK voices; ElevenLabs `eleven_v4` and `eleven_v4_turbo` 2 US + 2 UK library voices; OpenAI `gpt-4o-mini-tts` (`marin`, `cedar`) with accent instructions.
- Uzbek TTS: Azure Madina, Sardor; ElevenLabs `eleven_v4`, `eleven_v3_conversational`.
- Realtime: OpenAI `gpt-realtime-2.1`, `gpt-realtime-2.1-mini`, `gpt-live-1`; ElevenLabs Realtime v1 Mini.

## 4. Metrics and scoring
| Metric | Definition | Applies to |
|---|---|---|
| **WER** | (S + D + I) / N after normalisation (lowercase, punctuation removed, numbers as digits, apostrophes unified; Uzbek rules in `UZBEK_SPEECH_SUPPORT.md` §4); report mean, median and per-condition | U, L, M |
| **CER** | character-level equivalent | U, M |
| **Code-switch accuracy** | correct English tokens inside Uzbek utterances ÷ English tokens; plus Uzbek-token anglicisation rate | M |
| **Term recall** | exact recognition of listed names/terms, with/without keyterms | U, M |
| **Phoneme accuracy agreement** | per-word mispronunciation flags vs two trained raters (precision / recall / F1); Pearson r between provider word/utterance accuracy and mean human rating | L (read) |
| **Fluency/prosody agreement** | Pearson r between FluencyScore/ProsodyScore and human 1–5 ratings | L |
| **Naturalness (MOS)** | 1–5 absolute rating, blind, randomised order, ≥ 5 raters per item | T, Uzbek TTS |
| **Accent consistency** | rater judges "consistent US/UK throughout" yes/no; any drift noted with timestamp | T, R |
| **Stress / intonation correctness** | per marked word/phrase in Appendix A: correct yes/no | T |
| **Audio stability** | glitches, clipped words, artificial stutter, unnatural pauses (> 700 ms inside a phrase), volume jumps — counted per minute | T, R |
| **Latency** | STT: first partial and final after end of speech; TTS: time to first audio byte; realtime: end of user speech → first tutor audio (p50/p95), barge-in stop time | all streaming |
| **Robustness** | failure/timeout rate, reconnects | all |
| **Cost** | provider-reported usage × list price, per minute or per 1K chars | all |

Raters: **≥ 3 native English speakers (at least 1 US, 1 UK)** for English TTS and accent; **≥ 2 trained English teachers** for learner pronunciation; **≥ 5 native Uzbek speakers** from different regions for Uzbek TTS and transcript adjudication. Inter-rater agreement (Krippendorff's α or ICC) reported; items with α < 0.4 reviewed.

## 5. Procedure
1. Freeze corpus and transcripts (hash list).
2. Run every provider with the same files and the same settings documented in a run sheet (model id, region, adaptation on/off, date).
3. Score automatically (WER/CER/latency/cost) with one script; humans rate blind (provider names hidden).
4. Produce the matrix (§6) and a short report; raw results kept with the dated run sheet.
5. Re-run the winner and runner-up after 30 days to detect drift (Preview models especially).

## 6. Comparison matrix template
| Function | Provider / model / voice | Primary metric | Secondary | p95 latency | Cost/unit | Data terms OK? | Meets criteria? |
|---|---|---|---|---|---|---|---|
| Uzbek STT | … | WER | CER, code-switch, term recall | | | | |
| English learner STT | … | WER (by CEFR level) | | | | | |
| Pronunciation | … | F1 vs raters | Pearson r | | | | |
| English TTS US | … | MOS | accent, stress, stability | | | | |
| English TTS UK | … | MOS | accent, stress, stability | | | | |
| Uzbek TTS | … | MOS | pronunciation errors, term intelligibility | | | | |
| Realtime tutor | … | turn latency p95 | barge-in, MOS, accent drift, cost/min | | | | |

**Decision rule:** a provider is eligible only if it meets the acceptance thresholds and the data terms are acceptable under OD-01/OD-22. Among eligible providers choose best primary metric; ties broken by cost then latency. If none is eligible, the feature stays off/browser-only.

## 7. Estimated benchmark spend (list prices, before free tiers)
U+L+M ≈ (50+50+100) × 15 s ≈ 50 min audio per STT provider → < $2 per provider. TTS: 30 sentences × ~90 chars × 2 accents × ~16 voices ≈ 90 K chars → < $8 total. Realtime: 10 × 3 min × 4 configurations ≈ 120 min → roughly $5–$25 depending on model (see `VOICE_COST_MODEL.md`). **Total order of magnitude: under $50**, excluding people's time. Exact amount must be re-checked against current price pages before running.

## Appendix A — English TTS test sentences (original, 30)
1. Keep a *REcord* of it, and *reCORD* it again tomorrow. (noun/verb stress)
2. What do you want to do this weekend?
3. She didn't say *he* stole the money. (contrastive stress)
4. Could you possibly send it by Thursday, the 3rd of October?
5. The photographer took a photograph of the photography class.
6. I've been waiting here since half past seven.
7. Don't you think it's a bit too late to change your mind?
8. Turn left at the second traffic lights, then go straight on.
9. It costs $14.99, or roughly 190,000 sum.
10. Although the results were promising, the researchers remained cautious.
11. Are you coming with us, or are you staying at home?
12. Water, please — not juice.
13. He asked whether I had ever been to Samarkand.
14. Let me think… actually, yes, that would work.
15. The development of renewable energy is economically significant.
16. I'd rather you didn't tell anyone yet.
17. Wow! That's absolutely incredible!
18. Next, read the passage and answer questions one to five.
19. There are three things to remember: plan, practise and review.
20. If I had known about the test, I would have studied harder.
21. Dr. Karimova will see you at 4:30 p.m.
22. Comfortable, vegetable, interesting, Wednesday. (reduced syllables)
23. I can't come today, but I can come tomorrow. (can/can't contrast)
24. Good morning! Today we're going to practise the present perfect.
25. Not only did she win the debate, but she also changed my opinion.
26. Thirteen or thirty? Thirteen.
27. The data suggest that sleep affects memory consolidation.
28. Hmm, that's not quite right. Try again, a little slower.
29. Excuse me, is this seat taken?
30. In conclusion, both approaches have clear advantages and drawbacks.

## Appendix B — Mixed-language sentences (original, 20)
1. Men IELTS speaking'da band seven olmoqchiman.
2. Bugun present perfect bilan past simple farqini o‘rganamiz.
3. Bu gapda article kerakmi — "a" yoki "the"?
4. Listening section'da birinchi to‘rtta savol juda tez edi.
5. Teacher, menga feedback bering, pronunciation qanday?
6. Writing task two uchun 250 ta word yozishim kerak.
7. "Although" bilan "however"ning farqi nima?
8. Men har kuni o‘n beshta new word yodlayman.
9. Mock test natijam reading'da 32 ta to‘g‘ri bo‘ldi.
10. SAT math qismi uchun qancha vaqt beriladi?
11. Bu so‘zning stress'i qayerda — DEvelop yoki deVElop?
12. Speaking part two'da cue card haqida ikki minut gapiraman.
13. CEFR B2 darajasi uchun qaysi grammar mavzular muhim?
14. Men deadline'gacha essay'ni tugatolmadim.
15. Shu phrasal verb'ni misol bilan tushuntirib bering: "give up".
16. Online darsda mikrofonim ishlamay qoldi, sorry.
17. Ertaga Dilnoza bilan Chirchiqda vocabulary takrorlaymiz.
18. Uchinchi conditional'da "would have" ishlatiladi, to‘g‘rimi?
19. Bu sentence'da qaysi tense noto‘g‘ri?
20. Iltimos, sekinroq gapiring, men beginner'man.
