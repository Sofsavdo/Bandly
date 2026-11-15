# Mixed-Language Tutor Spec

Status: **design only — nothing implemented.** This spec records the owner's requirement from 2026-11-15. Provider capabilities are taken from `SPEECH_PROVIDER_COMPARISON.md`; anything that spec marks UNVERIFIED stays unverified here.

## 1. Owner requirement
1. The AI tutor gives tasks and questions in the **learner's language** (Uzbek first; ru/kk/ky/tg later). The learner answers **in English**: a word, a sentence, or their own opinion.
2. The tutor finds the **exact** mistake (word, sound, grammar, or whole sentence), **quotes it back** the way the learner said it, gives the correct form, and asks for a repeat. The owner's example: *school* read as written ("s-ch-ool" / "shkul") instead of /skuːl/ ("skul").
3. In the Savage personality the tutor may scold, mock and use light swearing about the mistake, for example: "Axmoq, *school* shunaqa o‘qiladimi? *Skul* deyiladi! Ingliz tilini bilaman deb o‘ylayapsanmi?"
4. One turn mixes the learner's language and English **in a single, natural conversation**.

## 2. Conversation loop
```
Tutor (uz): "Dam olish kuni nima qilganingni inglizcha aytib ber."
Learner (en): "Last weekend I go to the shkul and meet my friends."
  ├─ STT (English)             → transcript + word timings
  ├─ Pronunciation assessment  → per-word / per-phoneme errors (school: /sk/ heard as /ʃk/)
  └─ LLM analysis              → grammar (go→went, meet→met), vocabulary, task relevance
Tutor (mixed): [uz] "Ikkita xato. Birinchisi: sen" [quote] "shkul" [uz] "deding. To‘g‘risi —" [en-model] "school" [uz] ", 'skul'. Ikkinchisi: o‘tgan zamon kerak —" [en-model] "Last weekend I went to school and met my friends." [uz] "Qani, qaytar!"
Learner repeats → only the failed items are re-assessed → praise, or a new roast and another try
Failed items → mistakes queue (src/lib/mistakes.ts) + mastery (src/lib/adaptive/record.ts) for spaced repetition
```
- **Correction turns** (after each learner answer) use the **chained pipeline**: STT → assessment + LLM → tagged text → TTS. This gives exact control over what is quoted and what is corrected, and every score is real provider output.
- **Free talk** (a debate or small talk without scoring) may use a realtime speech-to-speech model when it passes the benchmark (`VOICE_ACCEPTANCE_CRITERIA.md` §5).
- **Latency:** a short reaction plays first (emotion sound or "Hmm…", within ≤ 700 ms), then the full critique once analysis finishes (target ≤ 3 s p95). The learner is never left in silence.

## 3. Tagged tutor output (one format for all providers)
The LLM returns structured segments; the server validates them and sends them to TTS. Free text from the LLM is never spoken raw.
```json
{ "segments": [
  { "lang": "uz", "role": "speech",  "emotion": "angry", "text": "Axmoq, sen" },
  { "lang": "uz", "role": "quote_wrong", "text": "shkul" },
  { "lang": "uz", "role": "speech",  "text": "deding. To‘g‘risi —" },
  { "lang": "en", "role": "model",   "text": "school", "accent": "en-US" },
  { "lang": "uz", "role": "speech",  "text": ". Qani, qaytar!" }
], "errors": [ { "type": "P.spelling_pronunciation", "word": "school", "heard": "ʃkuːl", "expected": "skuːl" } ] }
```
- `quote_wrong`: the learner's mistake written in **Uzbek letters**, so the Uzbek voice reproduces it naturally ("shkul", "vork", "tink").
- `model`: the correct English, always spoken by the **English voice in the learner's chosen accent** (US/UK) at a slightly slower rate.
- `lang` here is the explanation language (`uz` now). Any language pair works, because the interface, explanation and practice languages are independent settings (`src/i18n/settings.ts`).
- `errors[].type` must exist in the error taxonomy (`src/lib/adaptive/taxonomy.ts`; new pronunciation ids are listed in §5). Otherwise the item is dropped, as `server/coach.ts` already does for grammar.

