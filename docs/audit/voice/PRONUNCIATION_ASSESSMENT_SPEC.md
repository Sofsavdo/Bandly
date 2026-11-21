# Pronunciation Assessment Spec

Status: **design only**. Provider facts are from Azure documentation retrieved 2026-11-14 (sources in `SPEECH_PROVIDER_COMPARISON.md` §7). No assessment is run today; the lesson speaking step (`src/components/LessonSpeak.tsx`) is explicitly *not scored* and stays that way until this spec passes `VOICE_ACCEPTANCE_CRITERIA.md`.

## 1. Principles
1. **Intelligibility, not nativeness.** An Uzbek, Russian or Kazakh accent is not an error. Feedback targets sounds and stress that change meaning or block understanding (e.g. *ship/sheep*, *work/walk*, missing final consonants, wrong word stress in *deVELop*), not "sound American".
2. **Each score says what it measures** and its limits; scores are never merged into one opaque "speaking grade" and never presented as an IELTS/CEFR band.
3. **No score without a provider result.** If assessment is unavailable, the UI says so; it never estimates.
4. **Reference accent is the learner's choice** (US or UK); the learner is assessed against that locale.

## 2. Modes
| | Reading (scripted) | Speaking (unscripted) |
|---|---|---|
| Input | known reference text (lesson sentence, passage) + learner audio | free answer + its transcript |
| Azure mode | `ReferenceText` set; `Granularity=Phoneme`; `EnableMiscue=true` for audio ≤ 30 s | no `ReferenceText` (unscripted) **or** Microsoft's recommended path: accurate STT first, then scripted assessment on that transcript |
| Returned | Accuracy, Fluency, **Completeness**, Prosody (en-US only), PronScore; per word ErrorType (Mispronunciation, Omission, Insertion, UnexpectedBreak, MissingBreak, Monotone); per syllable (en-US only) and phoneme accuracy; NBest phonemes; offsets/durations | Accuracy, Fluency, Prosody (en-US only), PronScore; per word ErrorType (Mispronunciation, UnexpectedBreak, MissingBreak, Monotone) |
| Not returned | grammar, vocabulary, relevance | grammar, vocabulary, relevance, completeness |

**Choice for Sellzen:** Speaking uses *STT → scripted assessment on the transcript* by default (Microsoft notes unscripted uses a different, less accurate STT model); unscripted is tested in the benchmark as the alternative.

## 3. Score model shown to the learner
| Dimension | Source | Shown as | Limitation text (shown in UI help) |
|---|---|---|---|
| Pronunciation accuracy | Azure AccuracyScore (phoneme→word→text) | 0–100 + words to practise | "Compared with general native speech in the chosen accent; depends on the speech recogniser hearing you correctly." |
| Fluency | Azure FluencyScore | 0–100 + pause map | "Measures silent breaks between words, not speaking speed alone." |
| Completeness (Reading only) | Azure CompletenessScore | % of text read | "Skipped or added words lower this." |
| Prosody: stress, intonation, rhythm | Azure ProsodyScore + Break/Intonation feedback | 0–100, **only for en-US** | For en-GB: "Ohang bahosi hozircha faqat American English uchun mavjud" (not computed). Monotone flag applies to the whole utterance. |
| Grammar | LLM (`server/ai.ts`) on the transcript, validated against the error taxonomy (`src/lib/adaptive/taxonomy.ts`) | list of corrections with error ids, no numeric score in phase 1 | "AI tavsiyasi — xato bo‘lishi mumkin." |
| Vocabulary range | LLM, CEFR-level hints | qualitative | same |
| Task relevance | LLM vs the prompt | on-topic / partly / off-topic | same |
| Hesitation | from transcript fillers ("um", "eee", "anu") + Azure UnexpectedBreak with threshold | count per minute | fillers in Uzbek are counted only if STT transcribes them (UNVERIFIED) |

Azure's composite PronScore is stored but **not** shown as a headline (its weights are undocumented and it silently drops Prosody/Completeness when unavailable).

## 4. Thresholds and feedback rules
- Word flagged for practice when word AccuracyScore < 60 **and** the phoneme with the lowest score < 50, or ErrorType ≠ None. Break errors use Azure's suggested confidence threshold **0.75**, tuned in the benchmark.
- Max 3 practice words per sentence and max 1 prosody tip per turn (avoid overload).
- Low-confidence guard: if STT confidence/quality is poor (noise, < 16 kHz, distance) or the utterance is < 1.5 s, show "Yaxshi eshitilmadi — qayta o‘qing" instead of scores (Azure advises re-recording on low scores in noisy conditions).
- Children/beginners: thresholds are lower for A1–A2 (Azure guidance: adapt thresholds to the learner group); values set from benchmark data, not guessed.

## 5. Known limitations (must appear in help/FAQ)
1. Prosody only for **en-US**; syllable groups and IPA phoneme names only for **en-US**.
2. Audio > 30 s requires continuous mode, where miscue (omission/insertion) detection is not provided → Sellzen limits a Reading item to ≤ 30 s or computes omissions itself by aligning the recognised words with the reference.
3. No mixed-language assessment: an Uzbek word inside an English answer will be scored as an English mispronunciation → Speaking mode strips detected non-English spans before assessment (needs language-tagged STT; UNVERIFIED quality).
4. Single speaker only; background voices lower confidence.
5. Correlation with human judges is a vendor figure (Pearson > 0.5, Microsoft's evaluation); Sellzen measures its own on learner data (`VOICE_BENCHMARK_PLAN.md` §5).
6. Content assessment (grammar/vocabulary/topic) was retired from Speech SDK 1.46.0+; Sellzen uses its own LLM layer instead.

## 6. Data and storage
- Audio is streamed to the provider for the assessment and **not stored** by Sellzen by default. The JSON result (scores, word/phoneme errors, no audio) is stored with the attempt so mistakes can feed the mistake-repetition loop (`src/lib/mistakes.ts`) and mastery (`src/lib/adaptive/record.ts`).
- Storing learner recordings for replay requires an explicit opt-in and TTL (OD-22).

## 7. Independent second assessor (optional)
A second provider is only added if the benchmark shows Azure's agreement with human raters below the acceptance threshold. Candidates (e.g. dedicated pronunciation APIs) are **UNVERIFIED**: their official documentation has not been reviewed and their hosts are not in the environment allow-list; they need a separate review and owner approval.
