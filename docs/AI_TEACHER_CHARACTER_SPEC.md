# AI Teacher Character Spec

Status: **concept briefs for owner review. No final character is chosen; nothing is drawn or coded yet.**
Direction (owner, 2026-11-15):
- Two original **semi-realistic 2D** teachers, one man and one woman.
- They are not a sticker mascot and not a photoreal video avatar.
- The current Bandi mascot (`src/components/Mascot.tsx`) is no longer the AI Teacher image (PXD-08).

**Originality rule.** The characters must not resemble a real person, a celebrity, a voice owner, or any other product's character, including competitors' tutors. Every reference below is a *type*, not a person. All artwork is commissioned or created with written IP assignment to the Bandly owner (PXD-13).

## 1. Where the teacher appears
| Place | Teacher | States allowed |
|---|---|---|
| AI Teacher (live voice chat, minute-limited) | full bust | all 8 + neutral |
| General English lessons (explanation, feedback) | small bust or portrait in the feedback sheet | all 8 (Savage tone only with 18+ opt-in under OD-06b) |
| Speaking practice (turn-based feedback) | bust | all 8 |
| Speaking **mock exam** | **neutral / professional only**, static or blink-only | neutral, listening |
| Reading / Listening / Writing / SAT exam screens | **never** | — |
| Dashboard, Learning Map | small portrait with a daily line | happy, thinking |

## 2. Concept briefs
### 2.1 Male teacher (working name "Ustoz M"; final name is PXD-07)
- **Identity:** a confident, quick-witted English teacher and exam coach in his early 30s. He feels like the best teacher at a top Tashkent learning centre: demanding, funny, and on your side.
- **Face structure:**
  - oval face, defined jaw;
  - warm medium skin tone;
  - dark brown eyes with expressive, slightly thick eyebrows (key for anger and sarcasm);
  - short, neatly trimmed beard shadow (optional variant A/B).
- **Hair:** short dark hair, textured top, clean sides.
- **Clothing:**
  - smart-casual: navy overshirt over a white tee, sleeves pushed up;
  - an optional thin-frame glasses variant for "Strict Examiner".
- **Age impression:** 30–35.
- **Personality:**
  - Default: energetic and direct.
  - Savage mode: theatrical anger and roasting about mistakes only.
  - Examiner mode: calm and formal.
- **Professional identity:** a small Bandly lanyard or pin in brand coral. No school logos.
- **Voice:** owner-approved **Mirzaev – Uzbek** (ElevenLabs `RaNVfTYq3HYeFPLng6XN`) on `eleven_v4_turbo`, already wired behind `/api/tts` (off by default).
  - English model lines: the same voice speaks English fluently. If raters find his English accent weak, model words are spoken by **Max (US)** or **Alistair (UK)** (owner-chosen pre-made voices).
- **English style:** short sentences, clear stress, models the correct phrase twice when correcting.
- **Uzbek style:** Tashkent-neutral, informal "sen" in Savage and Comedy, "siz" in Friendly and Examiner. Uses everyday fillers sparingly ("qani", "xullas").

### 2.2 Female teacher (working name "Ustoz F"; final name is PXD-07)
- **Identity:** a sharp, warm IELTS specialist in her late 20s to early 30s, the kind of teacher who notices every mistake and makes you laugh about it. Calm authority, very precise English.
- **Face structure:**
  - soft heart-shaped face;
  - warm light-medium skin tone;
  - almond-shaped dark eyes with a strong eyebrow line;
  - a natural smile with a slight asymmetric "smirk" (key for sarcasm).
- **Hair:** shoulder-length dark brown hair, loose waves or a low ponytail variant. Optional headscarf variant (PXD-07), designed with the same expression rig.
- **Clothing:** a modern blazer (deep teal or burgundy) over a plain top; small earrings; no logos.
- **Age impression:** 28–33.
- **Personality:**
  - Default: encouraging and witty.
  - Savage mode: dry sarcasm rather than shouting.
  - Examiner mode: neutral and exact.
- **Voice:** a **female Uzbek voice is not yet selected**. Candidate: "Javohir – Calm, Natural, Confident" (ElevenLabs library, female, Uzbek verified on `eleven_v4` / `eleven_v4_turbo`, 730-day notice). It needs a listening demo like the male voice (about 1 000 credits) and owner choice (PXD-07). English model lines: **Hope (US)** or **Sarah (UK)**.
- **English and Uzbek style:** as for Ustoz M, with more irony and less volume in Savage mode.

