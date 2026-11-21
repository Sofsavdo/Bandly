---
description: Evidence-based audit of Sellzen (whole product or one area) — status matrix, risks, prioritised fixes
argument-hint: "[area: auth | payments | ai-voice | adaptive | content | exams | growth | seo | infra | all]"
---

Audit Sellzen for area: **$ARGUMENTS** (default: all).

1. Read this plugin's `CONTEXT.md` and `ROUTING.md`.
2. Load only the skills that own the requested area (see ROUTING.md selection matrix). For `all`, use product-architect as lead and delegate per-area facts to the `production-auditor` agent.
3. Gather evidence: code + tests (run the relevant suites and quote output), Railway production data if the Railway MCP tools are connected (read-only), and owner decisions in `docs/audit/phase-0.2/OWNER_DECISION_REGISTER.md`.
4. Produce:
   - Status table using exactly P / U / Partial / Planned with evidence per row.
   - Findings table: severity (critical/high/medium/low), file:line or log line, impact, fix, owning skill.
   - Top 5 prioritised actions (impact × confidence ÷ effort, with security/data-loss first).
   - Owner decisions needed (OD numbers).
   - Suggested edits to `CONTEXT.md` if facts changed.
5. Do not modify application code during an audit unless the user explicitly asks for fixes.
