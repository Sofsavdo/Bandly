# Gamified Learning Spec — General English A1–C2

Status: **design for owner review. No code yet.**
Scope: the General English product only. Exam screens never show these mechanics (`REAL_EXAM_EXPERIENCE_SPEC.md`).
Labels: **[EXISTS]** · **[PARTIAL]** · **[NEW]** · **[OD]** (see `PRODUCT_EXPERIENCE_OWNER_DECISIONS.md`).

## 0. Principles
1. **Learning first.** Every reward is tied to evidence of learning (a correct first attempt, a fixed mistake, a passed check), never to clicks or time on screen.
2. **XP ≠ mastery.** XP is motivation. Mastery is measured by the deterministic engine in `src/lib/adaptive/mastery.ts`: `m' = m + k(c−m)(0.6+0.4d)`, decay τ = 14/45/120 days, "mastered" needs ≥ 5 attempts, ≥ 3 days and the last 3 correct. XP never changes mastery, and an LLM never sets mastery.
3. **No punishment loops.** Losing hearts sends the learner to targeted re-learning, never to a paywall or a waiting timer.
4. **Original design.** No copying of other apps' names, art, map shapes or mascots. The mechanics are generic. Bandly's own identity comes from:
   - level landscapes,
   - the AI Teachers,
   - Uzbek humour,
   - exam-grade honesty.
5. **Server truth later, client now.** Today XP, streak and progress live on the device (`src/lib/store.ts`, `bandly.lessons.v1`). The server only caps synced XP (`MAX_DELTA_PER_SYNC` = 400, `MAX_DELTA_PER_HOUR` = 1 500 in `server/db.ts`). Anything that affects other users (the league) must move to server-computed XP first (§3.6).

## 1. What exists today
| Mechanic | Status | Where |
|---|---|---|
| XP and player level (`levelFromXp = ⌊√(xp/50)⌋+1`) | **[EXISTS]** client; server sync with caps | `src/lib/game.ts`, `/api/sync` |
| Streak (any XP on a calendar day) + longest streak | **[EXISTS]** client | `nextStreak` in `game.ts` |
| Daily XP goal (40 for A1–A2, 60 otherwise) | **[EXISTS]** | `setDailyGoal`, `setLevel` |
| 8 achievements (first XP, 3/7-day streak, level 5, 10/30 words, 10 games, daily goal) | **[EXISTS]** | `ACHIEVEMENTS` in `game.ts` |
| Weekly / all-time leaderboard | **[EXISTS]** server, nickname accounts | `leaderboard()` in `server/db.ts`, `League.tsx` |
| Duels | **[EXISTS]** | `server/db.ts`, `Duel.tsx` |
| Games: WordRush, Pairs, Spell, "Jim qolma!" | **[EXISTS]** | `src/pages/games`, `Challenge.tsx` |
| Lessons: 42 lessons in 14 units, 5 steps, 80 % pass, unlock chain | **[EXISTS]** | `src/content/lessons`, `src/lib/lessons.ts`, `Lesson.tsx` |
| Personal plan, mistake repetition (1/3/7 days, resolved after 3 correct in a row) | **[EXISTS]** | `dailyPlan.ts`, `mistakes.ts` |
| Learning Map (visual), hearts, combo, boss, daily quests, leagues/tiers | **missing** | — |

Current XP awards:
- A lesson gives `3 × correct + 15` on pass (`Lesson.tsx`).
- A mock test gives `5 × correct + 20` at ≥ 80 % (`MockTest.tsx`).

## 2. Learning Map **[NEW]**
**Goal:** the learner always sees where they are, what is done, and what comes next.

**Structure.** Data comes from the existing `UNITS` (14 units / 42 lessons). Nothing is invented.
```
Level (A1…C2)  → landscape band in its level colour
  Unit         → section with title + real-life situation (unit.situationUz)
    Lesson     → node (circle 56 px)            states: locked · available · in progress · passed · mastered
    Challenge  → small node (optional practice: game round on the unit's words)
    Boss       → big node at unit end (72 px)   unlocks the next unit
  Milestone    → level checkpoint (Skill check / placement re-test) between levels
```
- **Node states.**
  - `passed`: the lesson check is ≥ 80 % (`progress[id].passedAt`).
  - `mastered`: every taxonomy node of the lesson is at `mastered` state in the engine.
  - `needs revision`: the mastery decayed, shown as a small amber dot. Tapping it opens the revision lesson.
