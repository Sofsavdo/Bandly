# Telegram: sign-in, bot and Mini App — runbook

Owner decision OD-05 (2026-11-15) makes Telegram the way to sign in and sign out. Sellzen also runs as a Telegram Mini App ("Web App") inside the bot.

## What the owner does (once, about 5 minutes)

1. **Create the bot.**
   - In Telegram, open **@BotFather** and send `/newbot`.
   - Choose a name, e.g. "Sellzen", and a username ending in `bot`, e.g. `sellzen_uz_bot`.
   - BotFather replies with a **token**.
   - **Never paste the token in chat, code or GitHub.**
2. **Allow the site domain for the login button.**
   - In @BotFather, send `/setdomain`, choose the bot, and send `www.sellzen.uz` (the production custom domain; `bandly-production.up.railway.app` is the Railway fallback).
   - Without this, the "Log in with Telegram" button on the site shows "Bot domain invalid".
3. **Add the Railway variables.** In the Sellzen service, open Variables and add:
   - `TELEGRAM_BOT_TOKEN` — the token from step 1 (secret; only Railway holds it).
   - `TELEGRAM_BOT_USERNAME` — the username without `@`. This is optional, because the server reads it from Telegram on start, but it is a useful fallback.
   - `PUBLIC_URL` is optional. By default the server uses Railway's `RAILWAY_PUBLIC_DOMAIN`. Set it, e.g. `https://sellzen.uz`, only for a custom domain.
4. **Redeploy.** The log should show `Telegram bot: @<username> (webhook: yoqildi)`.
5. **Make the bot an admin of the channel** `@Sellzen_AI` (needed for the subscription check, `getChatMember`). Override the channel with `TG_REQUIRED_CHANNEL` if needed. If the bot cannot check membership, the server logs `[bot] kanal a’zoligini tekshirib bo‘lmadi` and lets the user through.
6. **Check in Telegram** (current bot: `@Sellzenbot`).
   - Press **Start** → "subscribe to the channel" with a ✅ Check button (if not subscribed) → "share your number" (Telegram contact button; only the user's own contact is accepted) → welcome photo with buttons: Open Sellzen, Find my level, Mock test, AI tutor, Games, Channel, Help.
   - Commands: /start, /app, /level, /mock, /coach, /help, /remind, /stop. Name, descriptions, commands and the avatar (`public/brand/bot-avatar.jpg`, uploaded once per bot/image via `setMyProfilePhoto`) are set on startup.
   - Phone numbers shared in the bot go to Admin → Lidlar (immediately if the account exists, otherwise on the first Telegram login).
   - The menu button (bottom left) also opens Sellzen.

## How it works

| Piece | Where | Notes |
|---|---|---|
| Site login button | `src/components/JoinForm.tsx`, `src/lib/telegram.ts` (`mountLoginWidget`) | Official Telegram Login Widget. It appears everywhere an account is needed: Profile, league, duel, AI tutor, Writing/Speaking AI, payment. |
| Widget check | `server/telegram.ts` `verifyWidget` | `secret = SHA256(bot_token)`, HMAC-SHA256 of the sorted `key=value` lines without `hash`; `auth_date` ≤ 5 min. |
| Mini App | `bootTelegram()` in `src/main.tsx` | Runs only with `?tg=1` or Telegram hash data. It loads `telegram-web-app.js`, routes `r=` to the page, signs in automatically, shows Telegram's Back button and hides the footer. |
| Mini App check | `server/telegram.ts` `verifyInitData` | `secret = HMAC-SHA256(key "WebAppData", bot_token)`; same string rule; `auth_date` ≤ 1 h. A variant without `signature` is also accepted (both are bot-token HMACs). |
| Account | `server/db.ts` `loginTelegram` | New column `players.tg_id` (unique, additive migration). |
| Bot | `POST /api/telegram/webhook` | Checked by the `X-Telegram-Bot-Api-Secret-Token` header (derived from the token). It answers `/start` and `/mock` with Mini App buttons, in private chats only, inside the webhook response, so there is no extra outbound call. On start the server calls `getMe`, `setWebhook`, `setChatMenuButton` and `setMyCommands`. |
| Config | `GET /api/auth/config` | `{ telegram: { bot } }` or `null`. Without a bot token, the site keeps the old nickname sign-in so nothing breaks. |

**What `loginTelegram` does:**
- If the Telegram id is already linked, it returns that account.
- Otherwise, if this device holds an old nickname account that isn't linked yet, it links that account, keeping XP, subscription and nickname.
- Otherwise it creates a new account, with the nickname taken from the Telegram username or name; a number is added if the nickname is taken.

**Sign-out.** Profile → **Chiqish** removes the account token and server subscriptions from the device. Lesson progress stays on the device.

## Privacy

- **What is stored:** the Telegram numeric id, plus a nickname taken from the username or name. The phone number is never requested and never received.
- **Where data flows:** Telegram sign-in is listed in the processor table of `docs/audit/phase-0.2/FINAL_ARCHITECTURE_SPEC.md` (OD-01 review still applies).

## Known gaps (next steps)

- Sessions still use the existing account token in `localStorage` (AUTH_SECURITY_SPEC §5 cookie sessions and hashed tokens are M3 work).
- Account deletion and "unlink Telegram" are not built yet.
- Mock tests run in the Mini App exactly as on the site. Native bot quizzes (Telegram polls) are not built; the Mini App is the planned surface.
- The verification rules were written from the documented scheme and tested with self-signed data. `core.telegram.org` was not reachable from the build environment. **Confirm with a real bot after step 4.**
