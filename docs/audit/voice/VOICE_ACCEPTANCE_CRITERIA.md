# Voice Acceptance Criteria

Status: **proposed thresholds, pending owner approval (OD-23)**. A voice feature can be switched on for users only when every gate in its row passes on the benchmark in `VOICE_BENCHMARK_PLAN.md`, run on real Bandly-like audio. Thresholds are deliberately not "100 %": no provider can guarantee perfect recognition or a perfectly accent-free voice. They are measurable targets that are re-checked after each provider or model change.

## 1. Speech recognition
| Gate | Uzbek STT | English learner STT |
|---|---|---|
| WER, clean audio (quiet room, phone mic) | ≤ 15 % mean, ≤ 20 % p90 per speaker | ≤ 12 % for B1+ learners; ≤ 18 % for A2 |
| WER, moderate noise (≈ 15 dB SNR) | ≤ 25 % | ≤ 22 % |
| CER, clean | ≤ 6 % | — |
| Code-switch accuracy (English terms inside Uzbek) | ≥ 85 % of English tokens correct; anglicised Uzbek tokens ≤ 5 % | — |
| Term recall (with keyterms) | ≥ 90 % for the listed names and terms | ≥ 90 % for lesson vocabulary |
| Regional fairness | No region's mean WER more than 1.5× the best region's. If it is, the feature ships with a "beta" label for that region. | No CEFR level's WER more than 1.5× the B2 level's |
| Script | ≥ 99 % of output in Uzbek Latin | n/a |
| Latency (streaming) | first partial ≤ 1.0 s p95; final ≤ 1.5 s after end of speech, p95 | same |

## 2. Pronunciation assessment
| Gate | Threshold |
|---|---|
| Word mispronunciation flags vs. two trained raters | F1 ≥ 0.70; precision ≥ 0.75, so few false "wrong" flags |
| Utterance accuracy vs. mean human rating | Pearson r ≥ 0.6. Microsoft reports > 0.5 on its own data; Bandly asks for more on its target users. |
| Fluency vs. human rating | r ≥ 0.5 |
| Prosody (en-US only) vs. human rating | r ≥ 0.5. If not met, the prosody score is hidden and only qualitative tips are shown. |
| Accent fairness | Utterances rated *intelligible* by both raters must score ≥ 70 accuracy in ≥ 90 % of cases. Accent alone must not cause a "wrong" verdict. |
| Stability | The same recording assessed 3 times gives identical results. Re-recording the same sentence by the same speaker varies by ≤ 10 points in ≥ 80 % of pairs. |
| Latency | result ≤ 3 s p95 for ≤ 15 s of audio |

## 3. English voice (reference and tutor)
| Gate | Threshold |
|---|---|
| Naturalness MOS (≥ 3 native raters, at least 1 US and 1 UK) | ≥ 4.2 mean, no sentence below 3.5 |
| Accent consistency | ≥ 95 % of items rated "consistent US" or "consistent UK" as selected; no audible drift within a session |
| Word stress (Appendix A marked words) | ≥ 95 % correct |
| Intonation (questions, lists, contrast) | ≥ 90 % rated natural |
| Audio stability | 0 truncated words; artificial stutter, glitches or unnatural pauses (> 700 ms inside a phrase) ≤ 1 per 10 minutes of audio |
| Time to first audio (streaming tutor) | ≤ 700 ms p50, ≤ 1.2 s p95 |
| Reference audio | Pre-generated clips are reviewed by a native speaker before publishing (content QA, same rule as lesson content). |

## 4. Uzbek voice
| Gate | Threshold |
|---|---|
| Naturalness MOS (≥ 5 native raters, several regions) | ≥ 3.8 |
| Pronunciation errors | ≤ 1 per 10 sentences on the hard-word set |
| English terms embedded in Uzbek | ≥ 90 % rated understandable. If not met, terms are shown on screen and spoken by the English voice. |
| Personality styles | Only styles rated ≥ 3.5 "fits character" may be advertised. Emotional Uzbek voice remains R&D until then. |

## 5. Realtime tutor
| Gate | Threshold |
|---|---|
| Turn latency (end of learner speech → first tutor audio) | ≤ 1.0 s p50, ≤ 1.6 s p95 |
| Barge-in | Tutor audio stops ≤ 300 ms after the learner starts speaking, in ≥ 95 % of attempts |
| False barge-in (noise or a cough triggers it) | ≤ 5 % of turns in the moderate-noise scenario |
| Premature cut-off (learner pause misread as end of turn) | ≤ 5 % of turns |
| Session failures (disconnects or errors) | ≤ 1 % of sessions |
| Persona and safety | 0 policy violations in the red-team script (Savage mode only after OD-06b, never in exam mode) |
| Cost | Measured p90 cost per minute within the plan budget set under OD-18 |

## 6. Honesty and operations (all voice features)
- With credentials missing or invalid, the feature shows "unavailable" and the text path works. This is covered by an automated test with no keys.
- No score, transcript or voice reply is shown unless a provider returned it. Partial results are labelled as partial.
- The AI-generated voice is disclosed in the UI.
- Usage is metered from provider-reported data; daily ceilings default to 0 (off).
- No learner audio is stored without opt-in. The user can delete their stored transcripts.
- Each threshold has an owner-visible report with the date, provider, model and region it was measured on.

If a gate fails, the feature stays off (or browser-only) and the report says why. Gates are never relaxed silently. A change in threshold is an owner decision recorded in the decision register.

## 7. Mixed-language correction turns (see `MIXED_LANGUAGE_TUTOR_SPEC.md`)
| Gate | Threshold |
|---|---|
| Planted pronunciation errors (set P): right **word** flagged | recall ≥ 85 %, false flags on correctly pronounced target words ≤ 10 % |
| Planted errors, right **sound** named (en-US only) | ≥ 70 % of flagged words name the planted phoneme |
| Grammar errors in learner sentences: correct fix proposed | ≥ 90 % (two-teacher check); invented "errors" ≤ 5 % |
| Mixed feedback MOS (set X, Uzbek raters) | ≥ 3.8; English `model` segments rated "clear native accent" ≥ 90 % |
| Every correction turn contains quote + correct form + repeat request | 100 % (automated check on the tagged output) |
| Roast safety | 0 lines outside the reviewed bank; 0 forbidden-topic lines; Savage levels 2–3 never served without the OD-06b standard; "Yumshat"/stop honoured within one turn in 100 % of tests |
| Turn timing | first reaction ≤ 700 ms p95; full critique ≤ 3 s p95 |
