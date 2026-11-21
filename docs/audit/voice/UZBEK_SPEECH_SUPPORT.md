# Uzbek Speech Support

Status: **research + test design**. Official support was checked on 2026-11-14 (sources in `SPEECH_PROVIDER_COMPARISON.md` §7). **Official support ≠ real-world accuracy**: nothing below is promised to users until the Uzbek part of `VOICE_BENCHMARK_PLAN.md` passes `VOICE_ACCEPTANCE_CRITERIA.md`.

## 1. What providers officially document
| Need | Google | Azure | ElevenLabs | OpenAI |
|---|---|---|---|---|
| Uzbek STT | Chirp 3 `uz-UZ` **Preview**; in the locations table only under `eu`; punctuation, model adaptation, profanity filter; no word-level confidence | `uz-UZ` (Latin) real-time, batch, fast transcription; **no** multilingual refinement, LLM Speech or MAI-Transcribe; custom speech: plain text only | Scribe v3 / v3 Live list Uzbek; vendor's Scribe v2 tier "Good (>10–20 % WER)" on FLEURS [vendor figure] | not in documented "performs well" list; `uz` hint UNVERIFIED |
| Uzbek + English in one sentence | `auto` = dominant language; language-restricted list possible; mid-sentence: UNVERIFIED | mid-sentence: UNVERIFIED | v3 `secondary_language_codes`; v3 Live `multilang_mode` documents mid-sentence switches | UNVERIFIED |
| Proper nouns / terms | adaptation ≤ 1,000 phrases | phrase list; custom speech plain text | keyterms (1,000 / 10,000 library) | prompt/keywords |
| Uzbek TTS | **none** | `uz-UZ-MadinaNeural` (F), `uz-UZ-SardorNeural` (M); **no phoneme/lexicon/viseme support**, no styles | `uz` listed for `eleven_v4`, `eleven_v4_turbo`, `eleven_v3`, `eleven_v3_conversational` | not listed |
| Script | Latin (`uz-UZ`) | "Uzbek (Latin, Uzbekistan)" | ISO `uzb`, script not stated → check output script (Latin vs Cyrillic) in the test | — |

Implications:
- Sellzen's Uzbek explanation voice today can only be Azure (already integrated, off) or ElevenLabs (untested). Azure cannot be told how to pronounce English words embedded in Uzbek text (no phoneme/lexicon) → test sentences like *"Bu **present perfect** zamoni"* explicitly; if mispronounced, the UI writes the English term on screen and the English voice says it separately.
- "Emotional" Uzbek voice (angry/funny/sarcastic personalities) is **R&D, not a promised feature** (owner decision in `VOICE_ENGINE_SPEC.md`). Azure Uzbek voices list no styles; only rate/pitch prosody (as `src/lib/tts.ts` already does) is available.

## 2. Uzbek STT test matrix
Every cell is tested on **identical audio** for Google Chirp 3 and Azure (required), plus ElevenLabs Scribe v3 Live (recommended because of documented code-switching), using the same normalisation (§4).

| Dimension | Variants (minimum samples per provider run) |
|---|---|
| Script / spelling | Uzbek Latin reference transcripts, official orthography (oʻ, gʻ, sh, ch, ng; apostrophe variants ʼ ' ‘ normalised) |
| Regional accents | Toshkent, Farg‘ona vodiysi (Andijon/Namangan/Farg‘ona), Samarqand/Buxoro, Xorazm, Qashqadaryo/Surxondaryo, Qoraqalpog‘iston (Uzbek speakers) — ≥ 5 speakers each region over the corpus |
| Speed | slow/deliberate, natural, fast (≥ 4 syllables/s) |
| Fillers | "eee", "anu", "haligi", "ya'ni", "xullas", "mmm", restarts |
| Noise | quiet room; home TV/voices; street/transport; classroom (SNR bands ≈ 25 / 15 / 5 dB) |
| Device | mid-range Android (most common), iPhone, laptop mic, Bluetooth headset |
| Code-switching | Uzbek sentence with English terms ("Men **IELTS speaking**da **band 7** olmoqchiman"), English words with Uzbek pronunciation ("kompyuter", "vikend", "deadlayn"), Russian loanwords common in speech ("vapshe", "konechno") |
| Proper nouns & education terms | names (Dilnoza, Shahzod), places (Chirchiq, Nukus), brands, CEFR/IELTS/SAT terms, grammar terms ("present simple", "artikl", "predlog") |
| Speaker demographics | adult women and men, age bands 18–25 / 26–40 / 41+; minors only with guardian consent and only if OD-06 allows |

## 3. Uzbek TTS test matrix
Voices: Azure `uz-UZ-MadinaNeural`, `uz-UZ-SardorNeural`; ElevenLabs `eleven_v4` and `eleven_v3_conversational` with 2–3 library voices that declare Uzbek (UNVERIFIED which exist).

| Criterion | Test material | Rating |
|---|---|---|
| Naturalness | 20 explanation sentences (teacher tone) | MOS 1–5 by ≥ 5 native Uzbek reviewers |
| Pronunciation | 20 sentences with hard words (oʻ/gʻ, double consonants, numbers, dates, abbreviations "AQSh", "BMT") | error count per sentence |
| Embedded English terms | 15 sentences mixing English grammar/exam terms | "term understandable?" yes/no + MOS |
| Intonation | statements vs questions vs exclamations (10 each) | correct contour yes/no |
| Consistency | same text synthesised 3× and across a 2-minute passage | drift / glitches noted |
| Personality fit | 5 lines per personality (friendly, strict examiner, comedy, debate; Savage only if OD-06b approved) | "fits character" 1–5 |

## 4. Scoring rules (Uzbek specifics)
- **WER** after normalisation: lowercase; unify apostrophes (ʻ ʼ ' ‘ ’ → ʻ for oʻ/gʻ, ʼ for tutuq belgisi); numbers written as digits in both reference and hypothesis; punctuation removed; Cyrillic output transliterated to Latin **and counted as a script error** separately.
- **Code-switch accuracy:** share of English tokens inside Uzbek utterances transcribed correctly in English spelling (e.g. "speaking", not "spiking"); separately, share of Uzbek tokens not "anglicised".
- **Term recall:** share of listed proper nouns/terms recognised exactly, with and without adaptation/keyterms.
- **CER** (character error rate) reported alongside WER because Uzbek is agglutinative (one suffix error = one whole word error).

## 5. Risks
- Google Uzbek is **Preview** (terms, quality and availability may change; eu location only per table).
- Azure Uzbek has no multilingual refinement; code-switch quality may be weak.
- ElevenLabs offers the strongest documented code-switch feature but retains data by default; zero retention and data residency are Enterprise-only.
- Every provider processes audio outside Uzbekistan → legal question OD-01 / OD-22 before any real user audio.
