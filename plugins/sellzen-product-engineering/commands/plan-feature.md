---
description: Cross-functional plan for a Sellzen feature — picks the relevant skills, reconciles conflicts, outputs PR-sized steps
argument-hint: "<feature description>"
---

Plan this Sellzen feature: **$ARGUMENTS**

Follow `ROUTING.md` in this plugin:
1. **Frame** with product-architect: user, job, product (General English / Exam Preparation / Mock Arena / shared layer), success metric, blocking owner decisions (OD numbers).
2. **Select skills** from the matrix — only the ones this feature needs — and say which and why.
3. **Inspect**: each selected skill runs its "Required repository inspection" steps; report facts with file:line, not assumptions. Note anything that already exists and should be extended.
4. **Reconcile** conflicting recommendations using the precedence in ROUTING.md §2 and record each resolution.
5. **Plan** ordered, PR-sized steps. For each: owning skill, files, schema/API changes, tests to add (and wire into `package.json`), regression risks, AI/infra cost impact, rollback.
6. **Owner questions**: list decisions you cannot make (pricing, budget, region, policy).

Do not start implementing until the user approves the plan.