## 4. How mixed speech is voiced (decided by the benchmark)
| Option | How | Pros | Risks / unverified |
|---|---|---|---|
| **A. One multilingual voice** | One voice speaks every segment: ElevenLabs `eleven_v4` / `eleven_v4_turbo` (`uz` is listed), or an Azure `…MultilingualNeural` / `DragonHDLatestNeural` voice using `<lang xml:lang>` | Most natural; one personality | Uzbek quality UNVERIFIED. **Whether Azure multilingual voices speak Uzbek is UNVERIFIED**: the docs point to the voice-list API, not checked yet. English accent drift inside Uzbek context is possible. |
| **B. Two voices, stitched** | Uzbek segments from `uz-UZ-MadinaNeural` / `SardorNeural`; `model` segments from an English HD voice | Each language is spoken by a native-quality voice. The correct English model sounds clean. Uses providers that are already documented. | An audible voice change at each seam. Azure Uzbek voices have no phoneme control, so `quote_wrong` must be spelled phonetically in Uzbek (which suits them). The seam's naturalness has to be tested. |
| **C. Realtime speech-to-speech** | e.g. `gpt-realtime-2.1` speaks the whole turn | Lowest latency; can interrupt | Uzbek UNVERIFIED. The quote/model distinction is not guaranteed. Pronunciation scores still come from Azure as a tool result. |

**Update 2026-11-15 (owner evidence):** a competing product publicly shows an AI tutor speaking Uzbek mixed with English, scolding and laughing **aloud** with sarcasm, so the effect is achievable in production; the open question is only which voice stack and at what quality. ElevenLabs documents exactly the needed controls: audio tags `[laughs]`, `[laughs harder]`, `[sarcastic]`, `[shouting]`, `[sighs]`, `[mischievously]` and IPA pronunciation in `/…/` on `eleven_v4`, and lists Uzbek for v4/v3. Which provider the competitor uses is unknown and not assumed. Option A with **ElevenLabs `eleven_v4` (pre-generated / non-realtime turns) and `eleven_v4_turbo` (streaming)** is therefore the **first candidate**; segments carry an `emotion` that maps to a tag (`angry`→`[shouting]`, `laugh`→`[laughs]`, `disappointed`→`[sighs]`, sarcasm→`[sarcastic]`), and both `quote_wrong` and `model` can be pinned with IPA (`/ʃkuːl/` vs `/skuːl/`). This replaces the earlier note that an emotional Uzbek voice is only R&D: it is a documented technique whose Uzbek quality still has to pass set X.

Recommendation: build correction turns on **A or B**, chosen by the Uzbek raters' MOS on the mixed-feedback set (benchmark set **X**). Option C is for free talk only, if it passes.

## 5. Finding the exact mistake
- **Pronunciation:** the transcript is re-assessed in scripted mode, as Microsoft recommends (`PRONUNCIATION_ASSESSMENT_SPEC.md` §2).
  - For **en-US** Azure returns, per phoneme, the expected phoneme and the most likely *spoken* phonemes (NBest). Example from Azure's docs: expected /ɛ/, heard /ə/.
  - These are mapped to Uzbek-readable spellings (table below), giving "shkul → skul".
  - For **en-GB**, phoneme names are not provided, so the tutor can only say which **word** was wrong, not which sound.
- **Grammar, vocabulary and relevance:** the LLM works on the transcript, and output is validated against the taxonomy (as in the current coach).
- **Known limit (shown honestly):** STT may "correct" a badly pronounced word, or turn it into another word (e.g. "skull"). When the intended word is unclear, the tutor says "Men 'skull' deb eshitdim — 'school' demoqchimiding?" rather than accusing the learner wrongly.
- Typical errors for Uzbek speakers, to cover first. The new taxonomy ids are proposed and are not in code yet.

| Proposed id | Example | Feedback (uz spelling) |
|---|---|---|
| `P.spelling_pronunciation` (reading as written) | school "shkul/s-ch-ool", knife "knayf", Wednesday "vednesday", island "island" | "skul", "nayf", "uenzdey", "aylend" |
| `P.th` | think → "tink"/"sink", this → "zis" | tilni tishlar orasiga qo‘yib: θ / ð |
| `P.w_v` | work → "vork", west → "vest" | lablarni dumaloq: "uork" |
| `P.vowel_length` | ship / sheep, full / fool | qisqa "i" va cho‘ziq "ii" |
| `P.final_devoicing` | bed → "bet", dog → "dok" | oxirgi tovushni jarangli ayt |
| `P.ed_ending` | worked "vorked", wanted | "uorkt", "uontid" |
| `P.word_stress` | deVElop said as DEvelop, phoTOgraphy | urg‘u qayerda ekanini ko‘rsatish |
| `P.schwa` | banana "ba-na-na", comfortable "kom-for-ta-bl" | kuchsiz unli /ə/ |

