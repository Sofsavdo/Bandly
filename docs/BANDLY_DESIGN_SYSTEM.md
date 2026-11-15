# Bandly Design System

Status: **proposal for owner review. Nothing here is implemented yet.** It builds on the tokens that already ship in `src/styles.css` and `src/brand.ts`. Changes are proposed in small steps; no rewrite.

**Status labels**
- **[EXISTS]**: in the code today.
- **[PARTIAL]**: exists in part.
- **[NEW]**: proposed.
- **[OD]**: needs an owner decision (`PRODUCT_EXPERIENCE_OWNER_DECISIONS.md`).

**Visual references.** The owner supplied eight reference images on 2026-11-15. They are in `design-references/`, with per-image notes on what to take and what to avoid. They show the approved direction: a mobile map-based path, big touch targets, visible XP / hearts / streak / missions / league, celebratory results, and a human tutor (reference 02). Several are other products' screens, so Bandly takes **patterns only**, never art, mascots, names or one-to-one layouts (PXD-01).

---

## 1. Brand identity

### 1.1 Personality
Bandly is a smart, demanding and funny coach.
- **Serious about results.** Exam screens are calm and precise.
- **Playful about practice.** General English feels like a game, but an adult game, not a children's app.
- **Honest.** It never shows fake numbers. Pilot content is labelled. AI failure is shown plainly.
- **Local and global at once.** Uzbek-first explanations, international-standard English.

| Is | Is not |
|---|---|
| premium, clear, energetic | childish, sticker-heavy, noisy |
| warm Uzbek humour (opt-in roast) | humiliating, attacking identity |
| exam-grade precision | "guaranteed band 9" marketing |

### 1.2 Visual direction: two modes, one system
| Mode | Where | Look |
|---|---|---|
| **Play mode** | General English (map, lessons, games, quests, league) | Bold brand colour, level colours, illustrated path, big rounded controls, celebratory micro-animation |
| **Focus mode** | Exam Preparation and Mock Arena exam screens | Neutral greys, a single accent, dense but quiet layout, no game elements, no banners, no mascot or teacher on screen |

The modes share the same typography, spacing, radii and components. Only colour intensity and decoration change. This is how Bandly stays "one product" (DR-01) while keeping exam mode free of distractions (UI_UX_SPECIFICATION §1).

### 1.3 Colour tokens
| Token | Value (light) | Dark | Use |
|---|---|---|---|
| `--brand` | **#ff4b3a** coral-red **[EXISTS]** | same | primary actions in Play mode, brand marks |
| `--brand-600` | #ea3624 **[EXISTS]** | | pressed, gradients |
| `--ink` | #0c1020 **[EXISTS]** | #f2f4fb | text |
| `--ink-2` / `--muted` | #444b66 / #7a8199 **[EXISTS]** | #b4bad2 / #8b92ae | secondary text (muted only for ≥ 14 px and non-essential) |
| `--bg` / `--surface` / `--surface-2` | #f5f6fb / #fff / #f0f2f9 **[EXISTS]** | #0b0e1a / #141828 / #1b2033 | page and cards |
| `--blue` | #1f5cff **[EXISTS]** | | links, info, **Focus-mode accent** |
| `--green` / `--red` / `--yellow` | #12b76a / #e5372b / #f5b400 **[EXISTS]** | | correct / wrong / warning |
| `--purple` / `--orange` | #a855f7 / #f26a0f **[EXISTS]** | | rewards, streak flame |
| **Level colours** **[NEW]** | A1 #12b76a · A2 #0ea5a4 · B1 #1f5cff · B2 #7c3aed · C1 #db2777 · C2 #f59e0b | lighter 400-steps on dark | Learning Map, level tags (extends the existing `.lvl-tag`) |
| **Exam palette** **[NEW]** | `--exam-bg` #f7f8fa · `--exam-line` #d6dae3 · `--exam-accent` = `--blue` · `--exam-flag` #f59e0b | #0f1320 / #2a3046 | Focus mode only |
| **Emotion tints** **[NEW]** | happy #12b76a · laugh #f5b400 · angry #e5372b · sarcastic #a855f7 · disappointed #64748b · surprised #1f5cff · thinking #0ea5a4 · listening #7a8199 | | thin ring or speech-bubble edge around the AI Teacher (never full backgrounds) |

