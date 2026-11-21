import { createHash, randomUUID } from 'node:crypto';
import { resolvePersona, coachTurn, once, MAX_HISTORY, buildLivePrompt, liveKickoff } from './coach';
import { ensureMemoryTable, getMemory, memoryForPrompt, mergeMemory, parseSummary, saveMemory, summaryPrompt } from './coachMemory';
import { tzDay } from './day';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { ApiError, PROGRESS_MAX, expireIdleSessions, refundGlobalAi, revokeSession, requireRole, roleOf, setRole, staffList, aiCostSummary, byToken, createDb, getProgress, loginTelegram, putProgress, createDuel, getDuel, join, leaderboard, recordAiCost, refundAi, refundGlobalVoiceChars, submitDuel, sync, useAi, useGlobalAi, useGlobalVoiceChars } from './db';
import { fileURLToPath } from 'node:url';
import { serveStatic } from './static';
import { dirname } from 'node:path';
import { hamyonApi, hamyonConfigFromEnv, verifySign } from './hamyon';
import { findUsers } from './adminUsers';
import { IELTS_UNITS, UNITS as STATIC_UNITS } from '../src/content/lessons';
import { listeningTests } from '../src/content/listeningTests';
import { readingTests } from '../src/content/readingTests';
import { claimBotPhone, ensureLeadsTable, getBotRef, hasBotPhone, hasLead, listLeads, saveBotPhone, saveLead, setBotRef, updateLead } from './leads';
import { liveCost, livePrice, setUsageSink, textCost, textPrice, withAiCtx } from './aiUsage';
import { cancelPayment, createPayment, entitlements, findByCallback, grant, markPrepared, applyResult, reconcile, recent, statusFor } from './payments';
import { PERIODS, PLAN_IDS, priceFor } from './pricing';
import { addCall, callLeft, CALL_MONTH_SECONDS, ttsSeconds } from './callMinutes';
import { addBand, bandStats, deleteBand, listBands, summary as bandSummary } from './bands';
import { freeLimitsFromEnv, freeStatus, unlockLesson, wallStats } from './freeQuota';
import { listStudioTests, publicStudioTests, publishedStudioTests, saveStudioTest, setStudioTestStatus } from './studioTests';
import { attachLive, liveConfigFromEnv, recordLive } from './live';
import { TTS_DAILY_LIMIT, TtsError, VOICE_DAILY_ANSWERS, cleanText, estimateCostUsd, isCached, isEmotion, synthesize, ttsConfigFromEnv } from './tts';
import { startAutoBackup } from './autoBackup';
import { PHOTO_MAX, auditLog, audit, claimAll, composeFull, issueFor, myCertificates, profileOf, publicCertificate, recordResult, revokeCertificate, rules as certRules, savePhoto, searchCertificates, setFullName, setRule, setSettings as setCertSettings, settings as certSettings } from './certificates';
import { gradeRequest } from './mockGrade';
import { aiDraftLessons, extractText, isVideo, MAX_VIDEO, saveMedia } from './importer';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { voiceLesson } from './content';
import { elevenLabsFromEnv, synthesize as elSynthesize } from './elevenlabs';
import { writeFileSync as writeFile, mkdirSync as mkdir } from 'node:fs';
import { archive, knownContent, contentVersion, createLesson, createUnit, history, publish, publishedUnits, reorder, restore, saveLesson, saveUnit, seedContent, studioTree } from './content';
import { awardXp, submitXp } from './xp';
import { leagueView } from './league';
import { assessmentUsage, refundAssessment, useAssessment } from './entitle';
import { TgAuthError, appUrl, botFromEnv, nickFrom, setBotPhoto, setupBot, tgApi, tgUpload, verifyInitData, verifyWidget, webhookSecret } from './telegram';
import { checkMember, CHANNEL, handleBot } from './botFlow';
import { runReminders, setRemind } from './reminders';
import { runLeagueNotices } from './leagueNotify';
import { MAX_AUDIO, NATIVE_STT_CODE, recordStt, sttAllowed, sttConfigFromEnv, transcribeLearner } from './stt';
import { analytics } from './analytics';
import { ensureEventsTable, recordEvent } from './events';
import { attachReferral, maybeRewardReferral, refStats } from './referral';
import { creatorStats, creatorsOverview } from './creator';
import { archiveGroup, createGroup, groupReport, joinGroup, joinedGroups, leaveGroup, myGroups, removeMember } from './groups';
import { coverage, dictFor, isTarget, lastRejected, listTranslations, setTranslation, translateMissing, trServer } from './i18n';
import { complete, AiError, aiOffReason, coachConfig, configFromEnv, evaluateSpeaking, evaluateWriting, followUp, followUpPersona, nativeOf } from './ai';

const PORT = Number(process.env.PORT ?? 3101);
const ai = configFromEnv();
// AI Coach limits (env). Global ceiling is FAIL-CLOSED: unset or 0 = coach disabled even with a key (owner decision OD-09).
const COACH_FREE_DAILY_ANSWERS = Number(process.env.COACH_FREE_DAILY_ANSWERS ?? process.env.VOICE_DAILY_ANSWERS ?? 5); // obunasiz: AI ustoz suhbatidagi neyron ovozli javoblar/kun
const COACH_GLOBAL_DAILY = Number(process.env.AI_GLOBAL_DAILY_CALLS ?? 0);
const STUDIO_VOICE_DAILY_CHARS = Number(process.env.STUDIO_VOICE_DAILY_CHARS ?? 20_000);
const stt = sttConfigFromEnv();
const coachAi = coachConfig(ai);
const live = liveConfigFromEnv(ai.provider === 'gemini' ? ai.key : null); // Gemini Live: ovozdan-ovozga AI ustoz // ovozli suhbat uchun tez model (Gemini: Flash-Lite birinchi) // ElevenLabs Scribe (AI ustoz uchun nutqni tanish); bo'lmasa brauzer tanishi
const COACH_DAILY_LIMIT = Number(process.env.AI_COACH_DAILY_LIMIT ?? 30);
const HOST = process.env.HOST ?? (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const DB_FILE = process.env.DB_PATH ?? new URL('./data.sqlite', import.meta.url).pathname;
const db = createDb(DB_FILE);
startAutoBackup(DB_FILE); // kunlik zaxira nusxa: <DB papkasi>/backups, 14 kun
expireIdleSessions(db); setInterval(() => expireIdleSessions(db), 86_400_000).unref(); // 180 kun ishlatilmagan sessiyalar
ensureEventsTable(db);
ensureMemoryTable(db);
ensureLeadsTable(db);
const seeded = seedContent(db); // statik darslardan bazada yo'qlarini qo'shadi (mavjudlarini o'zgartirmaydi)
if (seeded) console.log('Kontent: %d ta yangi bo‘lim/dars bazaga qo‘shildi', seeded);
const hcfg = hamyonConfigFromEnv();
const hapi = hcfg ? hamyonApi(hcfg) : null;
// Demo rejim (to'lovsiz yoqish) faqat to'lov ulanmaganda; PAY_DEMO=1 bilan majburan yoqish mumkin
const DEMO = process.env.PAY_DEMO ? process.env.PAY_DEMO === '1' : !hapi;
const ADMIN_TOKEN = (process.env.ADMIN_TOKEN ?? '').trim();
// Telegram bot (ixtiyoriy): TELEGRAM_BOT_TOKEN bo'lsa — Telegram orqali kirish, webhook va Mini App tugmasi yoqiladi
const bot = botFromEnv();
let botUsername: string | null = bot?.username ?? null;
if (bot) setupBot(bot, fetch, { onUsername: (u) => { botUsername = u; } }).then(async (u) => {
  console.log('Telegram bot: @%s (sozlash tugadi%s)', u, bot.publicUrl ? '' : ', PUBLIC_URL yo‘q');
  // Bot rasmi (public/brand/bot-avatar.jpg): rasm yoki bot o'zgargandagina yuklanadi (Telegram rasmni qayta ishlatishga yo'l qo'ymaydi)
  try {
    const file = new URL('../public/brand/bot-avatar.jpg', import.meta.url).pathname;
    if (!existsSync(file)) return;
    const bytes = readFileSync(file);
    const key = `bot-photo:${bot.token.split(':')[0]}`, hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    db.exec('CREATE TABLE IF NOT EXISTS bot_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
    if ((db.prepare('SELECT value FROM bot_meta WHERE key = ?').get(key) as { value: string } | undefined)?.value === hash) return;
    await setBotPhoto(bot.token, { bytes, name: 'avatar.jpg', type: 'image/jpeg' });
    db.prepare('INSERT INTO bot_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, hash);
    console.log('Telegram bot rasmi yangilandi');
  } catch (e) { console.error('Telegram bot rasmi:', (e as Error).message); }
}).catch((e) => console.error('Telegram bot sozlanmadi:', (e as Error).message));
const tts = ttsConfigFromEnv(process.env.TTS_CACHE_DIR ?? `${dirname(DB_FILE)}/tts-cache`);

// Oddiy so'rov tezligi cheklovi (IP bo'yicha, daqiqada 120 ta)
const hits = new Map<string, { n: number; reset: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) { hits.set(ip, { n: 1, reset: now + 60_000 }); return false; }
  return ++h.n > 120;
}

let langsCache: { at: number; langs: string[] } | null = null; // tayyor tillar ro'yxati (5 daqiqa kesh)
/** So'rov tili: ilova sarlavhasi (x-lang), bo'lmasa brauzer tili. */
const reqLang = (req: IncomingMessage): string => String(req.headers['x-lang'] ?? String(req.headers['accept-language'] ?? '').split(/[,;-]/)[0] ?? '').toLowerCase();
const send = (res: ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
};

/** Hamyon callbacklari: urlencoded, JSON yoki multipart/form-data maydonlari. */
function readForm(req: IncomingMessage, limit = 8192): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => { size += c.length; if (size > limit) { reject(new ApiError(413, 'So‘rov juda katta')); req.destroy(); return; } chunks.push(c); });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      const ct = String(req.headers['content-type'] ?? '');
      const out: Record<string, string> = {};
      if (ct.includes('json')) { try { for (const [k, v] of Object.entries(JSON.parse(raw || '{}') as Record<string, unknown>)) out[k] = String(v); } catch { reject(new ApiError(400, 'JSON xato')); return; } }
      else if (ct.includes('multipart')) { for (const m of raw.matchAll(/name="([^"]+)"\r?\n\r?\n([^\r\n]*)/g)) out[m[1]] = m[2]; }
      else for (const [k, v] of new URLSearchParams(raw)) out[k] = v;
      resolve(out);
    });
    req.on('error', reject);
  });
}

