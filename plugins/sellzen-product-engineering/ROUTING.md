# Skill routing and coordination

Load **only** the skills a task needs. Every skill already depends on `CONTEXT.md`; do not load all twelve "to be safe".

## 1. Selection matrix

| Task | Lead skill | Supporting skills |
|---|---|---|
| New feature idea, roadmap, prioritisation, "should we build X" | product-architect | the domain skill(s) it touches; monetization-engineer if pricing/entitlement changes |
| UI page/component, layout, mobile bug, bundle size, accessibility | frontend-engineer | localization-seo (new strings / public pages); qa-security-engineer for gated pages |
| API endpoint, schema change, auth, data isolation, background job | backend-architect | qa-security-engineer; devops-cost-optimizer if it adds load/storage |
| AI Speaking, Gemini Live, STT, TTS, coach prompts, voice limits | ai-voice-engineer | backend-architect, monetization-engineer (quotas = entitlements), qa-security-engineer |
| Adaptive engine, mastery, SRS, recommendations, cross-device progress | adaptive-learning-engineer | education-methodologist, backend-architect, frontend-engineer, qa-security-engineer |
| Lessons, grammar, vocab, curriculum, answer-key review, CEFR alignment | education-methodologist | adaptive-learning-engineer (taxonomy/prerequisites); localization-seo (explanations in other languages) |
| IELTS / CEFR Multilevel / Digital SAT, Mock Arena, scoring, certificates | exam-engineer | education-methodologist, ai-voice-engineer (speaking), adaptive-learning-engineer, qa-security-engineer |
| Pricing, plans, payments, Hamyon, Payme/Click, refunds, quotas, margin | monetization-engineer | backend-architect, qa-security-engineer |
| Referral, creator program, duels, leagues, share cards, retention, experiments | growth-marketing | product-architect, monetization-engineer, localization-seo |
| SEO pages, sitemap, hreflang, new locale, country landing page | localization-seo | frontend-engineer, growth-marketing |
| Tests, security review, regression hunt, abuse prevention | qa-security-engineer | the skill that owns the code under test |
| Railway, backups, monitoring, logs, region, DB scaling, cost report | devops-cost-optimizer | backend-architect |

Canonical combinations from the owner's brief:

- **AI Speaking** → ai-voice-engineer + backend-architect + monetization-engineer + qa-security-engineer
- **Adaptive learning** → adaptive-learning-engineer + education-methodologist + backend-architect + frontend-engineer + qa-security-engineer
- **IELTS** → exam-engineer + education-methodologist + ai-voice-engineer + adaptive-learning-engineer + qa-security-engineer
- **Payments** → monetization-engineer + backend-architect + qa-security-engineer
- **Growth planning** → product-architect + growth-marketing + monetization-engineer + localization-seo

## 2. Coordination protocol for cross-functional work

1. **Frame** (lead skill): goal, user, success metric, which product (A/B/C/shared) owns it. Check
   `docs/audit/phase-0.2/OWNER_DECISION_REGISTER.md` for an open decision that blocks it.
2. **Inspect**: each supporting skill runs *its own* "Required repository inspection" steps and reports facts, not opinions.
3. **Reconcile conflicts** using this precedence (highest first):
   1. Security, user-data preservation, legal/exam honesty (CONTEXT §4 invariants)
   2. Correctness of money and limits (server-side authority)
   3. Learning effectiveness (methodology, deterministic adaptive decisions)
   4. Unit economics (AI/infra cost vs. plan price)
   5. Growth and conversion
   6. Developer convenience
   Record every resolved conflict in the plan ("growth wanted free unlimited Live; monetization capped at 5 min/day because …").
4. **Plan**: one ordered list of small PR-sized steps, each with files, tests, regression risks and cost impact.
5. **Implement** step by step; after each step run the relevant tests, then `npm run test:ci` before declaring done.
6. **Review**: for anything touching money, auth, grading or AI spend, run the `release-gatekeeper` agent on the diff.

## 3. Hand-off format between skills

```
[skill-name] findings
- Facts (file:line, command output, log line)
- Constraints it imposes on the plan
- Risks / regressions
- Open questions for the owner
```