The coral brand is kept by default. A full re-brand (for example navy and violet) is an owner decision (PXD-02). All text/background pairs must reach WCAG AA contrast: 4.5 : 1 for normal text, and 3 : 1 for large text (≥ 18.66 px bold or ≥ 24 px) and for UI glyphs. Measured on the current tokens:
- White on `--brand` #ff4b3a is ≈ 3.3 : 1. White on `--brand-600` #ea3624 is ≈ 4.2 : 1.
- **Today's primary button labels (15 px, weight 650, on the coral gradient) therefore fail AA for normal text** [EXISTS — finding].
- Fix **[NEW]**: add `--brand-700` #c4261a (≈ 5.8 : 1 with white). Use it as the base of primary buttons that carry small labels, or make the labels ≥ 18.66 px bold.

### 1.4 Typography **[EXISTS, extended]**
| Role | Font | Size (mobile / desktop) | Weight |
|---|---|---|---|
| Display (H1, hero, level names) | **Unbounded** (self-hosted `@fontsource`) | 28 / 48 (`clamp`) | 600–700 |
| H2 / H3 | Unbounded | 21–30 / 17 | 600 |
| Body | **Inter Variable** | 16 (exam passage 17) | 400–500 |
| UI label / button | Inter | 15 | 650 |
| Small / caption | Inter | 13 | 500 |
| Numbers (timer, XP, scores) | Inter, `font-variant-numeric: tabular-nums` | | 700 |

- Exam reading passages: line-height 1.7, maximum line length 70 characters, no Unbounded.
- Uzbek text needs ʻ/ʼ glyph support; Inter covers it.

### 1.5 Iconography and illustration
- Icons: **lucide-react** **[EXISTS]**, 1.75 px stroke, 18–22 px in UI and 24 px in the tab bar.
- Illustration (Play mode): flat vector with soft gradients, level-coloured landscapes for the Learning Map, rounded geometry, no clip-art.
- AI Teachers: semi-realistic 2D (`AI_TEACHER_CHARACTER_SPEC.md`).
- The **Bandi** mascot (`src/components/Mascot.tsx`) is no longer the AI Teacher image. Whether to keep it in games or onboarding is PXD-08.

### 1.6 Spacing, radii, elevation
- Spacing scale **[NEW]**: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 px.
- Radii **[EXISTS]**: 12 / 16 / 22 / 28 px.
  - Exam mode uses **8 px** radii (a flatter, test-like look) **[NEW]**.
- Elevation **[EXISTS]**:
  - `--shadow-1` for cards, `--shadow-2` for sheets and modals.
  - Exam mode uses borders only, no shadows.

---

## 2. Components
Each entry gives its purpose, variants, and rules. States are defined once in §4 and apply everywhere.

