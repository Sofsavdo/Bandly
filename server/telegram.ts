// Telegram orqali kirish (AUTH_SECURITY_SPEC.md §4.2) va bot (Mini App ochish tugmalari).
// Ikki yo'l, ikkalasi ham serverda tekshiriladi:
//  - Login Widget (saytda): secret = SHA256(bot_token); hash = HMAC_SHA256(data_check_string, secret).
//  - Mini App initData (Telegram ichida): secret = HMAC_SHA256(key "WebAppData", bot_token); hash = HMAC_SHA256(data_check_string, secret).
// data_check_string = "hash" dan boshqa barcha maydonlar, kalit bo'yicha saralangan, "key=value", "\n" bilan.
// Bot tokeni faqat server muhit o'zgaruvchisida (TELEGRAM_BOT_TOKEN); kodga yoki logga yozilmaydi.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export interface TgUser { id: number; first_name?: string; last_name?: string; username?: string; language_code?: string }
export type Tr = (s: string) => string;
const same: Tr = (s) => s;
export const WIDGET_MAX_AGE_S = 300; // spec: 5 daqiqa
export const WEBAPP_MAX_AGE_S = 3600; // Mini App ochilgandan keyin 1 soat (ilova fonda turib qayta yuklanishi mumkin)

const dataCheckString = (fields: Record<string, string>, exclude: string[]): string =>
  Object.keys(fields).filter((k) => !exclude.includes(k)).sort().map((k) => `${k}=${fields[k]}`).join('\n');
const sameHex = (a: string, b: string): boolean => {
  if (!/^[0-9a-f]{64}$/i.test(a) || !/^[0-9a-f]{64}$/i.test(b)) return false;
  return timingSafeEqual(Buffer.from(a.toLowerCase(), 'hex'), Buffer.from(b.toLowerCase(), 'hex'));
};

export class TgAuthError extends Error {}

function fresh(authDate: string | undefined, maxAge: number, nowS: number): void {
  const t = Number(authDate);
  if (!Number.isFinite(t) || t <= 0) throw new TgAuthError('auth_date yo‘q');
  if (nowS - t > maxAge) throw new TgAuthError('Kirish ma’lumoti eskirgan — qaytadan urinib ko‘ring');
  if (t - nowS > 60) throw new TgAuthError('auth_date kelajakda');
}
function parseUser(u: Partial<Record<keyof TgUser, unknown>>): TgUser {
  const id = Number(u.id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new TgAuthError('Telegram foydalanuvchi id noto‘g‘ri');
  const s = (v: unknown) => (typeof v === 'string' && v ? v.slice(0, 64) : undefined);
  return { id, first_name: s(u.first_name), last_name: s(u.last_name), username: s(u.username) };
}

/** Login Widget ma'lumoti (id, first_name, …, auth_date, hash). */
export function verifyWidget(raw: Record<string, unknown>, botToken: string, nowS = Math.floor(Date.now() / 1000)): TgUser {
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) if (v !== undefined && v !== null && /^[a-z_]{1,32}$/.test(k)) fields[k] = String(v);
  const hash = fields.hash ?? '';
  const secret = createHash('sha256').update(botToken).digest();
  const calc = createHmac('sha256', secret).update(dataCheckString(fields, ['hash'])).digest('hex');
  if (!sameHex(calc, hash)) throw new TgAuthError('Telegram imzosi noto‘g‘ri');
  fresh(fields.auth_date, WIDGET_MAX_AGE_S, nowS);
  return parseUser(fields);
}

/** Mini App initData (URL-encoded satr). */
export function verifyInitData(initData: string, botToken: string, nowS = Math.floor(Date.now() / 1000)): TgUser {
  if (typeof initData !== 'string' || initData.length > 4096) throw new TgAuthError('initData noto‘g‘ri');
  const params = new URLSearchParams(initData);
  const fields: Record<string, string> = {};
  for (const [k, v] of params) fields[k] = v;
  const hash = fields.hash ?? '';
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  // Asosiy sxema: faqat "hash" chiqariladi. Ehtiyot uchun "signature"siz variant ham qabul qilinadi (ikkalasi ham bot tokeni bilan imzolangan).
  const ok = [['hash'], ['hash', 'signature']].some((ex) => sameHex(createHmac('sha256', secret).update(dataCheckString(fields, ex)).digest('hex'), hash));
  if (!ok) throw new TgAuthError('Telegram imzosi noto‘g‘ri');
  fresh(fields.auth_date, WEBAPP_MAX_AGE_S, nowS);
  let user: unknown;
  try { user = JSON.parse(fields.user ?? 'null'); } catch { throw new TgAuthError('user maydoni noto‘g‘ri'); }
  if (!user || typeof user !== 'object') throw new TgAuthError('user maydoni yo‘q');
  return parseUser(user as Record<string, unknown>);
}

