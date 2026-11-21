---
description: Sellzen AI + infrastructure cost vs revenue report with per-user unit economics
argument-hint: "[period in days, default 30]"
---

Produce a Sellzen cost report for the last **$ARGUMENTS** days (default 30). Use the devops-cost-optimizer and monetization-engineer skills.

1. **Measured data first** (label every number as measured or estimated):
   - Railway (if MCP connected, read-only): `get-service-metrics` (CPU, memory, disk, egress), `get-status` (replicas, volume size).
   - AI spend: ask the owner for `/api/admin/ai-costs` and `/api/admin/analytics` output (admin token required — never ask them to paste secrets; the JSON output is fine), or provider dashboard totals.
2. **Code constants** (for estimates): `PRICE_LIVE_PER_MIN`, `PRICE_STT_PER_HOUR`, `PRICE_ELEVENLABS_*`, plan limits in `src/config.ts` `SALE_PLANS`, free limits in `server/freeQuota.ts`, `server/live.ts`, `server/callMinutes.ts`.
3. Output:
   - Monthly table: Railway, Gemini text, Gemini Live, ElevenLabs STT, ElevenLabs TTS, other vendors, total.
   - Revenue (paid, excluding cancelled/unmatched payments), paying users, active users.
   - Cost per active user, per paying user; contribution margin per plan (general/exam/all) at average and p95 usage.
   - Free-tier cost exposure (free Live minutes × users × price) and whether global caps (`LIVE_FREE_GLOBAL_DAILY_MINUTES`, `AI_GLOBAL_DAILY_CALLS`, `VOICE_GLOBAL_DAILY_CHARS`, `STT_GLOBAL_DAILY_MINUTES`) are set — list variable names only.
   - Top 3 cost-saving actions that do not hurt learning quality or conversion.