### 2.3 Shared art direction
- **Style:**
  - semi-realistic 2D with clean vector or painted shapes and soft cel shading;
  - a subtle rim light in the brand coral;
  - shoulders-up bust, framed at 3/4.
- **Palette:**
  - skin and hair in natural tones;
  - wardrobe in navy #1e2a4a and teal #0f766e (F) or burgundy #7f1d1d (F alternative);
  - brand coral #ff4b3a only for accents (pin, rim light);
  - backgrounds neutral (`--surface-2`) or a soft level colour on the Learning Map.
- **Line:** thin warm-dark outline (#2a1f1a), no thick sticker outlines.
- **Background:** transparent. Bandly places the teacher on its own surface.

## 3. Expression sheet: 8 emotions + neutral
These map to the emotions already produced by the coach (`COACH_EMOTIONS` in `src/content/personas.ts`: neutral, happy, laugh, angry, disappointed, impressed, serious, sarcastic). They also map to the voice tags in `server/tts.ts` (`EL_TAG`). Thinking and Listening are **UI states**, set by the app, not by the LLM.

| # | Emotion (source) | Eyes | Eyebrows | Mouth | Head | When used | Voice tag |
|---|---|---|---|---|---|---|---|
| 1 | **Happy** (`happy`) | slightly narrowed, cheeks raised | relaxed, slightly up | open smile, teeth visible | small tilt (5°) | correct answer, lesson pass, greeting | `[warmly]` |
| 2 | **Laughing** (`laugh`) | squeezed almost shut | up, arched | wide open laugh | tilted back 8°, small bounce | funny mistake (Comedy/Savage), good joke | `[laughs]` |
| 3 | **Angry** (`angry`, Savage only) | wide, intense | pulled down and together | open, shouting shape | forward lean 6° | repeated basic mistake, roast lines level 2–3 | `[shouting]` |
| 4 | **Sarcastic** (`sarcastic`) | half-lidded, side glance | one raised | lopsided smirk | tilt + small turn 10° | ironic praise of a wrong answer | `[sarcastic]` (new mapping) |
| 5 | **Disappointed** (`disappointed`) | looking down, lids lowered | inner corners up | flat or slight frown, closed | slow shake | wrong after a hint, broken streak | `[sighs]` |
| 6 | **Surprised** (`impressed`) | wide open, raised lids | high | small "o" | pulls back slightly | unexpectedly good answer, C-level word used | `[excited]` |
| 7 | **Thinking** (UI state: waiting for STT/LLM) | looking up-side | one slightly raised | closed, slight press | hand or chin (optional) or tilt | while the request is processing (≤ 3 s target) | — |
| 8 | **Listening** (UI state: mic open) | attentive, steady | neutral-soft | closed, gentle smile | small nod every 2–3 s | the learner is speaking | — |
| 0 | **Neutral / professional** (`neutral`, `serious`) | relaxed, direct gaze | neutral | closed | still | Examiner persona, Speaking mock, default | none |

**Emotion selection rule:**
- The emotion comes from the **Personality Engine + reply content**: the coach JSON `emotion` field, validated against `COACH_EMOTIONS`, plus persona gating. It **never** comes from audio loudness.
- The Savage-only emotions (angry, harsh sarcasm) are dropped to `disappointed` or `neutral` when the persona is not Savage or the user is not an age-confirmed adult.
- In exam mode the emotion is always neutral.

## 4. Animation
| Element | Method | Budget |
|---|---|---|
| Expressions | layered assets: base head + **expression layer** (eyes, eyebrows, mouth) per emotion; cross-fade 150 ms between emotions | 9 expression layers per character |
| Mouth (speech) | 3–4 mouth shapes (closed, mid, open, "o"), driven by **audio amplitude** of the playing clip (Web Audio `AnalyserNode` RMS, 30 fps). Optional upgrade: character timestamps from ElevenLabs "text-to-speech with timestamps" for better sync [U]. | ≤ 2 % CPU on a mid-range phone |
| Blink | overlay frame every 3–6 s (random), 120 ms | — |
| Eye movement | small pupil offset toward the question card or the mic, eased | — |
| Head movement | ±3° rotation and ±2 px bob on speech peaks; idle breathe (scale 1.00–1.01, 4 s) | — |
| Listening | slow nod, level-meter ring around the avatar | — |
| Speaking | mouth sync + emotion layer; subtitles show the text | — |
| Idle | blink + breathe only; paused when the tab is hidden | — |
| Transitions | emotion cross-fade 150 ms; no morphing | — |
| Reduced motion | static expression swap only; no head movement or bob | — |

- **Format:** WebP or AVIF sprite layers, or layered SVG if the illustrator delivers vector.
  - Target ≤ 250 KB per character for the bust set, lazy-loaded after first paint.
  - Lottie or Rive only if they stay within the budget [U].
- **Fallback:** if assets fail to load, a neutral portrait is shown; if audio is blocked, subtitles appear.

## 5. Voice integration (fits `docs/audit/voice/VOICE_ENGINE_ARCHITECTURE.md`)
- **Turn-based feedback:**
  - The flow is `POST /api/tts` (ElevenLabs, text + emotion → `EL_TAG`), returning cached MP3 and playback that drives the mouth.
  - Limits: 5 new voiced answers a day per learner, a global character ceiling, and cost logged to `ai_cost_events`.
  - When the limit is hit or there is no key: browser voice + the same character, no voice cost.
- **Live AI Teacher (realtime, minute-limited):** the same character and states.
  - Mouth amplitude comes from the remote audio stream.
  - Thinking and Listening come from the realtime session events (VAD speech start/stop).
  - Realtime provider still pending (OD-21).
- **Persona → teacher mapping (default, PXD-07):**
  - Ustoz M: Savage, Comedy, Debate.
  - Ustoz F: Friendly, Strict Examiner.
  - The learner can choose either teacher for any persona.
- **Licensing:** library voices are used under the ElevenLabs plan terms. The Starter plan includes a commercial licence (account verified 2026-11-15). Voice-library terms for commercial use of shared voices must be re-read before launch [U]. Mirzaev's 30-day withdrawal notice means a fallback voice must be kept (Runbook `voice-elevenlabs.md`).

## 6. Mobile layout examples
```
Lesson feedback (wrong answer, Savage)        AI Teacher live chat
┌──────────────────────────┐                  ┌──────────────────────────┐
│ ✕  ▰▰▰▱▱   ❤4   🔥0      │                  │ ←  Ustoz M · Savage  ⏱ 12:30│
│                          │                  │                          │
│  Choose the right form…  │                  │     ┌──────────────┐     │
│  ( ) went   (●) go       │                  │     │  teacher     │     │
├──────────────────────────┤                  │     │  bust, angry │     │
│ ┌────┐ «Go» deysanmi?!   │                  │     └──────────────┘     │
│ │ :( │ Yesterday → went! │                  │  ring: red (emotion)     │
│ └────┘ ✔ went            │                  │  "Voy! «I go yesterday»…"│
│ [ 🔊 Qayta eshit ]        │                  │  subtitles ▾             │
│ [     Davom etish     ]  │                  │  ( ● ) Gapiring…  🔇  ⌨   │
└──────────────────────────┘                  └──────────────────────────┘
```

## 7. Deliverables before any drawing is coded (owner chooses)
1. Concept brief M and F (this file, §2).
2. **Two concept sketches per character**: variant A/B of hair and clothing; female headscarf option. Produced by an illustrator or by image generation with illustrator clean-up (PXD-13).
3. **8+1 expression sheet** per character, on one page.
4. Colour palette swatches and clothing references (§2.3).
5. Animation state storyboard (§4) and one 10-second animatic: idle → listening → thinking → angry → laughing.
6. Mobile layout examples (§6) with real art.

## 8. Acceptance criteria
- An owner-approved art set, with written IP assignment.
- Each expression is recognisable to ≥ 4 of 5 test users without labels.
- The mouth sync error is not noticeable in a 10-clip test (median score ≥ 4/5).
- Total teacher assets ≤ 250 KB per character, and no layout shift on load.
- With reduced motion: no motion except cross-fades.
- Exam screens never render the animated teacher; this is checked by an automated test.
