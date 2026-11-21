# sellzen-product-engineering

A Claude Code plugin that turns Claude into a multidisciplinary product engineering team for **Sellzen**
(sellzen.uz, formerly Bandly): AI-powered English learning and exam preparation for Uzbekistan and Central Asia.

Every skill is grounded in the real repository (`Sofsavdo/Bandly`): its hash-routed React SPA, single-process Node +
`node:sqlite` backend, Telegram auth, Hamyon payments, Gemini/ElevenLabs AI stack, deterministic adaptive engine,
server-side mock grading and Railway deployment. It is not a generic template.

## Contents

```
sellzen-product-engineering/
├── .claude-plugin/plugin.json   manifest (+ icon.png)
├── CONTEXT.md                   shared product facts, architecture map, status matrix, invariants, rules, risks
├── ROUTING.md                   which skills to load for which task + conflict-resolution protocol
├── skills/                      12 independent skills (SKILL.md each)
├── agents/                      release-gatekeeper (diff review), production-auditor (status audit) — read-only
└── commands/                    /audit, /preflight, /plan-feature, /cost-report
```

| Skill | Use it for |
|---|---|
| `product-architect` | what to build and in which order; boundaries between General English, Exam Preparation, Mock Arena; journeys; tech-debt triage |
| `frontend-engineer` | pages/components, mobile-first UI, i18n strings, bundle/chunk rules, accessibility |
| `backend-architect` | `/api` endpoints, SQLite schema (additive), auth/roles, data isolation, jobs, scaling plan |
| `ai-voice-engineer` | Gemini Live, AI coach, STT/TTS, personas/safety, latency, metering and voice limits |
| `adaptive-learning-engineer` | mastery model, SRS, weaknesses, daily plans, prerequisites, cross-device/server persistence |
| `education-methodologist` | lessons and items, CEFR progression, answer-key and explanation QA, pilot → reviewed workflow |
| `exam-engineer` | IELTS/CEFR Multilevel/Digital SAT formats, Mock Arena, server grading, AI band validation, certificates |
| `monetization-engineer` | plans and prices, Hamyon and future providers, lifecycle, refunds, quotas, unit economics |
| `growth-marketing` | referrals, creator program, duels/leagues, share cards, UGC, experiments, CAC/LTV |
| `localization-seo` | uz/en/ru/kk/ky/tg, native-language explanations, static SEO pages, hreflang/canonical, sitemap |
| `qa-security-engineer` | tests and CI wiring, critical journeys, payment/quota/answer-key/auth security |
| `devops-cost-optimizer` | Railway, backups, monitoring, logs, CI/CD, scaling path, AI + infra cost vs revenue |

## Installation

The plugin ships inside the Sellzen repository with a marketplace manifest at the repo root
(`.claude-plugin/marketplace.json`, marketplace name `sellzen`).

**From GitHub (after the plugin is on the default branch):**

```bash
/plugin install sellzen-product-engineering --marketplace Sofsavdo/Bandly
```

or the two-step form:

```bash
/plugin marketplace add Sofsavdo/Bandly
```

```bash
/plugin install sellzen-product-engineering@sellzen
```

**From a local checkout (any branch, useful before merge):**

```bash
claude --plugin-dir ./plugins/sellzen-product-engineering
```

or register the checkout as a marketplace:

```bash
/plugin marketplace add ./
```

Verify:

```bash
claude plugin validate ./plugins/sellzen-product-engineering
```

The plugin works without any MCP server. If the **Railway** MCP connector is attached, `devops-cost-optimizer`,
`production-auditor` and `/cost-report` also read production status, logs and metrics (read-only by default;
mutations always require your explicit approval).

## Using the skills

Skills activate automatically from their descriptions when your request matches, e.g. "add Payme as a second payment
provider" → `monetization-engineer`. You can also name them explicitly:

