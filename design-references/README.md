# Design references (owner-supplied, 2026-11-15)

These eight images were supplied by the owner as the **approved visual direction** for Bandly's mobile gamified learning. They are **third-party designs**:
- some are concept shots from design portfolios;
- some show other products' apps, including at least one well-known language app and its mascot.

They are kept here **for internal reference only**:
- Do **not** ship them, copy their art, mascots, names, colours or layouts one-to-one, or use them in marketing.
- Bandly's own design must be original (`docs/BANDLY_DESIGN_SYSTEM.md`, rule in the owner's brief §6.1).
- The folder is outside `public/`, so the web server never serves it.

| File | What it shows | Take for Bandly (pattern) | Avoid |
|---|---|---|---|
| `01-quiz-result-and-leaderboard.jpg` | Desktop "Quiz complete 91 %" + mobile leaderboard table | Clean result card with one big score, one green next-step CTA; a simple rank / name / XP table with top-3 icons | Plain generic look; copying the table styling |
| `02-ielts-mobile-daily-challenge-dashboard-world-map.jpg` | IELTS-prep mobile app: daily 5-question challenge, dashboard with a semi-realistic tutor and quote, "world map" with skill areas (Grammar Mountain, Vocabulary Forest, Writing Arena, Speaking Lab, Listening Speed Zone) leading to a Final Exam boss | **Closest to Bandly's direction:**<br>- adult, calm teal palette;<br>- a semi-realistic **human tutor** portrait with a speech line;<br>- a level / XP header;<br>- skill-zone map nodes ending in a **boss / final exam**;<br>- "Streak protection" and "+50 XP boost" chips | The names of its zones and its exact map art; Bandly maps by CEFR level → unit, not only by skill |
| `03-map-path-locked-lessons-desert-theme.jpg` | Themed path map, locked lesson nodes, lesson sheet "Start (+60 EXP)" with progress rows | Node bottom sheet with progress and an XP reward; locked-node message "complete the previous lesson"; themed landscapes per level | Cartoon animal mascot (sticker style is out for the AI Teacher) |
| `04-result-95-percent-and-legendary-reward.jpg` | Big % result celebration, splash, "Legendary" reward screen | Big accuracy number, a short "you practised 50 words with 97 % accuracy" summary, a special-reward moment for boss / level mastery | Dinosaur mascot, product name and green branding |
| `05-map-sentence-builder-missions.jpg` | Path map with checked nodes, sentence-builder exercise with hearts, missions list with Claim buttons | Sentence-building "order" items (Bandly already has `order` items), hearts in the lesson header, a **missions / daily quests** list with progress bars and Claim | Star mascot; gems economy |
| `06-lesson-complete-xp-chart-streak.jpg` | "Lesson complete +10 XP, heart bonus" with a weekly XP line chart and streak message | Weekly XP chart on the result screen, streak callout, a single Continue button | The owl mascot and its brand (trademarked) |
| `07-gamification-patterns-xp-streak-league-hearts.jpg` | Pattern sheet: XP, streaks, crowns, gems, leaderboards / league promotion, hearts (no hearts → practice) | Pattern catalogue: XP breakdown (lesson XP + combo bonus), streak week strip, league promotion screen, "no hearts → practice to earn back" (matches Bandly's **re-learn** rule) | Paid heart refills, an ad-for-chest flow and a gems shop — Bandly does **not** sell hearts (PXD-03) |
| `08-island-map-speak-sentence-level-unlocked.jpg` | Island map with level nodes, "Speak this sentence" with waveform + mic, "Level 2 unlocked — Elementary" | Level-unlock screen tied to CEFR (A1 → A2), a speaking card with waveform and mic button, a bottom sheet for the current level | Bear mascot, coins / gems currencies |

**Overall reading of the references:**
- What the owner approves: mobile **map-based path**, big touch targets, one task per screen, visible XP / hearts / streak / missions / league, and celebratory result screens.
- Where Bandly differs:
  - (1) The **AI Teacher is a semi-realistic human character** (as in reference 02), not an animal mascot.
  - (2) A more adult, premium palette.
  - (3) Exam screens stay separate and non-gamified.
  - (4) There is no currency shop.

These differences are recorded in `docs/PRODUCT_EXPERIENCE_OWNER_DECISIONS.md` (PXD-01).