| Component | Variants | Rules |
|---|---|---|
| **Button** **[EXISTS]** `.btn` | primary (brand gradient), secondary (outline), ghost, danger, sm | Height 46 px (sm 36 px, tap area still ≥ 44 px through padding). One primary per screen. Label is a verb ("Boshlash", "Javobni tekshirish"). Exam mode: solid blue, no gradient. |
| **Card** **[EXISTS]** `.card` | default, interactive (whole card clickable), highlight (left accent bar), locked | Padding 16 (mobile) / 24 (desktop). Interactive cards show a hover lift of 1 px and a pressed state. |
| **Top navigation** **[EXISTS]** `Header` | desktop pills (PRIMARY_NAV), mobile compact | Maximum 5 primary items (shipped 2026-11-14). Hidden in exam mode. |
| **Sidebar** **[NEW]**, desktop ≥ 1280 px only | Play mode: left rail with Map / Lessons / Teacher / Exam / Mocks / Games / Profile | Collapsible to icons. Never shown in exam mode. |
| **Bottom navigation** **[EXISTS]** `TabBar` | 5 tabs | Icon + label, active in brand colour. Hidden in lessons (lesson header instead) and in exams. |
| **Forms / inputs** **[PARTIAL]** | text, textarea, select, radio card, checkbox, date | Label above the field, 16 px text (prevents iOS zoom), 48 px height, error text under the field in red with an icon, helper text in muted. |
| **Progress** **[EXISTS]** `.mini`, rings in ProgressCard | bar, ring, segmented (lesson steps), XP bar | Always paired with a text value. Animate width ≤ 400 ms. |
| **Badge / pill** **[EXISTS]** `.pill`, `.lvl-tag`, RankBadge | level, status (pilot, free, premium), count, reward | Pills are not buttons. Status pills use text plus colour, never colour alone. |
| **Modal / dialog** **[PARTIAL]** (PaySheet, drawer) | dialog (centre on desktop, bottom sheet on mobile), confirm, full-screen sheet | Focus trap, Esc and backdrop close, except exam submit confirmation (explicit buttons only). |
| **Tooltip** **[NEW]** | hover/focus on desktop; long-press opens a popover on mobile | Supplementary only, never the only place information appears. |
| **Toast / notification** **[EXISTS]** `Toasts` | XP, success, error, info | 3–4 s, `aria-live="polite"`, stack of max 3. Exam mode: only critical toasts (connection lost or saved). |
| **Tabs** **[EXISTS]** in Exam page | underline tabs, segmented | Keyboard arrows move focus. Each panel keeps its state. |
| **Table** **[NEW]** (results, analytics) | compact, zebra | On mobile, rows become cards (label: value). |
| **Charts** **[PARTIAL]** `LineChart` | line (progress), bar (skill breakdown), radar (avoid) | Must have a text alternative (summary sentence + data table). No 3D. Colours from the level and skill palette. Values labelled "taxminiy" when estimated. |
| **Audio player** **[PARTIAL]** (Listening FilePlayer) | practice (seek, speed, replay), **exam (play-once, no seek, volume only)** | 48 px play button. Shows time and elapsed bar. Exam variant disables pause where the real test does. |
| **Recorder** **[PARTIAL]** (browser STT in Speaking) | mic button, level meter, timer | States: idle → requesting permission → listening → processing → done or error. |
| **Lesson step header** **[NEW]** | close (×), segmented step progress (5), hearts, combo | Replaces the global nav inside a lesson. |
| **Answer feedback sheet** **[NEW]** | correct (green), wrong (red, shows the right answer and the "why"), info | Slides up from the bottom. Primary "Davom etish" button. Haptic tick on mobile where supported. |
| **AI Teacher components** **[NEW]** | avatar (portrait, bust, mini), speech bubble, emotion ring, state chip ("Tinglayapman…", "O'ylayapman…"), voice controls (mute, replay, speed, text-only) | See §6 and `AI_TEACHER_CHARACTER_SPEC.md`. Never shown in exam mode. |
| **Video/audio lesson block** **[NEW]** | audio explanation with transcript, short video (optional, future) | Transcript is always available. Autoplay is off. |
| **Empty / error / skeleton** **[PARTIAL]** | | Every list has an empty state with a next action. Errors say what happened and what still works (honesty rule). |

---

## 3. Responsive rules
| Breakpoint | Layout | Navigation |
|---|---|---|
| **Mobile ≤ 599 px (priority)** | single column, 16 px gutter, one main task per screen, sticky primary action at the bottom (above the tab bar) | bottom TabBar (5) + header with stats |
| Tablet 600–979 px | 2 columns for dashboards; lessons stay single column, max 640 px | bottom TabBar |
| Desktop 980–1279 px | max content 1120 px; dashboard grid of 12 columns | top nav pills |
| Wide ≥ 1280 px | optional left sidebar | sidebar + top bar |

**Mobile rules:**
- Touch targets ≥ 44 × 44 px; primary controls 48–56 px.
- Body text ≥ 16 px.
- No horizontal page scroll. This is already enforced by the 2026-11-14 design pass checks.
- Keep the first screen light: first contentful paint under 2 s on a mid-range Android on 4G. That means no heavy hero media, lazy-loaded audio and teacher art.
- Thumb zone: primary action in the lower third of the screen.

**Exam layouts:**
- Desktop: split view, with the passage or audio on the left and the questions on the right.
- Mobile: tabs "Matn | Savollar", or the audio player stays pinned (see `REAL_EXAM_EXPERIENCE_SPEC.md` §5).