- **Assumed levels.** Levels below the placement result appear as "o‘tilgan deb hisoblangan" (assumed). They are open, light-grey, and can be practised any time. This matches the planner's assumed prerequisites.
- **Placement entry.** A learner without a level sees the map with a single CTA: "Darajangizni aniqlang (8 daqiqa)".
- **Interaction.**
  - Tap a node to open a bottom sheet with the objective, minutes, XP available, best score and a "Boshlash" button.
  - The map scrolls to the current node on open.
  - The path between nodes fills as lessons are passed.
- **Mobile UI.** Vertical path, one node per row (left/right offset), a sticky level header and a "Davom ettirish" FAB.
- **Desktop UI.** The path sits on the left; a right panel shows today's plan, quests and the league.
- **Edge cases:**
  - The learner skips a level by placement (assumed nodes).
  - Content is pilot (show a "pilot" chip).
  - A unit has fewer than 3 lessons.
  - Offline: the map renders from local progress.
  - Progress was reset.
- **Acceptance criteria:**
  - Every node maps to a real lesson id.
  - Locked logic equals `isUnlocked()`.
  - The current node is visible without scrolling on a 360 × 740 screen.
  - The map renders in < 300 ms with 42 nodes on a mid-range phone.
  - With reduced motion there is no path animation.
- **Analytics:** `map_viewed`, `map_node_opened{lesson_id,state}`, `map_continue_clicked`.

## 3. Mechanics
Each mechanic uses the same layout: goal · flow · UI · rule · edge cases · acceptance criteria · analytics · anti-abuse.

### 3.1 XP **[EXISTS → refined]**
- **Goal:** reward real progress, so that a quick "tap-through" earns little.
- **Rule (proposal; replaces the ad-hoc awards above):**

  | Event | XP | Condition |
  |---|---|---|
  | Correct item, first attempt in this session | 10 × difficulty factor (0.8–1.2, from `relativeDifficulty`) | once per item per day |
  | Correct after a wrong attempt | 4 | |
  | Repeat of an item already correct today | 2, then 0 from the 3rd time | diminishing returns |
  | Wrong answer | 0 (never negative) | |
  | Lesson check passed (≥ 80 %) | +30 first pass; +10 for a perfect score | once per lesson; later passes get 25 % |
  | Speaking step (browser STT, unscored) | +3 per sentence attempted | max 3 per lesson per day |
  | Writing task passes the rule check | +20 | once per lesson |
  | Mistake resolved (mistake repetition) | +15 | per mistake, once |
  | Boss passed | +100 first time, +25 repeat | |
  | Daily quest completed | +20 | max 3 per day |
  | Combo bonus | +1 per item while combo ≥ 3, +2 while ≥ 10 | capped at +50 % of base XP |

- **Player level** keeps the existing curve (`50·(L−1)²`). The UI always shows the player level and the **CEFR level** separately: "Bandly darajasi 7 · Ingliz tili: B1".
- **Low-quality answers:**
  - A multiple-choice answer given in < 600 ms on 3 or more items in a row, or an identical option chosen on ≥ 5 items in a row, earns 0 XP for those items. The learner sees "Shoshilmang — o‘ylab javob bering".
  - Mastery still records the attempt honestly, because those answers are evidence.
- **Edge cases:**
  - An offline session syncs later, still subject to the server caps.
  - A clock change backwards is ignored (no streak gain).
  - Reloading a lesson does not repay items already rewarded that day.
- **Acceptance criteria:**
  - A unit test shows that finishing the same lesson twice in one day pays ≤ 35 % of the first time.
  - Tapping randomly through a lesson pays ≤ 20 % of a genuine pass.
  - Total synced XP per hour never exceeds the server cap.
- **Analytics:** `xp_awarded{source,amount,lesson_id}`, `xp_suppressed{reason}`.
- **Anti-abuse:**
  - One payment per `(source_type, source_id)`, matching the target `xp_transactions` unique key in `DATABASE_DESIGN.md`.
  - The existing server caps stay.
  - League XP counts only server-verifiable sources (§3.6).

