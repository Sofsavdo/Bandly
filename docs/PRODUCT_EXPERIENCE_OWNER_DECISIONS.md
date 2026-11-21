# Product Experience — Owner Decisions

Status: **2026-11-15 — the owner approved the blueprint and the recommendations below ("Men tasdiqlayman").** Rows marked *Approved (recommendation)* adopt the recommended option. Items that still need a concrete choice (names, art, prices) remain open inside the approved direction.
- IDs use the prefix **PXD-** so they do not clash with OD-xx (`docs/audit/phase-0.2/OWNER_DECISION_REGISTER.md`) or DR-xx (`master-spec-v2/DECISION_REGISTER.md`).
- The recommendations below are not approvals.

| ID | Problem | Options | Recommendation | Why | Technical / financial impact | Status |
|---|---|---|---|---|---|---|
| **PXD-01** | Visual reference images | (a) use the 8 images in `design-references/` as direction; (b) commission a moodboard | **(a)**, with the take/avoid notes in `design-references/README.md` | The owner supplied them on 2026-11-15. Several are other products' screens (including a trademarked mascot), so they guide **patterns only**. | None; images are not served | **Approved (recommendation), 2026-11-15** |
| **PXD-02** | Brand palette | (a) keep coral `#ff4b3a` + level colours; (b) move to the calmer teal/navy adult palette seen in reference 02 | **(a)**, plus the AA fix (`--brand-700`) and the teal-leaning exam palette | Brand recognition already exists; (b) is a full re-brand | (b) means about 3–5 d of design and code | **Approved (recommendation), 2026-11-15** |
| **PXD-03** | Hearts monetisation | (a) hearts never sold, re-learn refills; (b) paid unlimited hearts | **(a)** | Learning first; the references' "pay to refill" conflicts with the honesty principle; fewer support complaints | No revenue from hearts | **Approved (recommendation), 2026-11-15** |
| **PXD-04** | League before server-verified XP | (a) keep the current leaderboard labelled "sinov", no prizes; (b) launch tiers now on client XP | **(a)** until G2 | Client XP can be inflated; the caps limit but do not prevent it | — | **Approved (recommendation), 2026-11-15** |
| **PXD-05** | Full mocks and boss content | (a) methodologist writes original full IELTS/CEFR/SAT sets and reviews boss items; (b) AI drafts + human review; (c) license content | **(b)** with mandatory two-reviewer keys | Fastest legal path; no official papers copied | About 3–5 content-days per full IELTS mock + audio (about 7–14 k ElevenLabs credits each) | **Approved (recommendation), 2026-11-15** |
| **PXD-06** | Server-side exam timer and autosave | (a) E1 local-robust now, E3 server later; (b) wait for server attempts | **(a)** | Fixes answer loss on reload now, with no DB change | E3 needs M5 (OD-01/02) | **Approved (recommendation), 2026-11-15** |
| **PXD-07** | Teacher names, default teacher, female voice, headscarf variant, persona mapping | names: M (Shoxrux / Timur / Akmal), F (Madina / Nilufar / Kamola); female voice: "Javohir" library voice after a demo; default persona map M = Savage/Comedy/Debate, F = Friendly/Examiner | Pick names after the sketches; run a female voice demo (about 1 000 credits) | The owner chose the male voice; the female voice is untested | Female voice demo about $0.25 of credits | Direction approved; concrete choice open (names, female voice, art production) |
| **PXD-08** | Mascot (formerly “Bandi”) | (a) retire completely; (b) keep for games, onboarding and the splash only; (c) keep as is | **(b)** | It has existing art and moods; the teacher replaces it in learning contexts. This **supersedes** "keep the mascot (then called Bandi), no redesign" in `TECHNICAL_ARCHITECTURE.md` | Minimal | **Approved (recommendation), 2026-11-15** |
| **PXD-09** | Full objective mock is behind the paid `mocks` Gate today (`App.tsx`), against DR-19 "objective mocks free" | (a) make the full objective mock (L+R) free and keep AI-scored W/S in plan limits; (b) keep gated | **(a)** | Owner rule DR-19 and MONETIZATION_SPEC §7; free mocks drive acquisition | Some loss of a paid hook; no AI cost | **Approved (recommendation), 2026-11-15** |
| **PXD-10** | SAT scoring honesty | (a) "adaptive-style practice, estimated score"; (b) claim a SAT-like score | **(a)** | No calibrated item parameters; avoids misleading claims (DR-29) | — | **Approved (recommendation), 2026-11-15** |
| **PXD-11** | Full mock on mobile | (a) allow with a recommendation for desktop or tablet; (b) desktop/tablet only | **(a)** | Most users are on phones; computer IELTS is desktop, so we warn but allow | Mobile layouts are specified | **Approved (recommendation), 2026-11-15** |
| **PXD-12** | XP from exam practice | (a) no XP inside exam screens, a summary XP after results in General English only; (b) XP live in exams | **(a)** | Keeps exam mode clean (owner rule) | — | **Approved (recommendation), 2026-11-15** |
| **PXD-13** | Character art production | (a) human illustrator with IP assignment; (b) AI image generation + illustrator clean-up, with an originality check; (c) stock | **(a) or (b)**, with a written IP assignment in either case | Originality and consistency across 9 expressions × 2 characters | (a) about $800–2 500 market estimate [U]; (b) lower | Direction approved; concrete choice open (names, female voice, art production) |
| **PXD-14** | Streak freeze | (a) earned only (1 per 7 days, max 2); (b) also purchasable | **(a)** during the 30-day test | Simplicity; avoid pay-to-keep pressure | — | **Approved (recommendation), 2026-11-15** |
| **PXD-15** | League structure | cohort 30, promote top 7, relegate bottom 5, Monday 00:00 Tashkent; tier names Bronze → Diamond | as proposed | Common, understandable pattern; names are generic | Needs G2 | **Approved (recommendation), 2026-11-15** |
| **PXD-16** | Rewards economy | (a) cosmetic only (themes, frames, badges), no currency; (b) gems/coins currency (as in the references) | **(a)** | A currency adds a shop, balancing and dark-pattern risk; Sellzen sells plans, not gems | Less engagement surface | **Approved (recommendation), 2026-11-15** |
| **PXD-17** | Boss as an extra unit gate | (a) the boss unlocks the next unit (after content review); (b) the boss is optional and the lesson chain unlocks | **(b)** now, then (a) after boss items are reviewed | Do not block learners on unreviewed content | — | **Approved (recommendation), 2026-11-15** |
| **PXD-18** | Pronunciation score inside lessons | (a) hide until an assessment provider passes the benchmark; (b) show a browser-STT "match %" only | **(b)**, labelled "so‘zlar mosligi", not "talaffuz bahosi" | Honest; no provider cost | — | **Approved (recommendation), 2026-11-15** |