## 6. Personality and scolding rules
- **Content comes from Bandly's reviewed line bank**, not freely from the LLM.
  - `src/content/roasts.ts` already has levels 0–3; levels 2–3 include "tentak", "eshak", "ahmoq" with `{wrong}` and `{right}` slots.
  - The LLM picks the error and slot values, and the server picks the line by persona and level.
  - This keeps the tone consistent and works even if a provider refuses to generate insults. Whether TTS providers accept profanity in input is **UNVERIFIED**, so it gets a benchmark item.
- **Every roast contains:** the exact wrong fragment (`quote_wrong`), the correct form (`model`), a one-line reason, and a request to repeat. A roast with no correction is never sent.
- **Target = the mistake and the English.** Never family, religion, ethnicity, gender, appearance, disability, politics or sexual content (rule already in `roasts.ts`). Exaggerated lines like "bu talaffuz bilan odam bo‘lmaysan-ku!" or "ingliz tilini bilaman deb o‘ylayapsanmi?" are level 3 only and always tied to the specific mistake.
- **Access:**
  - Levels 2–3 (swearing) only for users who chose the Savage personality and are 18+ under the standard decided in **OD-06b**.
  - Savage stays **off** until that decision is made.
  - Never in exam or mock mode.
- **Learner control:**
  - A "Yumshat" (soften) button, and the spoken command "stop" or "yetar", drop one level immediately.
  - After 3 failed retries on the same item the tutor softens automatically and shows a slower model.
  - Repeated distress words ("bas qil", "yig‘layapman") switch to the friendly personality.
- **The other personalities use the same loop and pinpointing, with a different tone:**
  - Friendly: gentle correction.
  - Strict Examiner: neutral and precise, no jokes.
  - Comedy: jokes without insults.
  - Debate: pushes back on arguments, not on the learner.

## 7. What this adds to the benchmark and acceptance gates
- **Benchmark set X (mixed tutor feedback):**
  - 20 tutor feedback lines (Appendix C of `VOICE_BENCHMARK_PLAN.md`), voiced with options A, B and, where possible, C.
  - Rated by ≥ 5 native Uzbek raters (naturalness, clarity of the English model word, character fit) and ≥ 3 English raters (accent of the `model` segments).
- **Benchmark set P (planted errors):**
  - ≥ 10 learners deliberately mispronounce 15 target words (school, knife, Wednesday, island, think, this, work, west, ship, sheep, bed, worked, develop, comfortable, banana).
  - Each word is read in a sentence and also on its own.
  - Measure whether the system flags the **right word** and, for en-US, the **right sound**.
- **Gates** are in `VOICE_ACCEPTANCE_CRITERIA.md` §7.

## 8. Restrictions unchanged
- No provider integration and no paid request until OD-21, OD-22 and OD-23 are decided.
- Savage levels 2–3 are blocked until OD-06b.
- Missing keys mean the feature shows "unavailable" and the current browser-based speaking step keeps working.

## 9. Owner listening test result (2026-11-15)
- Demo: 12 lines from `scripts/voice-demo/lines.ts` (friendly, comedy, sarcasm, Savage, examiner, mixed uz+en explanation, IPA, dialect tag), generated with ElevenLabs for two library voices × two models.
- **Chosen tutor voice: "Mirzaev – Uzbek" (`RaNVfTYq3HYeFPLng6XN`) on `eleven_v4_turbo`** — owner: good quality, and Turbo is cheaper (0.5 credit per character vs 1.0 for `eleven_v4`; API list price $0.04 vs $0.08 per 1K chars). "JaysonKhan – Natural Uzbek" was rejected on voice quality; Turbo itself was rated good on both voices.
- Recorded in `server/elevenlabs.ts` as `TUTOR_VOICE` (not wired to any route yet).
- **Risks to manage:** the Mirzaev library voice has a **30-day notice period** (its owner can withdraw it with 30 days' notice; most Uzbek library voices have 730 days) → keep a tested fallback voice (candidates with 730-day notice: Davronbek, Abror, Sodiqjon, Shohjahon; female: Javohir), or create Bandly's own Professional Voice Clone later (Creator plan or higher). Live moderation applies to library voices; Savage lines generated without errors in the demo, but moderation behaviour at scale is UNVERIFIED. ElevenLabs account is on **Starter** (commercial licence, 40 000 credits/month at the time of the test).
- Still to verify with users/raters (benchmark set X): whether `[...]` tags are ever read aloud, the English-word accent inside Uzbek sentences, and the dialect tag (owner did not report a dialect effect).
