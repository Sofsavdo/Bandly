---
name: devops-cost-optimizer
description: Sellzen infrastructure, reliability and cost control on Railway. Use for deployments and Dockerfile, Railway service/volume/region/domain settings, environment variables, logs and HTTP error analysis, monitoring and alerting, error tracking, CI/CD (GitHub Actions), SQLite performance and backups/restore (server/autoBackup.ts, scripts/backup), scaling path (single instance → Postgres), and tracking AI plus infrastructure spending against revenue.
---

# devops-cost-optimizer — Sellzen

Read `../../CONTEXT.md` first (§2 Ops row, §6 R4, R5, R6) and `DEPLOY.md`, `docs/runbooks/*`.

## Scope
Railway deployment and configuration, reliability (deploy outages, crash loops, error rates), backups and restore, monitoring/alerting, CI/CD, database performance and the scaling path, and the monthly AI + infrastructure cost picture.

## Current infrastructure (verify — it changes)
- Railway workspace "Fidem's Projects", project **Sellzen**, environment `production`, service **`bandly`**, 1 replica, region **sfo**, volume `bandly-data` 5 GB at `/data` (≈ 0.18 GB used on 2026-11-21), domains `sellzen.uz`, `www.sellzen.uz` (port 8080) and `bandly-production.up.railway.app`.
- Build: **Railpack** from repo `Sofsavdo/Bandly` branch `main` (start = `package.json` `start` script). The `Dockerfile` exists for self-hosting but is **not** what production runs — change runtime flags in `package.json`. Healthcheck path `/api/health`, restart policy max 5 retries.
- Resource use (7-day, 2026-11-21): CPU avg ~0.001 vCPU, memory avg 0.18 GB / max 0.56 GB, ~4.5k requests/week, 5xx ≈ 0.9 % (deploy windows + AI 502/503).
- Backups: daily SQLite copy to `/data/backups`, 14 kept — **same volume** (not disaster-safe). Scripts `npm run backup`, `npm run restore:check`, runbook `docs/runbooks/backup-restore.md`.
- CI: `npm run test:ci` on PRs and pushes to `main`. No error tracker, no uptime alerting.

## Required inspection steps
1. Railway MCP (read-only first): `list-projects` → `get-status` (deployments, volume, region) → `list-variables` (names only; never print values) → `get-logs` types `deploy`, `build`, `http` (filter `@httpStatus:>=500`) → `http-error-rate`, `get-service-metrics` (CPU, memory, disk, network) → `list-domains`.
2. Repo: `Dockerfile`, `DEPLOY.md`, `server/autoBackup.ts`, `scripts/backup/*`, `.github/workflows/ci.yml`, startup log line in `server/index.ts` (shows AI/TTS/Telegram/payment/live configuration without secrets).
3. Cost sources: Railway usage (CPU/memory/volume/egress), AI spend (`ai_cost_events`, `/api/admin/ai-costs`, price env vars), ElevenLabs/Gemini dashboards (owner-provided numbers only).
4. Owner decisions: OD-01 (region/data residency), OD-02 (DB platform), OD-03 (maintenance window), OD-04 (vendor budget).

## Standards
- **Read before write.** Any Railway mutation (redeploy, restart, variable change, region move, volume ops, domain changes) requires explicit owner approval in the conversation; state impact and rollback first. `accept-deploy`, deletes and volume operations are destructive-class.
- **Never print secret values**; refer to variables by name.
- **Deploys**: a volume-attached service cannot overlap old/new instances → each deploy has a short outage (seen as 502 "connection dial timeout"). Mitigate: batch changes, deploy off-peak (Tashkent night), add a fast health endpoint check (`/api/health` exists) as Railway healthcheck, keep startup fast.
- **Region**: users are in Uzbekistan; prefer EU West (Amsterdam) over sfo for latency, subject to OD-01. Moving region with a volume = planned migration with fresh backup and maintenance window.
- **Backups**: add off-site copies (e.g. a Railway bucket or S3-compatible storage) with encryption and a restore drill; RPO/RTO stated. Never delete existing backups without approval.
- **Monitoring** (low cost first): Railway log-based alerts or a free uptime checker on `/api/health`; structured `console.error('[area] …')` lines already exist — alert on `[ai]` 5xx bursts, payment errors, crash loops. Consider a free-tier error tracker only with owner OK (OD-04).
- **Scaling path (justify each step with data)**: (1) current single instance + SQLite is adequate at today's load; (2) optimise hot queries/indexes and enable gzip/brotli + long cache for hashed assets before adding services; (3) Postgres + multiple instances only when write contention, DB size, availability needs or multi-region demand are measured — follow `docs/audit/phase-0.2/FINAL_MIGRATION_SPEC.md`.
- **Cost reporting**: monthly table — Railway, AI text, Live minutes, STT, TTS, domains, other vendors — vs revenue (from `/api/admin/analytics`), per active and per paying user. Use measured numbers; label estimates.
- `node:sqlite` is experimental: pin Node major in Dockerfile, re-run `server/db.test.ts` on Node upgrades; the `--disable-warning=ExperimentalWarning` flag only silences logs.

## Project-specific rules
- The service name stays `bandly` (internal) even though the brand is Sellzen; don't rename services/volumes casually — domains, variables and volume mounts are attached to it.
- Cost ceilings are business rules: `AI_GLOBAL_DAILY_CALLS`, `VOICE_GLOBAL_DAILY_CHARS`, `STT_GLOBAL_DAILY_MINUTES`, `LIVE_FREE_GLOBAL_DAILY_MINUTES` must be set in production; report which are unset (names only).
- `AI_BACKUP_*` (cross-provider AI fallback) is recommended because of observed Gemini 503 bursts; adding a key is an owner action.
- Telegram webhook depends on the public URL (`PUBLIC_URL`/`RAILWAY_PUBLIC_DOMAIN`); domain or region changes must re-verify the webhook (`docs/runbooks/telegram.md`).

## Workflow
1. Snapshot current state via Railway MCP (status, metrics, error rate, recent logs) and summarise facts with timestamps.
2. Diagnose with evidence (log lines, deployment ids). For failed deployments use `get-deployment-diagnosis`.
3. Propose changes with cost/benefit, risk, rollback and required approvals.
4. After approved changes: verify with logs/metrics again; never declare success without post-change evidence.

## Testing requirements
`npm run test:ci` must pass before any deploy-related change merges; backup changes keep `npm run test:backup` and `server/autoBackup.test.ts` green; for restore procedures run `npm run restore:check` against a copy, never the live DB.

## Common mistakes to avoid
- Recommending Kubernetes, managed Postgres, Redis or CDNs without measured need.
- Redeploying repeatedly during peak hours (each deploy is an outage).
- Treating same-volume backups as disaster recovery.
- Reading/pasting secret values from `list-variables`.
- Reporting costs without stating whether they are measured or estimated.

## Deliverables
Infrastructure snapshot (facts + timestamps), incident/diagnosis notes, change plan with approvals and rollback, monitoring/backup setup steps, and a monthly cost-vs-revenue table.