---

## 4. UI states (apply to every interactive component)
| State | Visual rule |
|---|---|
| Default | as specified |
| Hover (pointer devices) | 1 px lift or background `--surface-2`; cursor pointer |
| Active / pressed | scale 0.98, darker fill (`--brand-600`) |
| Focus | **2 px focus ring `--blue` + 2 px offset**, visible in light and dark (`:focus-visible`) |
| Disabled | 40 % opacity, `aria-disabled`, explains *why* when it matters ("Avval darajani aniqlang") |
| Loading | inline spinner or skeleton; the button keeps its width; `aria-busy` |
| Success | green check + text; auto-advance only when the learner chose it |
| Error | red outline + message + recovery action; never only colour |
| Empty | illustration-lite + one sentence + next action button |

---

## 5. Accessibility (WCAG 2.2 AA target)
- **Contrast:** see §1.3. The dark theme is tested separately.
- **Keyboard:**
  - Every action is reachable with Tab.
  - Lesson answers accept 1–4 to choose and Enter to check.
  - The exam navigator uses arrow keys; Alt + N / Alt + P move to the next or previous question.
  - Flag uses Alt + F (documented in the exam help).
- **Screen reader:**
  - Landmarks (`header`, `nav`, `main`).
  - Question numbers announced ("Savol 12 / 40, belgilangan").
  - Live region for the timer at 10 / 5 / 1 minute only, not every second.
  - Feedback sheets use `role="status"`.
- **Focus:** move focus to the feedback sheet and back. Modals trap focus.
- **Audio:**
  - Practice audio has captions or a transcript toggle.
  - Exam audio follows exam rules, but the controls are labelled.
  - The AI Teacher has a text-only mode and a "subtitles" setting.
- **Reduced motion:** `prefers-reduced-motion` removes the map path animation, confetti and the teacher's head movement. Only cross-fades of 150 ms or less remain.
- **Touch targets:** ≥ 44 px, with ≥ 8 px between targets.
- **Language:** `lang="uz"` on the page and `lang="en"` on English spans, so screen readers pronounce them correctly.
- **Timing:** practice has no time pressure by default. The "Jim qolma!" pressure mode keeps an off switch (DR-12).

---

## 6. Motion
| Use | Duration | Easing | Notes |
|---|---|---|---|
| Button press | 120 ms | ease-out | transform only |
| Feedback sheet | 220 ms | cubic-bezier(.2,.8,.2,1) | slide + fade |
| XP gain counter | 600 ms | ease-out | numbers tick up; toast already exists |
| Combo tick | 180 ms | spring-like (CSS) | scale 1 → 1.15 → 1 |
| Map node unlock | 500 ms | ease-in-out | path draws, node pops; **skipped with reduced motion** |
| Celebration (lesson pass, boss win) | ≤ 1.2 s | | lightweight CSS/canvas confetti, maximum once per screen |
| Teacher idle (blink, breathe) | 3–6 s loop | | paused when the tab is hidden |
| Exam mode | — | | **no decorative motion**; only progress and focus changes |

- Animate only `transform` and `opacity`, never layout properties.
- No animation may delay input by more than 100 ms.
- The total animation JavaScript for a page stays under 30 kB gzip; Lottie is used only if justified (`AI_TEACHER_CHARACTER_SPEC.md` §4).

---

## 7. Implementation notes (for later; no code now)
1. Move tokens to `:root` groups (`--space-*`, `--level-*`, `--exam-*`, `--emotion-*`), keeping the existing names.
2. Extract the primitives already listed in `TECHNICAL_ARCHITECTURE.md` (Button, Card, Pill, Field, Tabs, Dialog, Progress, Stat, EmptyState, ErrorState, Skeleton) without changing the look.
3. Add a `data-mode="focus"` attribute on `<body>` for exam screens. It hides the Header and TabBar and switches tokens.
4. Keep i18n: all new UI strings go to the catalogue (`src/i18n`), not hard-coded.

**Conflict to note:** `TECHNICAL_ARCHITECTURE.md` (Phase 0) says "keep the Bandi mascot, no visual redesign". The owner's 2026-11-15 brief supersedes this for the AI Teacher image. It is recorded as PXD-08.