/** Telegram ismidan reyting uchun laqab (2–20 belgi). */
export function nickFrom(u: TgUser): string {
  const base = (u.username || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Talaba').replace(/[^\p{L}\p{N}_.\- ]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 16);
  return base.length >= 2 ? base : `Talaba${String(u.id).slice(-4)}`;
}

// ---------------- Bot (webhook) ----------------
/** Webhook maxfiy sarlavhasi tokenning o'zidan hosil qilinadi — alohida o'zgaruvchi kerak emas. */
export const webhookSecret = (botToken: string): string => createHmac('sha256', 'bandly-webhook').update(botToken).digest('hex').slice(0, 48);

export interface BotConfig { token: string; username: string | null; publicUrl: string | null }
export function botFromEnv(env: NodeJS.ProcessEnv = process.env): BotConfig | null {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token || !/^\d{5,}:[\w-]{20,}$/.test(token)) return null;
  const pub = env.PUBLIC_URL?.trim() || (env.RAILWAY_PUBLIC_DOMAIN ? `https://${env.RAILWAY_PUBLIC_DOMAIN}` : '');
  return { token, username: env.TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, '') || null, publicUrl: pub ? pub.replace(/\/$/, '') : null };
}

type Fetch = typeof fetch;
export async function tgApi<T = unknown>(token: string, method: string, body: unknown, f: Fetch = fetch): Promise<T> {
  const r = await f(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = (await r.json().catch(() => ({}))) as { ok?: boolean; result?: T; description?: string };
  if (!j.ok) throw new Error(`Telegram ${method}: ${j.description ?? r.status}`);
  return j.result as T;
}

/** Mini App havolasi: ?tg=1 Telegram rejimini yoqadi, r= — ochiladigan sahifa. */
export const appUrl = (publicUrl: string, route = '/', ref?: string): string => `${publicUrl}/?tg=1&r=${encodeURIComponent(route)}${ref ? `&ref=${encodeURIComponent(ref)}` : ''}`;

/** /start va boshqa xabarlarga javob: Mini App tugmalari. */
export function startReply(chatId: number, publicUrl: string, firstName?: string, tr: Tr = same, ref?: string): Record<string, unknown> {
  const hi = firstName ? tr('Salom, {0}!').replace('{0}', firstName.slice(0, 32)) : tr('Salom!');
  return {
    chat_id: chatId,
    text: `${hi} ${tr('Sellzen — ingliz tili darslari, IELTS / CEFR / SAT tayyorgarligi va bepul mock testlar.')}\n\n${tr('Quyidagi tugma bilan ilovani shu yerning o‘zida oching. Hisobingiz Telegram orqali avtomatik ulanadi.')}`,
    reply_markup: { inline_keyboard: [
      [{ text: `📚 ${tr('Sellzen’ni ochish')}`, web_app: { url: appUrl(publicUrl, '/', ref) } }],
      [{ text: `⏱ ${tr('Bepul mock test')}`, web_app: { url: appUrl(publicUrl, '/mocks', ref) } }, { text: `🎯 ${tr('Darajamni aniqlash')}`, web_app: { url: appUrl(publicUrl, '/placement', ref) } }],
    ] },
  };
}

/** Ishga tushganda: bot username'ini oladi (saytda Telegram orqali kirish shunga bog'liq), keyin webhook, menyu va profilni
 *  o'rnatadi. Webhook/menyu xatosi username'ni yo'qotmaydi: 2026-11-21 da Telegram tomonida bir martalik DNS xatosi
 *  ("bad webhook: Failed to resolve host") butun setupBot'ni yiqitib, saytda kirishni o'chirib qo'ygan edi.
 *  onUsername — getMe muvaffaqiyatli bo'lishi bilan chaqiriladi; webhook xato bo'lsa retries marta (delayMs oralig'ida) qayta urinadi. */
export async function setupBot(cfg: BotConfig, f: Fetch = fetch, opts: { onUsername?: (u: string) => void; retries?: number; delayMs?: number } = {}): Promise<string | null> {
  const me = await tgApi<{ username: string }>(cfg.token, 'getMe', {}, f);
  opts.onUsername?.(me.username);
  if (cfg.publicUrl) {
    const retries = opts.retries ?? 5, delay = opts.delayMs ?? 60_000;
    for (let i = 0; ; i++) {
      try {
        await tgApi(cfg.token, 'setWebhook', { url: `${cfg.publicUrl}/api/telegram/webhook`, secret_token: webhookSecret(cfg.token), allowed_updates: ['message'], drop_pending_updates: true }, f);
        break;
      } catch (e) {
        if (i >= retries) { console.error('Telegram webhook o‘rnatilmadi (oldingi webhook amal qilishda davom etishi mumkin):', (e as Error).message); break; }
        console.error(`Telegram webhook: ${(e as Error).message} — ${Math.round(delay / 1000)} s dan keyin qayta urinish (${i + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    try {
      await tgApi(cfg.token, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'Sellzen', web_app: { url: appUrl(cfg.publicUrl, '/') } } }, f);
      await tgApi(cfg.token, 'setMyCommands', { commands: [{ command: 'start', description: 'Sellzen ilovasini ochish' }, { command: 'mock', description: 'Bepul mock test' }, { command: 'stop', description: 'Seriya eslatmalarini o‘chirish' }, { command: 'remind', description: 'Seriya eslatmalarini yoqish' }] }, f);
    } catch (e) { console.error('Telegram menyu/buyruqlar:', (e as Error).message); }
  }
  await syncBotProfile(cfg.token, f);
  return me.username;
}

/** Botning foydalanuvchiga ko'rinadigan nomi va tavsifi (rebrend: username @Bandly_robot BotFather'da o'zgarmaydi, lekin
 *  ko'rinadigan nom "Sellzen" bo'ladi). Faqat farq qilsa yoziladi — setMyName/setMyDescription Telegram'da qattiq cheklangan. */
export const BOT_PROFILE = {
  name: 'Sellzen — ingliz tili va IELTS',
  short: 'Ingliz tili, IELTS, CEFR va SAT — AI ustoz bilan. Bepul daraja testi va mock testlar.',
  description: 'Sellzen — o‘zbek tilida tushuntiradigan AI ustoz bilan ingliz tilini A1 dan C2 gacha o‘rganing, IELTS, CEFR (Multilevel) va SAT’ga tayyorlaning. Bepul daraja testi, mock testlar va duellar. Boshlash uchun /start bosing.',
} as const;
export async function syncBotProfile(token: string, f: Fetch = fetch): Promise<string[]> {
  const done: string[] = [];
  const steps: [get: string, field: string, set: string, value: string, key: string][] = [
    ['getMyName', 'name', 'setMyName', BOT_PROFILE.name, 'name'],
    ['getMyShortDescription', 'short_description', 'setMyShortDescription', BOT_PROFILE.short, 'short_description'],
    ['getMyDescription', 'description', 'setMyDescription', BOT_PROFILE.description, 'description'],
  ];
  for (const [get, field, set, value, key] of steps) {
    try {
      const cur = await tgApi<Record<string, string>>(token, get, {}, f);
      if ((cur?.[field] ?? '') !== value) { await tgApi(token, set, { [key]: value }, f); done.push(set); }
    } catch (e) { console.error('Telegram bot profili:', (e as Error).message); } // sayt ishlashiga ta'sir qilmaydi
  }
  return done;
}

/** Webhook yangilanishi → yuboriladigan javob (yoki null). Faqat shaxsiy chatlarga javob beriladi. */
export function handleUpdate(update: unknown, publicUrl: string, trFor: (lang?: string) => Tr = () => same): { method: string; body: Record<string, unknown> } | null {
  const msg = (update as { message?: { chat?: { id?: number; type?: string }; from?: TgUser; text?: string } })?.message;
  if (!msg?.chat?.id || msg.chat.type !== 'private') return null;
  const text = (msg.text ?? '').trim();
  const tr = trFor(msg.from?.language_code);
  if (/^\/mock\b/.test(text)) {
    return { method: 'sendMessage', body: { chat_id: msg.chat.id, text: tr('Bepul mock testlar: Listening va Reading, imtihon taymeri va avtomatik baho bilan.'), reply_markup: { inline_keyboard: [[{ text: `⏱ ${tr('Mock testni ochish')}`, web_app: { url: appUrl(publicUrl, '/mocks') } }]] } } };
  }
  // t.me/bot?start=phone — o'quvchi raqamini ulashadi (Telegram tasdiqlagan raqam; tugma faqat o'z kontaktini yuboradi)
  if (/^\/start\s+phone\b/.test(text)) {
    return { method: 'sendMessage', body: { chat_id: msg.chat.id, text: tr('Mutaxassisimiz rejangizni tushuntirib berishi uchun raqamingizni ulashing (ixtiyoriy).'), reply_markup: { keyboard: [[{ text: `📱 ${tr('Raqamni ulashish')}`, request_contact: true }]], resize_keyboard: true, one_time_keyboard: true } } };
  }
  const ref = text.match(/^\/start\s+ref_([a-z2-9]{6,10})\b/)?.[1]; // t.me/bot?start=ref_KOD
  return { method: 'sendMessage', body: startReply(msg.chat.id, publicUrl, msg.from?.first_name, tr, ref) };
}