## Contradictions found (not hidden)
1. **Exam timer:**
   - `MOCK_ARENA_SPEC.md` requires a server `deadline_at` and autosave.
   - The current code is a client countdown with no autosave.
   - Addressed by PXD-06 (E1 → E3).
2. **Full mock gating vs DR-19.** PXD-09.
3. **Mascot (formerly “Bandi”):**
   - `TECHNICAL_ARCHITECTURE.md` says keep the mascot and do no redesign.
   - The owner's 2026-11-15 brief replaces it as the AI Teacher image.
   - Addressed by PXD-08.
4. **The references show currencies, paid hearts and animal mascots.** These conflict with the owner's "not childish, professional" direction and with the honesty rules. Addressed by PXD-03, PXD-16 and the reference notes.
5. **Primary button contrast fails WCAG AA today** (white on the coral gradient at 15 px). The fix is proposed in `SELLZEN_DESIGN_SYSTEM.md` §1.3; it needs approval because it changes the brand look slightly (PXD-02).
6. **League on client XP.** PXD-04.

## Open questions (no option proposed yet)
- Should General English and Exam Preparation share one dashboard, or should Exam have its own home after plan purchase?
- Is a teacher voice greeting on app open wanted (cost: cached, so free after the first play), or is it too intrusive?
- Notification channel for streak reminders: web push (needs a service worker) or Telegram bot (OD-26 related)?
