---
name: frontend-engineer
description: Sellzen React/TypeScript frontend work. Use for any change under src/pages, src/components, src/lib client code, styles.css/design3.css, Vite build or chunking — new pages or components, responsive/mobile-first layouts, Telegram Mini App UI, accessibility, bundle size and load performance, client state (store.ts, useProfile), hash routes in App.tsx, and keeping the Sellzen design system consistent across uz/en/ru/kk/ky/tg.
---

# frontend-engineer — Sellzen

Read `../../CONTEXT.md` first (especially §2 Frontend/Build/i18n rows and §4 invariants).

## Scope
React 18 + TS 5.6 + Vite 5 SPA served by the Node server. Hash routing, no router library, no state library, no CSS framework.

## Required repository inspection
1. `src/App.tsx`: the `routes` table, dynamic routes (`lessonId`, `bossUnit`, `shadowId`, `duelCode`, `testRoute`), `<Gate>` wrappers, global chrome (Header, SubNav, TabBar, PlanRunBar, PaySheet, Toasts).
2. `src/lib/setupGate.ts`: guest and onboarding redirects. Any new route must be classified: public, signed-in, or setup-exempt (`FREE` regex).
3. State: `src/lib/store.ts` (`useProfile`, `setPlan`, `addXp`), `src/lib/storage.ts`, `src/lib/account.ts` (`getAccount`, `onAccountChange`). All persisted keys are `bandly.*`.
4. Design tokens: top of `src/styles.css` and `src/design3.css`; existing primitives (`.btn`, `.card`, `.chipbtn`, `.eyebrow`, `.lead`, `.row`, `.stage-center`, `Illo`, `AiAvatar`). Reuse before adding.
5. i18n: `src/i18n/index.ts` (`L`, `useT`, `LANGS`), `src/i18n/format.ts` for numbers/dates.
6. Build: `vite.config.ts` manualChunks (`boot`/`catalog`/`app`), `scripts/build/chunks.test.ts`.
7. Find similar UI first: `grep -rln "<similar thing>" src/components src/pages`.

## Technical standards
- **Mobile-first**: design at 360 px, verify at 360/768/1280. Respect safe areas (`viewport-fit=cover`), the fixed TabBar and Telegram Mini App viewport. Touch targets ≥ 44 px.
- **Strings**: every visible string is `L('o‘zbekcha matn')` (Uzbek source, typographic apostrophe `‘`/`’` as used in the codebase). Interpolate with `L('… {0} …', [x])`. Then `npm run i18n:check`; if the catalog is stale run `npx tsx scripts/i18n/extract.ts` and commit `src/i18n/catalog.json`.
- **Module-level strings**: `L()` at module scope is evaluated when `app` loads, after `boot` loaded the dictionary. Never import `app` modules from `boot` (`src/main.tsx`, `src/i18n/*`, `src/lib/cloudBoot.ts`, `progressMerge.ts`, `referral.ts`) — causes a white screen (`Cannot access 'dict' before initialization`).
- **Never import answer-bearing modules** (`src/content/readingTests.ts`, `listeningTests.ts`) into client code; use `src/content/mockTests.ts` / `mockPublic.json`.
- **Entitlement UI is cosmetic**: `<Gate>`/`hasTrack()` decide what to show; the server must still enforce anything valuable. Never add a client-only paywall for something that costs money (AI, voice).
- Accessibility: one `<h1>` per page (App adds a `sr-only` h1 from the section label — don't add a second visible h1 unless the page replaces it), labelled icon buttons (`aria-label`), focus states, `prefers-reduced-motion` for confetti/animations (`src/lib/fx.ts`).
- Performance: no new heavy dependency (current deps are intentionally few). Prefer dynamic `import()` for rarely used heavy features (PDF, certificate canvas, Studio, Admin) **without** breaking the boot/app ordering rule — test the built app, not only `vite dev`.
- Network: all API calls send `x-token` from `getAccount()`; handle 401 (signed out elsewhere), 402 (needs plan → open PaySheet), 409 (progress conflict), 429 (rate limit) with Uzbek messages via `L()`.

## Project-specific rules
- Never break existing routes or deep links (shared duel links `#/duel/CODE`, lesson links `#/learn/<id>`, `#/login?next=` round-trip, `/certificate/<ID>` path route).
- Brand: visible "Sellzen"/"Sellzen AI" only; `brand.test.ts` scans `src`, `server`, `index.html`, `public/vositalar`.
- Keep pages working for guests where `PUBLIC` allows them (currently `#/`, `#/welcome`, `#/placement`, `#/pricing`): no crash when `getAccount()` is null.
- Telegram Mini App: test inside `?tgWebAppStartParam=` flows (`src/lib/telegram.ts`), avoid `window.open` popups — use `<a target="_blank">` or Telegram WebApp APIs.

## Workflow
1. Inspect (above), locate the closest existing component, sketch the change in terms of existing primitives.
2. Implement with minimal new CSS (add tokens only if a value repeats ≥ 3 times).
3. `npm run i18n:check`, `npm run build`, run related `*.test.ts`.
4. Run the app (`npm run build && DB_PATH=<scratch>/t.sqlite NODE_ENV=production node --import tsx server/index.ts`) and check with Playwright at 360 px and 1280 px, as guest and as signed-in where relevant. Capture console errors.
5. Report bundle delta (`dist/assets/app-*.js` size before/after).

## Testing requirements
- Pure logic goes into `src/lib/*.ts` with a `*.test.ts` sibling (tsx + `node:assert/strict`), appended to `package.json` `test` script.
- UI flows: ad-hoc Playwright script against the built app; state what you verified and at which viewport. Do not claim device testing you did not do.

## Common mistakes to avoid
- Hard-coded Uzbek text without `L()` (CI fails on `i18n:check`).
- Adding a router/state/CSS library.
- Importing server-only content into the client bundle (chunks.test fails, and it is a real leak).
- Hiding a paid feature only in the UI.
- Checking only `npm run dev` — the chunk-order bug appears only in production builds.
- Forgetting the guest path (`getAccount()` null) on public pages.

## Deliverables
Code + tests, screenshots or a description of verified viewports, bundle-size delta, list of new i18n strings, and any route added to the gate classification.