function readRaw(req: IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => { size += c.length; if (size > limit) { reject(new ApiError(413, 'Fayl juda katta')); req.destroy(); return; } chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
const MEDIA_DIR = `${dirname(DB_FILE)}/media`;
const certProfile = (id: number) => { const p = profileOf(db, id); return { fullName: p.fullName, photoUrl: p.photo ? `/media/${p.photo}` : null }; };

function readJson(req: IncomingMessage, limit = 2048): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > limit) { reject(new ApiError(413, 'So‘rov juda katta')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { reject(new ApiError(400, 'JSON xato')); }
    });
    req.on('error', reject);
  });
}

const httpServer = createServer(async (req, res) => {
  try {
    // Proksi (Railway va boshqalar) orqasida haqiqiy IP birinchi X-Forwarded-For qiymatida
    const fwd = TRUST_PROXY ? String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() : '';
    const ip = fwd || (req.socket.remoteAddress ?? 'x');
    // Chegara faqat API uchun: sahifa, skript va shrift fayllari sanalmaydi (aks holda bir necha marta yangilash sahifani to'sib qo'yadi)
    if ((req.url ?? '').startsWith('/api/') && limited(ip)) return send(res, 429, { error: trServer(db, reqLang(req), 'Juda ko‘p so‘rov') });
    // Buzuq manzil (skanerlar: "//%2e%2e%2f.env" kabi) — 500 emas, 400
    let url: URL;
    try { url = new URL(req.url ?? '/', 'http://x'); } catch { return send(res, 400, { error: 'Bad request' }); }
    if (req.method === 'POST' && url.pathname === '/api/event') {
      const b = await readJson(req, 256);
      recordEvent(db, b.name, ip); // anonim: faqat kunlik son; ip faqat xotirada takrorni ajratish uchun
      res.writeHead(204); return void res.end();
    }
    if (req.method === 'GET' && url.pathname === '/api/auth/config') return send(res, 200, { telegram: bot && botUsername ? { bot: botUsername } : null });
    if (req.method === 'POST' && (url.pathname === '/api/auth/telegram' || url.pathname === '/api/auth/telegram/webapp')) {
      if (!bot) throw new ApiError(503, 'Telegram orqali kirish hali sozlanmagan');
      const b = await readJson(req, 8192);
      let u;
      try { u = url.pathname.endsWith('/webapp') ? verifyInitData(String(b.initData ?? ''), bot.token) : verifyWidget((b.user ?? {}) as Record<string, unknown>, bot.token); }
      catch (e) { if (e instanceof TgAuthError) throw new ApiError(401, e.message); throw e; }
      const r = loginTelegram(db, u.id, nickFrom(u), typeof b.link === 'string' ? b.link : undefined);
      const pid = byToken(db, r.token).id;
      if (r.created) attachReferral(db, pid, b.ref ?? getBotRef(db, u.id)); // taklif havolasi orqali kelgan bo'lsa (botda /start ref_ ham)
      claimBotPhone(db, u.id, pid); // botda ulashilgan raqam lidga o'tadi
      return send(res, 200, { token: r.token, nickname: r.nickname, linked: r.linked, created: r.created });
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
      revokeSession(db, String(req.headers['x-token'] ?? '')); // shu qurilma tokeni endi ishlamaydi
      return send(res, 200, { ok: true });
    }
    if (req.method === 'POST' && url.pathname === '/api/telegram/webhook') {
      if (!bot?.publicUrl || String(req.headers['x-telegram-bot-api-secret-token'] ?? '') !== webhookSecret(bot.token)) return send(res, 403, { error: 'Taqiqlangan' });
      const upd = await readJson(req, 65_536);
      // Bot oqimi: majburiy obuna (@Sellzen_AI) → Telegram kontakti → xush kelibsiz xabari. Javoblar API orqali (bir nechta xabar).
      const api = (method: string, body: Record<string, unknown>) => tgApi(bot.token, method, body);
      void handleBot(upd, {
        api, publicUrl: bot.publicUrl,
        tr: (lc) => (t: string) => trServer(db, lc, t),
        isMember: (id) => checkMember(api, CHANNEL, id),
        hasPhone: (id) => hasBotPhone(db, id) || (() => { const p = db.prepare('SELECT id FROM players WHERE tg_id = ?').get(id) as { id: number } | undefined; return !!p && hasLead(db, p.id); })(),
        savePhone: (id, phone) => saveBotPhone(db, id, phone),
        setRef: (id, ref) => setBotRef(db, id, ref), getRef: (id) => getBotRef(db, id),
        setRemind: (id, on) => setRemind(db, id, on),
        stats: BOT_STATS, sendPhoto: (msg) => sendWelcomePhoto(bot.token, msg),
      }).catch((e) => console.error('[bot]', (e as Error).message));
      return send(res, 200, {});
    }
    if (req.method === 'POST' && url.pathname === '/api/join') {
      // Telegram ulangach yangi hisob faqat Telegram orqali ochiladi (OD-05); mavjud hisoblar ishlashda davom etadi
      if (bot) throw new ApiError(410, 'Hisob endi Telegram orqali ochiladi');
      const b = await readJson(req);
      const jr = join(db, String(b.nickname ?? ''));
      attachReferral(db, byToken(db, jr.token).id, b.ref);
      return send(res, 200, jr);
    }
    // ---- Darslar kontenti: o'quvchilar uchun e'lon qilingan versiya ----
    if (req.method === 'GET' && url.pathname === '/api/content') {
      const v = contentVersion(db);
      if (url.searchParams.get('v') === String(v)) return send(res, 200, { version: v, units: null }); // o'zgarmagan
      return send(res, 200, { version: v, units: publishedUnits(db) });
    }
    // ---- Tarjimalar (ochiq): /api/i18n — tayyor tillar (qamrov ≥ 98%), /api/i18n/ru — lug'at ----
    if (req.method === 'GET' && url.pathname === '/api/i18n') {
      if (!langsCache || Date.now() - langsCache.at > 300_000) {
        const cov = coverage(db);
        langsCache = { at: Date.now(), langs: ['uz', ...Object.entries(cov).filter(([, c]) => c.total > 0 && c.done / c.total >= 0.98).map(([l]) => l)] };
      }
      return send(res, 200, { langs: langsCache.langs });
    }
    const i18nM = url.pathname.match(/^\/api\/i18n\/([a-z]{2})$/);
    if (req.method === 'GET' && i18nM) {
      if (!isTarget(i18nM[1])) return send(res, 404, { error: 'Topilmadi' });
      const d = dictFor(db, i18nM[1]);
      if (url.searchParams.get('v') === d.v) { res.writeHead(304); return void res.end(); }
      return send(res, 200, d);
    }
    // ---- Referal: taklif kodi va statistika ----
    if (req.method === 'GET' && url.pathname === '/api/referral') {
      const p = byToken(db, String(req.headers['x-token'] ?? ''));
      return send(res, 200, { ...refStats(db, p.id), bot: botUsername });
    }
    // ---- Hamkor kabineti (rol: creator; admin — barcha hamkorlar) ----
    if (req.method === 'GET' && url.pathname === '/api/creator') {
      const me = requireRole(db, String(req.headers['x-token'] ?? ''), ['creator']);
      return send(res, 200, { me: creatorStats(db, me.id), all: me.role === 'admin' ? creatorsOverview(db) : null, bot: botUsername });
    }
    // ---- Guruhlar (B2B): o'qituvchi — yaratish va hisobot; o'quvchi — kod bilan qo'shilish ----
    if (url.pathname === '/api/groups' || url.pathname.startsWith('/api/groups/')) {
      const tk = String(req.headers['x-token'] ?? '');
      const gp = url.pathname.split('/').slice(3); // ['', 'join'] | [id] | [id, 'members', pid]
      if (req.method === 'POST' && gp[0] === 'join') { const b = await readJson(req); return send(res, 200, joinGroup(db, byToken(db, tk).id, String(b.code ?? ''))); }
      if (req.method === 'GET' && gp[0] === 'mine') return send(res, 200, { groups: joinedGroups(db, byToken(db, tk).id) });
      if (req.method === 'POST' && gp[0] === 'leave') { const b = await readJson(req); leaveGroup(db, byToken(db, tk).id, Number(b.id)); return send(res, 200, { ok: true }); }
      const me = requireRole(db, tk, ['teacher']);
      const admin = me.role === 'admin';
      if (req.method === 'GET' && gp.length === 0) return send(res, 200, { groups: myGroups(db, me.id) });
      if (req.method === 'POST' && gp.length === 0) { const b = await readJson(req); return send(res, 200, createGroup(db, me.id, String(b.name ?? ''))); }
      const gid = Number(gp[0]);
      if (!Number.isInteger(gid)) throw new ApiError(404, 'Topilmadi');
      if (req.method === 'GET' && gp.length === 1) return send(res, 200, groupReport(db, gid, me.id, admin));
      if (req.method === 'DELETE' && gp.length === 1) { archiveGroup(db, gid, me.id, admin); return send(res, 200, { ok: true }); }
      if (req.method === 'DELETE' && gp[1] === 'members') { removeMember(db, gid, me.id, admin, Number(gp[2])); return send(res, 200, { ok: true }); }
      throw new ApiError(404, 'Topilmadi');
    }
    // ---- Band o'lchovi: mock va rasmiy IELTS natijalari (o'sishni isbotlash uchun) ----
    if (url.pathname === '/api/bands' || url.pathname.startsWith('/api/bands/')) {
      const me = byToken(db, String(req.headers['x-token'] ?? ''));
      const id = Number(url.pathname.split('/')[3]);
      if (req.method === 'POST' && url.pathname === '/api/bands') { addBand(db, me.id, await readJson(req)); }
      else if (req.method === 'DELETE' && Number.isInteger(id)) deleteBand(db, me.id, id);
      else if (req.method !== 'GET') throw new ApiError(404, 'Topilmadi');
      const records = listBands(db, me.id);
      return send(res, 200, { records, summary: bandSummary(records) });
    }
    // ---- Admin analitikasi ----
    if (req.method === 'GET' && url.pathname === '/api/admin/analytics') {
      requireRole(db, String(req.headers['x-token'] ?? ''), []); // faqat admin
      return send(res, 200, { ...analytics(db, Date.now(), Math.min(90, Math.max(7, Number(url.searchParams.get('days')) || 30))), bands: bandStats(db), walls: wallStats(db) });
    }
    // ---- Metodist kabineti (rol: methodologist yoki admin) ----
    if (url.pathname.startsWith('/api/studio/')) {
      const me = requireRole(db, String(req.headers['x-token'] ?? ''), ['methodologist']);
      const by = me.nickname;
      const p = url.pathname.slice('/api/studio/'.length).split('/');
      if (req.method === 'GET' && p[0] === 'tree') return send(res, 200, { units: studioTree(db), role: me.role });
      // Tarjimalar: qamrov, ro'yxat, qo'lda tuzatish (metodist), AI tarjima (faqat admin — xarajatli)
      if (p[0] === 'i18n') {
        if (req.method === 'GET' && !p[1]) return send(res, 200, { coverage: coverage(db), ai: ai.provider !== 'none', rejected: Object.fromEntries(lastRejected) });
        const b = req.method === 'GET' ? Object.fromEntries(url.searchParams) : await readJson(req, 20_000);
        const lang = String(b.lang ?? '');
        if (!isTarget(lang)) throw new ApiError(400, 'Til noto‘g‘ri');
        if (req.method === 'GET' && p[1] === 'list') return send(res, 200, { items: listTranslations(db, lang, String(b.q ?? ''), 60, b.missing === '1') });
        if (req.method === 'PUT' && p[1] === 'item') {
          const src = String(b.src ?? ''), text = String(b.text ?? '').trim().slice(0, 4000);
          if (!src || !text) throw new ApiError(400, 'Matn bo‘sh');
          setTranslation(db, lang, src, text, 'human');
          return send(res, 200, { ok: true });
        }
        if (req.method === 'POST' && p[1] === 'translate') {
          if (me.role !== 'admin') throw new ApiError(403, 'Faqat admin');
          if (ai.provider === 'none') throw new ApiError(503, 'AI sozlanmagan');
          const r = await translateMissing(db, ai, lang, { onCost: (chars) => recordAiCost(db, { playerId: me.id, feature: 'i18n', provider: ai.provider, model: ai.model, units: Math.round(chars / 3), unitKind: 'tokens', costUsd: (chars / 3) * 6e-6, estimated: true }) });
          return send(res, 200, r);
        }
      }
      // Fayl yuklash: hujjat → matn → (AI) → qoralama darslar; video → media URL
      if (req.method === 'POST' && p[0] === 'upload') {
        const name = String(url.searchParams.get('name') ?? '').slice(0, 120);
        const buf = await readRaw(req, MAX_VIDEO + 1024);
        if (isVideo(name)) return send(res, 200, { media: { kind: /\.(m4a|mp3)$/i.test(name) ? 'audio' : 'video', url: saveMedia(MEDIA_DIR, name, buf) } });
        return send(res, 200, { text: await extractText(name, buf) });
      }
      if (req.method === 'POST' && p[0] === 'import') {
        const b = await readJson(req, 300_000);
        const unitId = String(b.unitId ?? '');
        const unit = studioTree(db).find((u) => u.id === unitId);
        if (!unit) throw new ApiError(404, 'Bo‘lim topilmadi');
        const text = String(b.text ?? '').trim();
        if (text.length < 20) throw new ApiError(400, 'Matn juda qisqa');
        if (ai.provider === 'none') throw new ApiError(503, 'AI yordamchi ulanmagan: matn ajratib olindi, uni darsga qo‘lda kiriting (Tahrirlash).');
        useGlobalAi(db, COACH_GLOBAL_DAILY); // umumiy AI chegarasi (xarajat nazorati)
        const media = b.media && typeof b.media === 'object' ? b.media as { kind: 'video' | 'audio'; url: string } : null;
        const drafts = await aiDraftLessons(ai, text, { level: unit.level, unitTitle: unit.data.titleUz, note: typeof b.note === 'string' ? b.note : undefined }, () => '');
        const created = drafts.map((d) => {
          const lesson = media && /^\/media\/[\w.-]+$/.test(media.url) ? { ...d.lesson, media: [{ kind: media.kind === 'audio' ? 'audio' as const : 'video' as const, url: media.url, transcript: text.slice(0, 20_000) }] } : d.lesson;
          const r = createLesson(db, unitId, lesson, by);
          return { id: r.id, title: lesson.titleUz, errors: r.errors };
        });
        return send(res, 200, { created });
      }
      // Testlar (Reading/Listening): matn formatida yoziladi, xatosiz bo'lsa e'lon qilinadi
      if (p[0] === 'tests') {
        if (req.method === 'GET' && !p[1]) return send(res, 200, { tests: listStudioTests(db) });
        const tb = await readJson(req, 80_000);
        if (req.method === 'POST' && !p[1]) return send(res, 200, saveStudioTest(db, null, String(tb.source ?? ''), by));
        if (req.method === 'PUT' && p[1] && !p[2]) return send(res, 200, saveStudioTest(db, p[1], String(tb.source ?? ''), by));
        if (req.method === 'POST' && p[1] && ['publish', 'archive', 'restore'].includes(p[2] ?? '')) { setStudioTestStatus(db, p[1], p[2] as 'publish', by); return send(res, 200, { ok: true }); }
      }
      if (req.method === 'GET' && p[0] === 'history' && p[1]) return send(res, 200, { history: history(db, p[1]) });
      const b = req.method === 'GET' ? {} : await readJson(req, 262_144);
      if (req.method === 'POST' && p[0] === 'unit' && !p[1]) return send(res, 200, createUnit(db, String(b.level ?? ''), (b.data ?? {}) as { titleUz?: string }, by));
      if (req.method === 'PUT' && p[0] === 'unit' && p[1]) { saveUnit(db, p[1], (b.data ?? {}) as { titleUz?: string }, by); return send(res, 200, { ok: true }); }
      if (req.method === 'POST' && p[0] === 'lesson' && !p[1]) return send(res, 200, createLesson(db, String(b.unitId ?? ''), b.data, by));
      if (req.method === 'PUT' && p[0] === 'lesson' && p[1]) return send(res, 200, saveLesson(db, p[1], b.data, by));
      if (req.method === 'POST' && p[1] && ['publish', 'archive', 'restore'].includes(p[2] ?? '')) {
        ({ publish, archive, restore } as const)[p[2] as 'publish' | 'archive' | 'restore'](db, p[1], by);
        return send(res, 200, { ok: true });
      }
      if (req.method === 'POST' && p[0] === 'lesson' && p[1] && p[2] === 'voice') {
        const el = elevenLabsFromEnv();
        if (!el) throw new ApiError(503, 'Ovozlashtirish uchun ElevenLabs kaliti sozlanmagan');
        // Kabinet uchun alohida kunlik chegara (belgi), umumiy AI xarajatlar jurnaliga yoziladi
        const day = `studio-voice:${tzDay(Date.now())}`;
        const used = (db.prepare('SELECT calls FROM ai_global_usage WHERE day = ?').get(day) as { calls: number } | undefined)?.calls ?? 0;
        const left = Math.max(0, STUDIO_VOICE_DAILY_CHARS - used);
        const voice = String(b.voice ?? 'us') === 'uk' ? 'y1LQSw6x4O5I1qZEI77j' : 'WZlYpi1yf6zJhNWXih74'; // Sarah (UK) / Hope (US) — egasi tanlagan ovozlar
        const r = await voiceLesson(db, p[1], by, async (text) => {
          const audio = await elSynthesize(el, { text, voiceId: voice, modelId: 'eleven_v4_turbo', outputFormat: 'mp3_22050_32' });
          mkdir(MEDIA_DIR, { recursive: true });
          const file = `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.mp3`;
          writeFile(`${MEDIA_DIR}/${file}`, audio);
          return `/media/${file}`;
        }, left);
        if (r.chars) {
          db.prepare('INSERT INTO ai_global_usage (day, calls) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET calls = calls + excluded.calls').run(day, r.chars);
          recordAiCost(db, { playerId: me.id, feature: 'studio_voice', provider: 'elevenlabs', model: 'eleven_v4_turbo', units: r.chars, unitKind: 'chars', costUsd: r.chars * 0.5 * 0.00022, estimated: true });
        }
        return send(res, 200, r);
      }
      if (req.method === 'POST' && p[0] === 'reorder') { reorder(db, (b.ids ?? []) as string[], by); return send(res, 200, { ok: true }); }
      return send(res, 404, { error: 'Topilmadi' });
    }
    // Bepul tarif (B varianti): har kursda kuniga 1 ta yangi dars (birinchi kuni 3 ta); obunachiga cheklov yo'q
    if (req.method === 'GET' && url.pathname === '/api/free') return send(res, 200, freeStatus(db, String(req.headers['x-token'] ?? ''), freeLimitsFromEnv()));
    if (req.method === 'POST' && url.pathname === '/api/free/unlock') { const b = await readJson(req); return send(res, 200, unlockLesson(db, String(req.headers['x-token'] ?? ''), b.course, b.lessonId, freeLimitsFromEnv())); }
    if (req.method === 'GET' && url.pathname === '/api/mock/tests') { byToken(db, String(req.headers['x-token'] ?? '')); return send(res, 200, publicStudioTests(db)); } // kabinetda e'lon qilingan testlar (javobsiz), faqat hisob bilan
    if (req.method === 'POST' && url.pathname === '/api/mock/grade') {
      const b = await readJson(req, 16_384);
      return send(res, 200, gradeRequest(db, String(req.headers['x-token'] ?? ''), b, String(b.testId ?? '').startsWith('st-') ? publishedStudioTests(db) : [], Date.now(), MEDIA_DIR));
    }
    // ---- Sertifikatlar ----
    if (url.pathname.startsWith('/api/certificates/verify/') && req.method === 'GET') return send(res, 200, publicCertificate(db, decodeURIComponent(url.pathname.slice('/api/certificates/verify/'.length))));
    if (url.pathname === '/api/certificates' && req.method === 'GET') { const p = byToken(db, String(req.headers['x-token'] ?? '')); return send(res, 200, { certificates: myCertificates(db, p.id), profile: certProfile(p.id) }); }
    if (url.pathname === '/api/certificates/claim' && req.method === 'POST') { const p = byToken(db, String(req.headers['x-token'] ?? '')); return send(res, 200, { issued: claimAll(db, p.id, MEDIA_DIR), certificates: myCertificates(db, p.id) }); }
    if (url.pathname === '/api/exam/full' && req.method === 'POST') {
      const p = byToken(db, String(req.headers['x-token'] ?? '')); const b = await readJson(req);
      const r = composeFull(db, p.id, Number(b.startedAt), String(b.listeningId ?? ''), String(b.readingId ?? ''));
      const iss = issueFor(db, p.id, r.id, MEDIA_DIR);
      return send(res, 200, { resultId: r.id, overall: r.overall, skills: r.skills, certificates: iss.issued, certMissing: iss.missing });
    }
    if (url.pathname === '/api/profile/cert') {
      const p = byToken(db, String(req.headers['x-token'] ?? ''));
      if (req.method === 'GET') return send(res, 200, certProfile(p.id));
      if (req.method === 'PUT') { const b = await readJson(req); setFullName(db, p.id, b.fullName); return send(res, 200, certProfile(p.id)); }
    }
    if (url.pathname === '/api/profile/photo' && req.method === 'POST') {
      const p = byToken(db, String(req.headers['x-token'] ?? ''));
      savePhoto(db, p.id, await readRaw(req, PHOTO_MAX), MEDIA_DIR);
      return send(res, 200, certProfile(p.id));
    }
    if (url.pathname.startsWith('/api/certadmin/')) {
      const adm = requireRole(db, String(req.headers['x-token'] ?? ''), []); // faqat admin
      const sub = url.pathname.slice('/api/certadmin/'.length);
      if (sub === 'list' && req.method === 'GET') return send(res, 200, { certificates: searchCertificates(db, url.searchParams.get('q') ?? '') });
      if (sub === 'revoke' && req.method === 'POST') { const b = await readJson(req); return send(res, 200, revokeCertificate(db, adm.id, String(b.id ?? ''), String(b.reason ?? ''))); }
      if (sub === 'rules') { if (req.method === 'PUT') { const b = await readJson(req); setRule(db, adm.id, b as Parameters<typeof setRule>[2]); } return send(res, 200, { rules: certRules(db) }); }
      if (sub === 'settings') { if (req.method === 'PUT') { const b = await readJson(req); setCertSettings(db, adm.id, b); } return send(res, 200, certSettings(db)); }
      if (sub === 'audit' && req.method === 'GET') return send(res, 200, { audit: auditLog(db, Number(url.searchParams.get('limit') ?? 100) || 100) });
      return send(res, 404, { error: 'Topilmadi' });
    }
    if (req.method === 'POST' && url.pathname === '/api/xp') {
      const b = await readJson(req, 16_384);
      const tk = String(req.headers['x-token'] ?? '');
      const out = submitXp(db, tk, b.events, Date.now(), knownContent(db));
      maybeRewardReferral(db, byToken(db, tk).id); // taklif qilingan o'quvchi birinchi darsni bajargan bo'lsa — ikkalasiga XP
      return send(res, 200, out);
    }
    if (url.pathname === '/api/progress') {
      const token = String(req.headers['x-token'] ?? '');
      if (req.method === 'GET') return send(res, 200, getProgress(db, token));
      if (req.method === 'PUT') { const b = await readJson(req, PROGRESS_MAX + 4096); return send(res, 200, putProgress(db, token, b.data, Number(b.rev))); }
    }
    if (req.method === 'POST' && url.pathname === '/api/sync') {
      const b = await readJson(req);
      return send(res, 200, sync(db, String(b.token ?? ''), Number(b.xp), Number(b.streak)));
    }
    if (req.method === 'GET' && url.pathname === '/api/league') return send(res, 200, leagueView(db, byToken(db, String(req.headers['x-token'] ?? '')).id));
    if (req.method === 'GET' && url.pathname === '/api/leaderboard') {
      const period = url.searchParams.get('period') === 'all' ? 'all' : 'week';
      const token = req.headers['x-token'];
      return send(res, 200, leaderboard(db, period, typeof token === 'string' ? token : undefined));
    }
    if (req.method === 'POST' && url.pathname === '/api/duel/create') {
      const b = await readJson(req);
      return send(res, 200, createDuel(db, String(b.token ?? '')));
    }
    const dm = url.pathname.match(/^\/api\/duel\/([A-Za-z0-9]{4,8})(\/submit)?$/);
    if (dm && req.method === 'GET' && !dm[2]) {
      const token = req.headers['x-token'];
      return send(res, 200, getDuel(db, dm[1], typeof token === 'string' ? token : undefined));
    }
    if (dm && req.method === 'POST' && dm[2]) {
      const b = await readJson(req);
      return send(res, 200, submitDuel(db, String(b.token ?? ''), dm[1], Number(b.score), Number(b.correct), Number(b.ms)));
    }
    if (req.method === 'GET' && url.pathname === '/api/ai/status') return send(res, 200, { enabled: ai.provider !== 'none' && COACH_GLOBAL_DAILY > 0, provider: ai.provider, coach: ai.provider !== 'none' && COACH_GLOBAL_DAILY > 0, configured: ai.provider !== 'none', stt: !!stt, live: !!live && COACH_GLOBAL_DAILY > 0 });
    if (req.method === 'GET' && url.pathname === '/api/coach/minutes') {
      const tk = String(req.headers['x-token'] ?? ''); const pid = byToken(db, tk).id; const sub = entitlements(db, tk).plan !== null;
      return send(res, 200, { subscribed: sub, total: Math.round(CALL_MONTH_SECONDS / 60), left: Math.floor(callLeft(db, pid, sub) / 60) });
    }
    // Nutqni tanish: brauzer yozib olgan bitta navbat (ovoz) → matn. Ovoz saqlanmaydi.
    if (req.method === 'POST' && url.pathname === '/api/ai/stt') {
      if (!stt) throw new ApiError(503, 'Ovozli tanish sozlanmagan');
      const p = byToken(db, String(req.headers['x-token'] ?? ''));
      sttAllowed(db, stt, p.id);
      const audio = await readRaw(req, MAX_AUDIO + 1024);
      const xl = String(req.headers['x-lang'] ?? 'uz').slice(0, 2);
      const r = await transcribeLearner(stt, audio, String(req.headers['content-type'] ?? ''), NATIVE_STT_CODE[xl] ?? 'uzb', req.headers['x-expect'] === 'en' ? 'en' : 'any');
      const secs = r.seconds || audio.length / 4000; // so'z vaqti bo'lmasa — hajmdan taxmin
      recordStt(db, p.id, secs);
      console.log(`[stt] ${secs.toFixed(1)}s til=${r.lang ?? '?'}${r.forced ? ' (inglizcha qayta tanildi)' : ''} belgi=${r.text.length}`); // matnning o'zi yozilmaydi
      addCall(db, p.id, secs);
      recordAiCost(db, { playerId: p.id, feature: 'stt', provider: 'elevenlabs', model: stt.model, units: Math.round(secs), unitKind: 'seconds', costUsd: (secs / 3600) * stt.pricePerHour, estimated: true });
      return send(res, 200, { text: r.text, lang: r.lang });
    }
    if (req.method === 'POST' && url.pathname === '/api/ai/coach') {
      if (ai.provider === 'none') throw new AiError(503, 'AI ustoz hali ulanmagan');
      const b = await readJson(req, 16_384);
      const token = String(b.token ?? '');
      const player = byToken(db, token);
      const turnId = String(b.turnId ?? '').slice(0, 64);
      if (!/^[\w-]{8,64}$/.test(turnId)) throw new ApiError(400, 'turnId kerak');
      const mode = b.mode === 'exam' ? 'exam' : 'practice';
      const resolved = resolvePersona(String(b.persona ?? 'friendly'), { adult: b.adult === true, mode }); // adult = learner's self-declaration (OD-06b pending)
      const history = Array.isArray(b.history) ? b.history.slice(-MAX_HISTORY).map((t) => ({ role: (t as { role?: unknown }).role === 'coach' ? 'coach' as const : 'learner' as const, text: String((t as { text?: unknown }).text ?? '') })) : [];
      const text = String(b.text ?? '');
      const t0 = Date.now();
      const reply = await once(`${player.id}:${turnId}`, async () => {
        useGlobalAi(db, COACH_GLOBAL_DAILY);                       // platform ceiling first (fail-closed)
        useAi(db, token, Date.now(), COACH_DAILY_LIMIT, 'coach');  // per-learner daily limit
        return withAiCtx({ playerId: player.id, feature: 'coach' }, () => coachTurn(coachAi, resolved.id, history, text, { level: typeof b.level === 'string' ? b.level : null, mode, native: nativeOf(req.headers['x-lang']), adult: b.adult === true }));
      });
      console.log(`[coach] ${Date.now() - t0}ms ${resolved.id} adult=${b.adult === true}`); // javob matni yozilmaydi
      return send(res, 200, { ...reply, persona: resolved.id, notice: resolved.downgraded });
    }
    if (req.method === 'POST' && url.pathname.startsWith('/api/ai/')) {
      if (ai.provider === 'none') throw new AiError(503, 'AI yoqilmagan');
      const b = await readJson(req, 16_384);
      const token = String(b.token ?? '');
      const now = Date.now();
      if (url.pathname === '/api/ai/followup') {
        const player = byToken(db, token);
        useGlobalAi(db, COACH_GLOBAL_DAILY, now);   // platforma kunlik chegarasi (belgilanmagan bo'lsa — yopiq)
        useAi(db, token, now);                      // o'quvchining kunlik limiti
        try {
          const lv = Math.max(0, Math.min(3, Math.floor(Number(b.level) || 0)));
          const ctx = { playerId: player.id, feature: 'followup' };
          if (lv === 0) return send(res, 200, { question: await withAiCtx(ctx, () => followUp(ai, String(b.question ?? ''), String(b.answer ?? ''))), reaction: null });
          return send(res, 200, await withAiCtx(ctx, () => followUpPersona(ai, String(b.question ?? ''), String(b.answer ?? ''), lv as 1 | 2 | 3, undefined, nativeOf(req.headers['x-lang']))));
        } catch (e) { refundAi(db, player.id, '', now); refundGlobalAi(db, now); throw e; }
      }
      if (url.pathname === '/api/ai/speaking' || url.pathname === '/api/ai/writing') {
        const kind = url.pathname.endsWith('writing') ? 'writing' : 'speaking';
        // Kiritishni pul sarflashdan OLDIN tekshiramiz
        const turns = Array.isArray(b.turns) ? b.turns.slice(0, 12).map((t) => ({ q: String((t as { q?: unknown }).q ?? '').slice(0, 500), text: String((t as { text?: unknown }).text ?? '').slice(0, 3000) })) : [];
        const text = String(b.text ?? '').slice(0, 8000);
        if (kind === 'speaking' && !turns.some((t) => t.text.trim().length > 10)) throw new ApiError(400, 'Baholash uchun javoblar yetarli emas');
        if (kind === 'writing' && text.trim().split(/\s+/).length < 30) throw new ApiError(400, 'Matn juda qisqa (kamida 30 so‘z)');
        const q = useAssessment(db, token, kind, now);  // server obunasi + oylik kvota (EXAM 10, ALL 20)
        try { useGlobalAi(db, COACH_GLOBAL_DAILY, now); } catch (e) { refundAssessment(db, q.playerId, kind, now); throw e; }
        try {
          const nat = nativeOf(req.headers['x-lang']);
          const r = await withAiCtx({ playerId: q.playerId, feature: `${kind}_eval` }, () => (kind === 'speaking' ? evaluateSpeaking(ai, turns, undefined, nat) : evaluateWriting(ai, Number(b.task) === 1 ? 1 : 2, String(b.prompt ?? '').slice(0, 2000), text, undefined, nat)));
          // Server natijasi (to'liq imtihon va sertifikat uchun): band AI baholashdan, mijozdan emas
          const att = /^[\w:.-]{6,60}$/.test(String(b.attemptId ?? '')) ? String(b.attemptId) : randomUUID();
          const rec = recordResult(db, q.playerId, { module: 'ai', kind, testId: `ai-${kind}`, title: kind === 'writing' ? 'Writing' : 'Speaking', attemptKey: `ai:${kind}:${att}`, band: r.overall }, now);
          return send(res, 200, { ...r, quota: { used: q.used, limit: q.limit }, resultId: rec.result.id });
        } catch (e) { refundAssessment(db, q.playerId, kind, now); refundGlobalAi(db, now); throw e; }
      }
      return send(res, 404, { error: 'Topilmadi' });
    }
    if (req.method === 'GET' && url.pathname === '/api/tts/status') return send(res, 200, { enabled: tts.provider !== 'none', provider: tts.provider, voice: tts.provider === 'none' ? null : tts.voice, model: tts.model ?? null });
    if (req.method === 'POST' && url.pathname === '/api/tts') {
      if (tts.provider === 'none') throw new TtsError(503, 'Ovoz xizmati yoqilmagan');
      const b = await readJson(req, 2048);
      const text = cleanText(b.text);
      const token = String(b.token ?? '');
      const player = byToken(db, token);
      const opts = { rate: Number(b.rate) || 1, pitch: Number(b.pitch) || 0, emotion: isEmotion(b.emotion) ? b.emotion : undefined };
      const now = Date.now();
      // ElevenLabs: limit faqat yangi (xarajatli) javobga — kuniga VOICE_DAILY_ANSWERS ta + platforma kunlik belgilar chegarasi (OD-25).
      const paid = tts.provider === 'elevenlabs' && !isCached(tts, text, opts);
      const reserve = text.length + 16;
      // AI ustoz suhbati: obunachi oylik daqiqalari tugaguncha va xodimlar (admin, metodist — sinov uchun) kunlik chegarasiz;
      // obunasiz o'quvchining suhbat ovozi — alohida kunlik chegara (COACH_FREE_DAILY_ANSWERS), boshqa ovozli javoblar bilan aralashmaydi
      const isCoach = b.feature === 'coach';
      const contPart = Number.isInteger(b.part) && Number(b.part) >= 1 && Number(b.part) <= 8;
      const staffRole = roleOf(db, player.id);
      const coachCall = isCoach && paid && (staffRole === 'admin' || staffRole === 'methodologist' || callLeft(db, player.id, entitlements(db, token, now).plan !== null, now) > 0);
      const bucket = tts.provider === 'elevenlabs' ? (isCoach ? 'coachvoice' : 'voice') : 'tts';
      if (tts.provider !== 'elevenlabs') useAi(db, token, now, TTS_DAILY_LIMIT, 'tts');
      else if (paid && coachCall) useGlobalVoiceChars(db, tts.globalDailyChars ?? 0, reserve, now);
      else if (paid && isCoach && contPart) useGlobalVoiceChars(db, tts.globalDailyChars ?? 0, reserve, now); // javobning davomi — bitta javob bir marta sanaladi
      else if (paid) { useAi(db, token, now, isCoach ? COACH_FREE_DAILY_ANSWERS : VOICE_DAILY_ANSWERS, bucket); try { useGlobalVoiceChars(db, tts.globalDailyChars ?? 0, reserve, now); } catch (e) { refundAi(db, player.id, bucket, now); throw e; } }
      let out: Awaited<ReturnType<typeof synthesize>>;
      try { out = await synthesize(tts, text, opts); } catch (e) {
        if (paid) { if (!coachCall && !(isCoach && contPart)) refundAi(db, player.id, bucket, now); refundGlobalVoiceChars(db, reserve, now); }
        throw e;
      }
      const { audio, cached, chars } = out;
      if (b.feature === 'coach') addCall(db, player.id, ttsSeconds(chars || text.length), now);
      if (!cached) recordAiCost(db, { playerId: player.id, feature: b.feature === 'coach' ? 'tts_coach' : 'tts_feedback', provider: tts.provider, model: tts.model ?? tts.voice, units: chars, unitKind: 'chars', costUsd: estimateCostUsd(tts, chars) }, now);
      res.writeHead(200, { 'content-type': 'audio/mpeg', 'content-length': audio.length, 'cache-control': 'private, max-age=86400', 'x-cache': cached ? 'hit' : 'miss' });
      return void res.end(audio);
    }
    // ---------------- To'lov (Hamyon) ----------------
    if (req.method === 'GET' && url.pathname === '/api/pay/config') {
      return send(res, 200, { enabled: !!hapi, demo: DEMO, periods: PERIODS.map((p) => ({ days: p.days, label: p.label, note: p.note ?? null, prices: Object.fromEntries(PLAN_IDS.map((t) => [t, priceFor(t, p.days)])) })) });
    }
    if (req.method === 'GET' && url.pathname === '/api/me') { const tk = String(req.headers['x-token'] ?? ''); const e = entitlements(db, tk); const pid = byToken(db, tk).id; const xl = reqLang(req); if (/^(uz|en|ru|kk|ky|tg)$/.test(xl)) db.prepare('UPDATE players SET lang = ? WHERE id = ?').run(xl, pid); return send(res, 200, { ...e, ai: assessmentUsage(db, pid), role: roleOf(db, pid) }); }
    if (req.method === 'POST' && url.pathname === '/api/pay/create') {
      if (!hapi) throw new ApiError(503, 'To‘lov hali ulanmagan');
      const b = await readJson(req);
      return send(res, 200, await createPayment(db, hapi, String(b.token ?? ''), String(b.track ?? ''), Number(b.days)));
    }
    const ps = url.pathname.match(/^\/api\/pay\/(status|cancel)\/([a-f0-9]{8,40})$/);
    if (ps && req.method === (ps[1] === 'status' ? 'GET' : 'POST')) {
      const tok = String(req.headers['x-token'] ?? '');
      return send(res, 200, ps[1] === 'status' ? await statusFor(db, hapi, hcfg?.shopId ?? '', tok, ps[2]) : await cancelPayment(db, hapi, tok, ps[2]));
    }
    if (req.method === 'POST' && (url.pathname === '/api/pay/hamyon/prepare' || url.pathname === '/api/pay/hamyon/complete')) {
      if (!hcfg) throw new ApiError(503, 'To‘lov hali ulanmagan');
      const f = await readForm(req);
      if (!verifySign(hcfg, f)) { console.warn('Hamyon: imzo xato (order=%s)', f.order_id); return send(res, 403, { error: 'sign' }); }
      const p = findByCallback(db, f);
      if (url.pathname.endsWith('/prepare')) { if (p) markPrepared(db, p.id, f.payment_id); return send(res, 200, { result: 'ok' }); }
      if (!p) return send(res, 200, { result: 'ok' }); // qayta urinishni to'xtatish uchun 200
      const paid = f.status === 'paid';
      const amt = Math.round(Number(f.amount));
      console.log('Hamyon complete: order=%s status=%s amount=%s', p.id, f.status, f.amount);
      try { applyResult(db, p.id, paid ? 'paid' : 'cancel', { paidAmount: paid ? (Number.isFinite(amt) ? amt : -1) : undefined, reason: f.reason }); } catch (e) { console.error(e); return send(res, 500, { error: 'retry' }); }
      return send(res, 200, { result: 'ok' });
    }
    // Admin akkaunti (rol 'admin') ham metodist rolini bera oladi
    if (req.method === 'GET' && url.pathname === '/api/staff') { requireRole(db, String(req.headers['x-token'] ?? ''), ['admin']); return send(res, 200, { staff: staffList(db) }); }
    if (req.method === 'POST' && url.pathname === '/api/staff/role') {
      requireRole(db, String(req.headers['x-token'] ?? ''), ['admin']);
      const b = await readJson(req);
      // role: 'methodologist' | 'creator' | 'teacher' (true — eski mijozlar uchun metodist), false/null — olib tashlash; admin faqat ADMIN_NICKNAMES orqali
      const want = b.role === true ? 'methodologist' : typeof b.role === 'string' && ['methodologist', 'creator', 'teacher', 'sales'].includes(b.role) ? b.role as 'methodologist' | 'creator' | 'teacher' | 'sales' : null;
      return send(res, 200, setRole(db, String(b.nickname ?? ''), want));
    }
    // Lidlar: o'quvchi o'zi raqam qoldiradi (rozilik bilan); operator (rol: sales) va admin ro'yxatni ko'radi
    if (url.pathname === '/api/lead') {
      const p = byToken(db, String(req.headers['x-token'] ?? ''));
      if (req.method === 'GET') return send(res, 200, { has: hasLead(db, p.id), bot: botUsername });
      if (req.method === 'POST') { const b = await readJson(req); return send(res, 200, saveLead(db, p.id, { phone: b.phone, consent: b.consent, source: 'form', goal: b.goal, level: b.level, minutes: b.minutes })); }
    }
    if (req.method === 'GET' && url.pathname === '/api/staff/leads') { requireRole(db, String(req.headers['x-token'] ?? ''), ['sales']); return send(res, 200, { leads: listLeads(db, url.searchParams.get('status')) }); }
    if (req.method === 'POST' && url.pathname === '/api/staff/leads') {
      const me = requireRole(db, String(req.headers['x-token'] ?? ''), ['sales']);
      const b = await readJson(req);
      updateLead(db, Number(b.playerId), { status: b.status, note: b.note }, me.nickname);
      return send(res, 200, { ok: true });
    }
    // Admin kabineti (rol: admin): foydalanuvchi qidirish, to'lovlar, qo'lda obuna berish (har biri audit jurnalida)
    if (req.method === 'GET' && url.pathname === '/api/staff/users') { requireRole(db, String(req.headers['x-token'] ?? ''), []); return send(res, 200, { users: findUsers(db, url.searchParams.get('q') ?? '') }); }
    if (req.method === 'GET' && url.pathname === '/api/staff/payments') { requireRole(db, String(req.headers['x-token'] ?? ''), []); return send(res, 200, { payments: recent(db, 100) }); }
    if (req.method === 'POST' && url.pathname === '/api/staff/grant') {
      const me = requireRole(db, String(req.headers['x-token'] ?? ''), []);
      const b = await readJson(req);
      const until = grant(db, String(b.nickname ?? ''), String(b.track ?? ''), Number(b.days));
      audit(db, me.id, 'subscription.grant', String(b.nickname ?? ''), { track: b.track, days: b.days });
      return send(res, 200, { until });
    }
    if (url.pathname.startsWith('/api/admin/')) {
      if (!ADMIN_TOKEN || String(req.headers['x-admin'] ?? '') !== ADMIN_TOKEN) throw new ApiError(403, 'Taqiqlangan');
      if (req.method === 'GET' && url.pathname === '/api/admin/payments') return send(res, 200, { payments: recent(db, 100) });
      if (req.method === 'GET' && url.pathname === '/api/admin/ai-costs') return send(res, 200, aiCostSummary(db, Number(url.searchParams.get('days') ?? 30) || 30));
      if (req.method === 'POST' && url.pathname === '/api/admin/role') { const b = await readJson(req); audit(db, null, 'role.set', String(b.nickname ?? ''), { role: b.role ?? null }); return send(res, 200, setRole(db, String(b.nickname ?? ''), b.role === null || b.role === '' ? null : String(b.role) as 'admin' | 'methodologist')); }
      if (req.method === 'POST' && url.pathname === '/api/admin/grant') { const b = await readJson(req); const until = grant(db, String(b.nickname ?? ''), String(b.track ?? ''), Number(b.days)); audit(db, null, 'subscription.grant', String(b.nickname ?? ''), { track: b.track, days: b.days }); return send(res, 200, { until }); }
    }
    if (req.method === 'GET' && url.pathname.startsWith('/media/')) {
      const file = url.pathname.slice('/media/'.length);
      if (!/^[\w.-]+$/.test(file) || !existsSync(`${MEDIA_DIR}/${file}`)) return send(res, 404, { error: 'Topilmadi' });
      const full = `${MEDIA_DIR}/${file}`; const size = statSync(full).size;
      const type = ({ mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', m4a: 'audio/mp4', mp3: 'audio/mpeg', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as Record<string, string>)[file.split('.').pop()!] ?? 'application/octet-stream';
      const m = String(req.headers.range ?? '').match(/bytes=(\d+)-(\d*)/);
      if (m) {
        const start = Number(m[1]); const end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
        if (start >= size) { res.writeHead(416, { 'content-range': `bytes */${size}` }); return res.end(); }
        res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${start}-${end}/${size}`, 'accept-ranges': 'bytes', 'content-length': end - start + 1, 'cache-control': 'public, max-age=86400' });
        return createReadStream(full, { start, end }).pipe(res);
      }
      res.writeHead(200, { 'content-type': type, 'content-length': size, 'accept-ranges': 'bytes', 'cache-control': 'public, max-age=86400' });
      return createReadStream(full).pipe(res);
    }
    if (url.pathname === '/api/health') return send(res, 200, { ok: true });
    if (!url.pathname.startsWith('/api/') && serveStatic(req, res, DIST)) return;
    return send(res, 404, { error: 'Topilmadi' });
  } catch (e) {
    if (e instanceof ApiError || e instanceof AiError || e instanceof TtsError) return send(res, e.status, { error: trServer(db, reqLang(req), e.message) });
    console.error(e);
    return send(res, 500, { error: 'Server xatosi' });
  }
});
// Matn AI xarajati: har javobdagi haqiqiy token soni × narx (AI_PRICE_IN_PER_M / AI_PRICE_OUT_PER_M)
setUsageSink((ctx, provider, model, u) => { const p = textPrice(); recordAiCost(db, { playerId: ctx.playerId, feature: ctx.feature, provider, model, units: u.inTok + u.outTok, unitKind: 'tokens', costUsd: textCost(u, p), estimated: p.estimated }); });
// Bot xush kelibsiz rasmi: birinchi marta fayl sifatida yuklanadi (URL orqali Telegram yuklay olmagan edi), keyin file_id qayta ishlatiladi
const BOT_STATS = { lessons: STATIC_UNITS.reduce((s, u) => s + u.lessons.length, 0), ielts: IELTS_UNITS.reduce((s, u) => s + u.lessons.length, 0), mocks: listeningTests.length + readingTests.length };
async function sendWelcomePhoto(token: string, msg: Record<string, unknown>): Promise<unknown> {
  db.exec('CREATE TABLE IF NOT EXISTS bot_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  const file = new URL('../public/brand/bot-welcome.jpg', import.meta.url).pathname;
  const bytes = readFileSync(file);
  const key = `bot-welcome:${token.split(':')[0]}:${createHash('sha256').update(bytes).digest('hex').slice(0, 12)}`;
  const cached = (db.prepare('SELECT value FROM bot_meta WHERE key = ?').get(key) as { value: string } | undefined)?.value;
  if (cached) return tgApi(token, 'sendPhoto', { ...msg, photo: cached });
  const { photo: _url, ...fields } = msg; void _url; // fayl "photo" maydonining o'ziga yuklanadi (multipart)
  const r = await tgUpload<{ photo?: { file_id: string }[] }>(token, 'sendPhoto', fields, { field: 'photo', bytes, name: 'welcome.jpg', type: 'image/jpeg' });
  const id = r.photo?.[r.photo.length - 1]?.file_id;
  if (id) db.prepare('INSERT INTO bot_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, id);
  return r;
}

if (live) attachLive(httpServer, {
  db, cfg: live,
  auth: (token) => {
    try {
      const p = byToken(db, token);
      const role = roleOf(db, p.id);
      return { id: p.id, staff: role === 'admin' || role === 'methodologist', subscriberLeftSec: callLeft(db, p.id, entitlements(db, token).plan !== null) };
    } catch { return null; }
  },
  prompt: (o) => buildLivePrompt(o),
  native: (lang) => nativeOf(lang),
  // Birinchi qo'ng'iroq — server bo'yicha (boshqa qurilmada ham to'g'ri); xotira — o'tgan qo'ng'iroqlardagi xatolar
  context: (pid) => ({ firstCall: !db.prepare('SELECT 1 FROM live_usage WHERE player_id = ? LIMIT 1').get(pid), memory: memoryForPrompt(getMemory(db, pid)) }),
  kickoff: liveKickoff,
  onTranscript: (pid, turns, lang) => {
    if (ai.provider === 'none') return;
    const q = summaryPrompt(turns, nativeOf(lang));
    void withAiCtx({ playerId: pid, feature: 'live-memory' }, () => complete(ai, q.system, q.user, { maxTokens: 400, timeoutMs: 20_000 })).then((raw) => {
      const add = parseSummary(raw);
      if (add.mistakes.length || add.topics.length) saveMemory(db, pid, mergeMemory(getMemory(db, pid), add));
    }).catch((e) => console.warn('[live] xotira yozilmadi:', (e as Error).message));
  },
  onEnd: (pid, secs, model, usage) => {
    recordLive(db, pid, secs); addCall(db, pid, secs);
    // Gemini qaytargan haqiqiy tokenlar bo'yicha (audio/matn alohida narx); tokenlar kelmagan bo'lsa — daqiqa narxi bilan taxmin
    const tok = usage ? usage.textIn + usage.audioIn + usage.textOut + usage.audioOut : 0;
    const lp = livePrice();
    if (tok > 0) recordAiCost(db, { playerId: pid, feature: 'live', provider: 'gemini', model, units: tok, unitKind: 'tokens', costUsd: liveCost(usage!, lp), estimated: lp.estimated });
    else recordAiCost(db, { playerId: pid, feature: 'live', provider: 'gemini', model, units: Math.round(secs), unitKind: 'seconds', costUsd: (secs / 60) * live.pricePerMin, estimated: true });
  },
});
httpServer.listen(PORT, HOST, () => console.log(`Sellzen: http://${HOST}:${PORT} (AI: ${ai.provider}${ai.backup ? ` + zaxira ${ai.backup.provider}` : ''}${aiOffReason() ? ` — ${aiOffReason()}` : ''}, TTS: ${tts.provider}, Telegram: ${bot ? 'bor' : 'yo‘q'}, To‘lov: ${hapi ? 'Hamyon' : 'yo‘q (demo)'}, Live: ${live ? `${live.model}/${live.voice}` : 'yo‘q'})`));

// Yo'qolgan callbacklar uchun xavfsizlik to'ri: har 90 soniyada ochiq to'lovlar Hamyondan tekshiriladi
// Seriya eslatmalari (Telegram): TG_REMINDERS=1 bo'lsa, har 10 daqiqada tekshiradi (20:00–23:00 Toshkent)
if (bot?.publicUrl && process.env.TG_REMINDERS === '1') setInterval(() => { runLeagueNotices(db, (b) => tgApi(bot.token, 'sendMessage', b).then(() => undefined), appUrl(bot.publicUrl!, '/league'), Date.now(), (lang, t) => trServer(db, lang ?? undefined, t)).then((n) => { if (n) console.log('Liga natijasi yuborildi: %s ta', n); }).catch((e) => console.warn('liga xabari xato', (e as Error).message)); }, 10 * 60_000);
if (bot?.publicUrl && process.env.TG_REMINDERS === '1') setInterval(() => { runReminders(db, (b) => tgApi(bot.token, 'sendMessage', b).then(() => undefined), appUrl(bot.publicUrl!, '/learn'), Date.now(), (lang, t) => trServer(db, lang ?? undefined, t)).then((n) => { if (n) console.log('Eslatma yuborildi: %s ta', n); }).catch((e) => console.warn('eslatma xato', (e as Error).message)); }, 10 * 60_000);
if (hapi && hcfg) setInterval(() => { reconcile(db, hapi, hcfg.shopId).then((n) => { if (n) console.log('Hamyon reconcile: %s ta to‘lov yakunlandi', n); }).catch((e) => console.warn('reconcile xato', e)); }, 90_000);

// Railway yangi versiyani ishga tushirganda eskisiga SIGTERM yuboradi: so'rovlarni tugatib, bazani yopib, toza chiqamiz
for (const sig of ['SIGTERM', 'SIGINT'] as const) {
  process.on(sig, () => {
    httpServer.close(() => { try { db.close(); } catch { /* allaqachon yopilgan */ } process.exit(0); });
    setTimeout(() => process.exit(0), 8000).unref();
  });
}