| Skill | Example prompt |
|---|---|
| product-architect | "Use product-architect: should Mock Arena become a separate paid product? Give options with evidence." |
| frontend-engineer | "Use frontend-engineer to make the duel result screen work at 360 px and add a share button." |
| backend-architect | "Use backend-architect to design server-side tables for learner mastery without breaking /api/progress." |
| ai-voice-engineer | "Use ai-voice-engineer: add reconnect to Gemini Live calls without double-counting minutes." |
| adaptive-learning-engineer | "Use adaptive-learning-engineer: daily plan should prioritise Writing Task 2 when the exam is in 14 days." |
| education-methodologist | "Use education-methodologist to QA unit B1-3 answer keys and explanations; report, don't approve." |
| exam-engineer | "Use exam-engineer to add a second CEFR Multilevel listening set with server-side grading." |
| monetization-engineer | "Use monetization-engineer: compute contribution margin for All Access at p95 voice usage." |
| growth-marketing | "Use growth-marketing to design a two-sided referral reward in plan days with abuse limits." |
| localization-seo | "Use localization-seo to generate Russian versions of the IELTS band calculator page with hreflang." |
| qa-security-engineer | "Use qa-security-engineer to test that a replayed Hamyon callback never extends a subscription twice." |
| devops-cost-optimizer | "Use devops-cost-optimizer: snapshot Railway production health for the last 7 days." |

Commands (namespaced by the plugin):

```text
/sellzen-product-engineering:audit payments
/sellzen-product-engineering:preflight origin/main
/sellzen-product-engineering:plan-feature "Speaking challenge of the week with AI feedback"
/sellzen-product-engineering:cost-report 30
```

Agents: ask "run the release-gatekeeper agent on this branch" before merging money/auth/grading/AI changes, or
"use the production-auditor agent to refresh the status matrix".

## Multiple skills in one complex task

`ROUTING.md` defines the lead skill, supporting skills and a precedence order for conflicts
(security & data > money correctness > learning effectiveness > unit economics > growth > convenience).

Example — "Launch AI Speaking mock for IELTS":

```text
/sellzen-product-engineering:plan-feature "Full IELTS Speaking mock with Gemini Live and AI band report"
```

Claude then: frames it with product-architect → loads exam-engineer (format, band validation), ai-voice-engineer
(Live session, metering), monetization-engineer (which plans, quota), backend-architect (result storage),
qa-security-engineer (abuse, refunds on failure) → reconciles conflicts (e.g. growth wants a free full mock;
monetization caps it to one per week because Live minutes cost money) → outputs PR-sized steps with tests and cost.
You approve, implementation proceeds step by step, and `/preflight` plus `release-gatekeeper` close it out.

## Keeping it accurate

`CONTEXT.md` records facts verified on 2026-11-21 (commit `71c9c85` + audit branch). When the product changes:
run `/sellzen-product-engineering:audit all`, apply the "CONTEXT.md updates suggested" list, and bump `version`
in `.claude-plugin/plugin.json` (and the marketplace entry).

## Recommended future improvements

1. **Evals**: add `evals/` cases (`claude plugin eval`) for activation accuracy and for invariant violations (e.g. a prompt that tempts client-side grading must be refused).
2. **Hooks**: a `PreToolUse` guard that blocks edits importing `readingTests.ts`/`listeningTests.ts` into `src/pages|components`, and a `PostToolUse` reminder to run `i18n:check` after editing `.tsx`.
3. **Scripts**: ship helper scripts (duplicate-item detector for lessons, hreflang validator, quota-parity checker between `SALE_PLANS` and server limits) under `skills/*/scripts/`.
4. **Content-review skill extension**: a structured review log format and reviewer sign-off workflow once a human methodologist is engaged.
5. **Server-side learner data**: once mastery tables exist, update adaptive/backend skills and CONTEXT status rows.
6. **Market packs**: per-country reference files (exam rules, payment providers, pricing, holidays) for Kazakhstan, Kyrgyzstan, Tajikistan, Turkmenistan as those launches start.
7. **Cost telemetry**: once `ai_cost_events` has 30+ days of data, embed real per-feature cost baselines in `monetization-engineer` and `ai-voice-engineer`.
8. **Release automation**: a `/release` command that wraps preflight, changelog, off-peak deploy timing and post-deploy log verification via Railway MCP.