### 3.2 Hearts **[NEW]**
- **Goal:** make mistakes matter inside a lesson without blocking learning.
- **Rule:**
  - 5 hearts per **lesson session**, not per day.
  - A wrong answer in the *Mashq* or *Tekshiruv* step costs 1 heart.
  - *Tushuntirish*, *Gapirish* and *Yozish* never cost hearts.
  - Free and paid learners have the same hearts. Hearts are never sold [OD PXD-03].
- **At 0 hearts:** the "Qayta o‘rganish" (re-learn) mini-flow starts.
  1. The teacher re-explains the rule behind the last 2 mistakes (lesson content plus the mistake's taxonomy id).
  2. The learner answers 3 easier items on the same node.
  3. Finishing it refills **3 hearts**, and the learner continues where they stopped.
  4. The learner may instead "Darsni qayta boshlash" (restart the lesson). There is no waiting timer.
- **UI:**
  - Hearts show in the lesson header, with the number for screen readers.
  - Losing a heart plays a short shake, or only a colour change under reduced motion.
- **Edge cases:**
  - Hearts run out on the last item of the check: the re-learn flow runs, then the check resumes.
  - Restarting the lesson resets hearts to 5.
  - A learner who fails re-learning twice is offered the lesson explanation again and the AI Teacher (if available).
- **Acceptance criteria:**
  - No path leads to a dead end or a payment screen.
  - The re-learn items come from the same taxonomy node.
  - Mastery records every attempt.
- **Analytics:** `heart_lost`, `hearts_empty{lesson_id}`, `relearn_started`, `relearn_completed{passed}`.
- **Anti-abuse:** hearts are cosmetic for rewards. XP is still governed by §3.1, so farming the re-learn flow pays only the repeat rate.

### 3.3 Combo **[NEW]**
- **Goal:** reward focus.
- **Rule:**
  - The combo is the number of consecutive correct first attempts within a session.
  - Milestones at 3 / 5 / 10 / 20 trigger a teacher reaction (§AI Teacher) and the XP bonus from §3.1.
  - A wrong answer resets the combo to 0. The teacher's "combo saved" reaction happens only for an explicit "Bilmayman" (skip), which keeps the combo but gives 0 XP. This encourages honesty over guessing.
- **UI:** a flame counter in the lesson header and a short ×3 / ×5 toast.
- **Edge cases:** the combo does not carry over between lessons; boss rounds keep their own combo.
- **Acceptance criteria:** the combo bonus never exceeds 50 % of the base XP of the session.
- **Analytics:** `combo_milestone{n}`, `combo_broken{n}`.

### 3.4 Streak **[EXISTS → refined]**
- **Today:** the streak grows on any day with XP > 0.
- **Proposal:**
  - A day counts when the **daily goal** is met: either 1 lesson passed, or the plan's minutes (`planPrefs`) or the existing daily XP goal reached. This stops 1-XP streak keeping.
  - The day key is the learner's local day (`localDayKey`).
- **Recovery:**
  - 1 **streak freeze** is earned for every 7 streak days (max 2 stored). It is used automatically on a missed day.
  - **Repair:** within 48 h of a break, completing a double goal restores the streak once per 30 days.
  - No paid freezes in the 30-day test [OD PXD-14].
- **UI:**
  - A flame with the day count in the header.
  - A week strip on the dashboard showing met, frozen and missed days.
  - Evening reminder copy (only if notifications are allowed).
- **Edge cases:**
  - Time zone travel: the day is computed by local date, and a duplicate day does not double-count.
  - Device reset: the server streak wins once accounts exist.
- **Acceptance criteria:** tests for a missed day with a freeze, without a freeze, a repair within 48 h, a repair after 48 h, and a backwards clock change.
- **Analytics:** `streak_extended{n}`, `streak_frozen`, `streak_broken{n}`, `streak_repaired`.

### 3.5 Boss Challenge **[NEW]**
- **Goal:** prove the unit is learned and bring back older material.
- **Composition:**
  - 12–15 items: 70 % from this unit's lessons, mixed item kinds (choice, gap, order), and 1 writing micro-task (rule-checked).
  - 30 % revision from earlier units, chosen by the planner's revision score: due or decayed nodes and recent error taxonomy ids.
  - Optional speaking line (unscored).
- **Rules:**
  - 3 hearts, no re-learn mid-boss.
  - At 0 hearts the boss ends with a "what to fix" list and a 1-tap practice set. The retry is open immediately.
  - Pass = ≥ 80 %.
  - Passing unlocks the next unit's first lesson. Today the unlock is the lesson chain; the boss becomes an **additional** gate only after content review [OD PXD-05].
- **Result:** score, the items missed with explanations, mastery changes per node ("Present perfect: 62 % → 78 %"), XP, a badge for the first win, and the next step.
- **UI:**
  - A full-screen intro with the unit illustration and the AI Teacher in "serious" mode.
  - Progress shows the item count, not a time pressure.
- **Edge cases:**
  - A unit where every node is already mastered (assumed level) gets a "Tezkor boss" (8 items) for credit.
  - The learner leaves mid-boss: the attempt is saved locally and the learner can resume within 24 h.
- **Acceptance criteria:**
  - Item selection is deterministic for a given seed.
  - At least 30 % revision when earlier units exist.
  - No item is repeated within one boss.
- **Analytics:** `boss_started`, `boss_completed{score,passed}`, `boss_abandoned{at_item}`.

### 3.6 League & Leaderboard **[PARTIAL → refined]**
- **Today:** a single weekly leaderboard by synced XP (nickname accounts).
- **Proposal:**
  - **Cohorts of 30** learners grouped by weekly activity band, with tiers Bronze → Silver → Gold → Sapphire → Diamond.
  - The top 7 are promoted and the bottom 5 relegated, each Monday 00:00 Asia/Tashkent.
  - The tier names are generic; the art is Bandly's own.
- **League XP integrity (a requirement before launch):**
  - Only **server-computed XP** counts. The server must recompute XP from submitted lesson and check attempts, or accept only signed events, instead of trusting the client total.
  - This needs the M3/M5 attempt storage.
  - Until then the leaderboard is labelled "sinov" (test) and shows no prizes.
- **Anti-abuse:**
  - The existing caps stay.
  - Weekly XP above the 99.5th percentile is flagged for review and does not promote.
  - Minimum 3 active days to promote.
  - One account per verified identity once phone or Telegram login exists (OD-26).
- **Privacy:** only the nickname and an optional avatar are shown, never real names. Opt out of the league is in Settings.
- **Analytics:** `league_viewed`, `league_promoted`, `league_relegated`, `league_opt_out`.

### 3.7 Daily Quests **[NEW]**
- **Goal:** turn the personal plan into 3 small, clear tasks a day.
- **Generation:**
  - Deterministic, from `buildDailyPlan` and the learner state. Never random filler.
  - Examples:
    - "Rejadagi 2 ta vazifani bajaring".
    - "3 ta xatoingizni tuzating" (only if mistakes are due).
    - "5 ta yangi so‘z" (vocab nodes).
    - "Gapirish: 3 ta gap ayting".
    - "Bossni yuting" (only when a boss is available).
  - Weak skills from the skill check get priority.
- **Rules:**
  - 3 quests a day. A completed quest gives +20 XP.
  - All 3 completed: a chest reward with cosmetic items or an achievement step. No AI credits for free [OD PXD-16].
- **Edge cases:**
  - No mistakes due: replace that quest.
  - A plan with 0 tasks: offer the boss or a game.
  - A quest completed offline syncs later.
- **Acceptance criteria:** every quest is completable that day with free features; it never requires a paid feature unless the learner has it.
- **Analytics:** `quest_assigned{type}`, `quest_completed{type}`, `quests_all_done`.

### 3.8 Rewards & Achievements **[PARTIAL → extended]**
- **Keep** the 8 existing achievements.
- **Add** achievements by learning milestone:
  - first lesson,
  - first unit boss,
  - level complete (all A1 nodes passed),
  - 10 mistakes fixed,
  - 50 speaking sentences,
  - 30-day streak,
  - first full mock (shown in General English only as a link).
- **Unlockables (cosmetic only):**
  - map themes,
  - teacher backgrounds,
  - profile frames,
  - extra challenge packs (practice content, never core lessons).

  Never sold as pay-to-win; no AI credits as rewards in the test period.
- **UI:** an achievements grid in the Profile, locked items showing the requirement, and an unlock toast plus teacher reaction.
- **Analytics:** `achievement_unlocked{id}`.

## 4. The 5-step lesson, gamified (structure kept)
| Step | Today [EXISTS] | Added game layer [NEW] |
|---|---|---|
| 1 Tushuntirish | objective, Uzbek explanation, form table, ≥ 3 examples with audio | Teacher presents the rule (character + voice). 1–2 "tap to reveal" checks. No hearts. |
| 2 Mashq | ≥ 4 items, instant feedback | Hearts and combo active. Feedback sheet with "why". Teacher reaction by persona (friendly by default, Savage only for 18+ opt-in under OD-06b). |
| 3 Gapirish | browser STT, unscored | Shadowing round: listen to the new pre-made audio (US Hope/Max), say it, and see a transcript match. XP per sentence (capped). Pronunciation score only after the assessment provider exists (OD-21). |
| 4 Yozish | rule-checked writing task | "Mission" framing, live word counter, rule hints. XP on pass. |
| 5 Tekshiruv | ≥ 5 items, 80 % pass | "Mini-boss" styling, hearts active, result screen with mastery deltas and the next node on the map. |

The lesson header replaces the global nav: close, step progress (5 segments), hearts, combo, XP gained.

## 5. Adaptive difficulty (deterministic)
- **Inputs:** the mastery records (`m`, state, decay, `dueAt`), the recent error taxonomy ids, item difficulty, and optionally the response time.
- **Rules:**
  - **Struggling:** 2 wrong answers on the same node in a session insert an extra explanation card and 2 easier items (lower difficulty band) before continuing. This counts toward mastery normally.
  - **Coasting:** ≥ 90 % correct with a fast median time on a node at `known` state skips the remaining easy items of that node and offers a "stretch" item (higher difficulty). The learner can still do every item.
  - **Spaced repetition:**
    - Due nodes (`reviewIntervalDays = base·2^(streak−1)·(0.5+m)`) and open mistakes (1/3/7 days) appear as map dots and quests.
    - Decayed mastery returns the node to `needs_revision`.
  - **Speed** is only a tie-breaker (`typicalMs`). A fast but wrong answer is never rewarded.
  - The LLM (AI Teacher) may explain, but it **never writes mastery, XP or pass/fail**.
- **Acceptance criteria:** unit tests with fixed seeds for the struggling path, the coasting path, decay into revision and quest selection, all reproducible.

## 6. Data needed (and where it lives)
| Data | Today | Needed for server truth (M3/M5) |
|---|---|---|
| XP events | client total + server caps | `xp_transactions` (unique source) |
| Lesson attempts and item answers | client `bandly.lessons.v1`, mastery store | `attempts`, `attempt_answers`, `lesson_progress` |
| Mastery | client `bandly.mastery.v1` | `skill_mastery` |
| Streak, freezes | client profile | `streaks` (+ freeze count) |
| Hearts / combo | session only (no storage needed) | — |
| Quests | derived from the plan each day | `missions`, `user_missions` |
| Achievements | client list | `achievements`, `user_achievements` |
| League tiers | — | `leaderboard_snapshots` + tier table |

**Phase G1** (client only, no DB change): the Map, hearts, combo, quests UI, and refined XP and streak rules on the device.
**Phase G2** (after accounts and DB, OD-01/02): server XP, leagues, cross-device sync.

## 7. Analytics (privacy)
There is no analytics pipeline today. Events are defined now and sent only after OD-01 (data processors) is decided. Until then they go to a local debug log. No personal data in events: only the user id hash, the lesson id and numbers.

## 8. Implementation status — G1, first slice (2026-11-15, branch)
Client-only, with no database, API or AI change. The pure logic lives in `src/lib/gamify.ts` and is tested in `src/lib/gamify.test.ts`.

**Learning Map (§2)**
- **Component.** `src/components/LearningMap.tsx`, shown by default on `#/learn`. The old list view stays available through the "Xarita | Ro‘yxat" switch, and the choice is remembered.
- **Content.** Every level band carries its level colour. Units are shown with their situation, and each of the 42 lessons is a node.
- **Node states.** A node is locked, open, current, passed, mastered or "revise". The mastery value is read from the adaptive store. The unlock rule is exactly `isUnlocked()`.
- **Interaction.**
  - The map scrolls to the current node when it opens.
  - Tapping a node opens a bottom sheet with the objective, minutes, an approximate XP figure, 5 hearts, the best score and Start/Takrorlash. Esc closes it.
  - A locked node explains why it is locked.
  - Each level ends with a milestone that links to the skill check.
- **Reduced motion.** The pulse animation is turned off.

**Hearts and combo (§3.2–3.3)**
- **Where they apply.** Mashq and Tekshiruv now check each item immediately.
- **Hearts.** A wrong answer costs a heart. The same 5 hearts span both steps.
- **Combo.** Correct answers build a combo. It shows toasts at ×3, ×5 and ×10, and the bonus is capped at 50 % of the base XP.
- **Re-learn at 0 hearts.**
  - It shows the rule again and asks the learner to retry the practice items they got wrong. Check items are not used, because their answers are already shown.
  - When every retried item is correct, 3 hearts come back.
  - There is no timer and no payment.
  - "Natijani ko‘rish" (see result) is disabled while re-learn is open.
- **HUD.** A sticky bar shows the step segments, hearts and combo.

**XP (§3.1)**
- **Check XP** follows `checkXp`:
  - 3 XP per correct answer + 15 XP for a first-ever pass;
  - a repeat on the same day earns 1 XP per correct answer;
  - a re-pass bonus is 4 XP.
- **Practice XP** is 2 XP per correct first answer plus the combo bonus, paid once per lesson per day.
- The lesson result shows the XP gained and the longest combo.

**Daily Quests (§3.7)**
- **Component.** `src/components/QuestsCard.tsx` on the dashboard, for learners who have a level.
- **The three quests.**
  - Pass 1 lesson.
  - Reach the daily XP goal.
  - Work on 3 mistakes. If no mistakes are due, play 1 word game instead.
- **Daily counts.** "Today" counts come from a baseline snapshot taken at the start of the local day.
- **Claim.** Each claim gives +20 XP once; an unfinished quest cannot be claimed.

**Deviations, documented**
- Practice still shows every item at once rather than one item per screen.
- The re-learn step reuses the lesson's own practice items, because there are no extra easier items yet.

**Not yet (next slices)**
- Boss Challenge (§3.5).
- Streak rule change and freezes (§3.4).
- New achievements (§3.8).
- Leagues on server XP (§3.6, G2).
- Low-quality-answer XP suppression (< 600 ms).
- Lesson intro and result screens with the teacher character (T1).

**Tests**
- Unit tests in `src/lib/gamify.test.ts`.
- A Playwright run on a Pixel 5 checked: 42 nodes with one current node, the current node in view on open, the sheet open and close, the locked-node notice, the list toggle, hearts reaching 0 → re-learn with result submit blocked, the sticky HUD, 3 quests, and no page errors or overflow.

### 8.1 Learning Map v2 — visual redesign after owner review (2026-11-15)
The owner judged the first map too plain compared with `design-references/`. The map was redrawn with original vector art (`src/components/mapArt.tsx`):

**Level worlds.** Each level is an illustrated world with its own sky gradient, rolling hills and themed props, placed on both sides of the road:

| Level | World | Props |
|---|---|---|
| A1 | Mahalla | houses, trees, bushes, sun |
| A2 | Bozor ko‘chasi | domes, market stalls |
| B1 | Ko‘l bo‘yi | lake with a boat, pines |
| B2 | Tog‘ yo‘li | snowy mountains |
| C1 | Tungi shahar | night skyline, moon |
| C2 | Cho‘qqi | peak with a flag |

**Road.** A winding road follows smooth curves with a dashed centre line. The part already travelled is drawn in the level colour.

**Nodes.**
- Lessons are 3-D "coins" in five styles: locked, open, current, passed and mastered (gold).
- The current coin has a pulsing ring (static under reduced motion) and a "Siz shu yerdasiz" pin. The pin flips side so it never leaves the screen.
- Passed lessons show 1–3 stars (≥ 80 / 90 / 100 %).
- Each unit starts with a signboard and ends with a trophy diamond, which turns gold when every lesson in the unit is passed.

**Panels and overlays.**
- **Level banner.** A glass card on each world shows the level badge, world name, subtitle and a progress ring.
- **HUD card.** Shows the Bandly XP level bar, streak and daily XP.
- **"Davom ettirish" button.** Floats above the tab bar.
- **Lesson sheet.** Opens from a node and shows a coin, the breadcrumb and 4 stat tiles.

**Other modes and screen sizes.**
- **Dark mode.** Daytime worlds are dimmed; the night world stays as drawn.
- **Desktop.** The map sits on the left with a sticky panel of today's quests on the right.

The node and state logic is unchanged (`isUnlocked()`, mastery from the adaptive store). No external images are used and nothing is copied from the references.
