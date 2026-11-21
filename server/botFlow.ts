// Sellzen bot (@Sellzenbot) oqimi: /start → @Sellzen_AI kanaliga majburiy obuna (getChatMember bilan tekshiriladi) →
// Telegram kontakti (raqamni Telegram tasdiqlaydi, faqat o'z kontakti) → xush kelibsiz xabari va ilova tugmalari.
// Telegram API chaqiruvlari va ma'lumotlar bazasi deps orqali beriladi (test uchun soxta qilib bo'ladi).
import { appUrl, type Tr } from './telegram';

export const CHANNEL = (process.env.TG_REQUIRED_CHANNEL ?? '@Sellzen_AI').trim();
export const channelUrl = (ch = CHANNEL): string => `https://t.me/${ch.replace(/^@/, '')}`;

export interface BotDeps {
  api: (method: string, body: Record<string, unknown>) => Promise<unknown>;
  publicUrl: string;
  tr: (lang?: string) => Tr;
  /** Kanal a'zoligi (getChatMember). Tekshirib bo'lmasa (bot admin emas, tarmoq) — true: foydalanuvchini to'sib qo'ymaymiz. */
  isMember: (tgId: number) => Promise<boolean>;
  hasPhone: (tgId: number) => boolean;
  savePhone: (tgId: number, phone: string) => void;
  setRef: (tgId: number, ref: string) => void;
  getRef: (tgId: number) => string | undefined;
  setRemind: (tgId: number, on: boolean) => boolean;
  channel?: string;
}

interface TgFrom { id: number; first_name?: string; language_code?: string }
interface TgMsg { message_id?: number; chat: { id: number; type?: string }; from?: TgFrom; text?: string; contact?: { phone_number?: string; user_id?: number } }
interface TgCallback { id: string; from: TgFrom; data?: string; message?: TgMsg }

const lc = (f?: TgFrom) => (f?.language_code ?? '').split('-')[0] || undefined;

/** Kanal a'zoligi statuslari (getChatMember natijasi). */
export const MEMBER_OK = new Set(['creator', 'administrator', 'member', 'restricted']);
export async function checkMember(api: BotDeps['api'], channel: string, tgId: number): Promise<boolean> {
  try {
    const m = await api('getChatMember', { chat_id: channel, user_id: tgId }) as { status?: string; is_member?: boolean };
    return MEMBER_OK.has(String(m?.status)) && (m.status !== 'restricted' || m.is_member !== false);
  } catch (e) {
    console.error('[bot] kanal a’zoligini tekshirib bo‘lmadi (bot kanalda admin ekanini tekshiring):', (e as Error).message);
    return true;
  }
}

export function subscribeMsg(chatId: number, tr: Tr, channel: string): Record<string, unknown> {
  return {
    chat_id: chatId,
    text: `${tr('Davom etish uchun Sellzen kanaliga obuna bo‘ling — u yerda foydali darslar, IELTS maslahatlari va yangiliklar.')}\n\n${tr('Obuna bo‘lgach, «Tekshirish» tugmasini bosing.')}`,
    reply_markup: { inline_keyboard: [[{ text: `📢 ${tr('Kanalga obuna bo‘lish')}`, url: channelUrl(channel) }], [{ text: `✅ ${tr('Tekshirish')}`, callback_data: 'chk' }]] },
  };
}

export function phoneMsg(chatId: number, tr: Tr): Record<string, unknown> {
  return {
    chat_id: chatId,
    text: `${tr('Oxirgi qadam: telefon raqamingizni ulashing. Hisobingizni himoyalash va kerak bo‘lsa mutaxassisimiz bog‘lanishi uchun.')}\n\n${tr('Pastdagi «Raqamni ulashish» tugmasini bosing.')}`,
    reply_markup: { keyboard: [[{ text: `📱 ${tr('Raqamni ulashish')}`, request_contact: true }]], resize_keyboard: true, one_time_keyboard: true },
  };
}

export function welcomeMsg(chatId: number, publicUrl: string, tr: Tr, name?: string, ref?: string, channel = CHANNEL): Record<string, unknown> {
  const hi = name ? tr('Salom, {0}!').replace('{0}', name.slice(0, 32)) : tr('Salom!');
  const app = (route: string) => ({ url: appUrl(publicUrl, route, ref) });
  return {
    chat_id: chatId,
    photo: `${publicUrl}/brand/og-image.png`,
    caption: [
      `👋 ${hi}`,
      tr('Sellzen — ingliz tilini o‘zbek tilida tushuntiradigan AI ustoz bilan o‘rganing.'),
      '',
      `📚 ${tr('A1–C2 darslar va grammatika')}`,
      `🎙 ${tr('AI ustoz bilan ovozli suhbat')}`,
      `⏱ ${tr('Bepul IELTS mock testlar')}`,
      `🎮 ${tr('So‘z o‘yinlari va duellar')}`,
      '',
      tr('Pastdagi tugmani bosing — ilova shu yerning o‘zida ochiladi.'),
    ].join('\n'),
    reply_markup: { inline_keyboard: [
      [{ text: `🚀 ${tr('Sellzen’ni ochish')}`, web_app: app('/') }],
      [{ text: `🎯 ${tr('Darajamni aniqlash')}`, web_app: app('/placement') }, { text: `⏱ ${tr('Mock test')}`, web_app: app('/mocks') }],
      [{ text: `🎙 ${tr('AI ustoz')}`, web_app: app('/coach') }, { text: `🎮 ${tr('O‘yinlar')}`, web_app: app('/games') }],
      [{ text: `📢 ${tr('Kanal')}`, url: channelUrl(channel) }, { text: `💬 ${tr('Yordam')}`, callback_data: 'help' }],
    ] },
  };
}

export function helpMsg(chatId: number, tr: Tr): Record<string, unknown> {
  return {
    chat_id: chatId,
    text: [
      tr('Buyruqlar:'),
      `/start — ${tr('boshlash')}`, `/app — ${tr('ilovani ochish')}`, `/level — ${tr('darajani aniqlash')}`, `/mock — ${tr('bepul mock test')}`, `/coach — ${tr('AI ustoz')}`,
      `/remind — ${tr('kunlik eslatmani yoqish')}`, `/stop — ${tr('eslatmani o‘chirish')}`,
      '', tr('Savol bo‘lsa, shu yerga yozing — jamoamiz javob beradi.'),
    ].join('\n'),
  };
}

const ROUTES: Record<string, string> = { app: '/', level: '/placement', mock: '/mocks', coach: '/coach', games: '/games' };

/** Obuna va telefon bosqichidan o'tganini tekshiradi; o'tmagan bo'lsa — keyingi bosqich xabarini yuboradi. */
async function gate(d: BotDeps, chatId: number, from: TgFrom, tr: Tr): Promise<boolean> {
  const ch = d.channel ?? CHANNEL;
  if (!(await d.isMember(from.id))) { await d.api('sendMessage', subscribeMsg(chatId, tr, ch)); return false; }
  if (!d.hasPhone(from.id)) { await d.api('sendMessage', phoneMsg(chatId, tr)); return false; }
  return true;
}
const welcome = (d: BotDeps, chatId: number, from: TgFrom, tr: Tr) => d.api('sendPhoto', welcomeMsg(chatId, d.publicUrl, tr, from.first_name, d.getRef(from.id), d.channel ?? CHANNEL));

/** Bitta webhook yangilanishini qayta ishlaydi (javoblar API orqali yuboriladi). */
export async function handleBot(update: unknown, d: BotDeps): Promise<void> {
  const u = update as { message?: TgMsg; callback_query?: TgCallback };
  if (u.callback_query) {
    const q = u.callback_query; const tr = d.tr(lc(q.from)); const chatId = q.message?.chat.id ?? q.from.id;
    if (q.data === 'chk') {
      if (!(await d.isMember(q.from.id))) { await d.api('answerCallbackQuery', { callback_query_id: q.id, text: tr('Hali obuna bo‘lmadingiz. Kanalga obuna bo‘lib, qayta bosing.'), show_alert: true }); return; }
      await d.api('answerCallbackQuery', { callback_query_id: q.id, text: tr('Rahmat! Obuna tasdiqlandi.') });
      if (q.message?.message_id) await d.api('deleteMessage', { chat_id: chatId, message_id: q.message.message_id }).catch(() => undefined);
      if (!d.hasPhone(q.from.id)) { await d.api('sendMessage', phoneMsg(chatId, tr)); return; }
      await welcome(d, chatId, q.from, tr); return;
    }
    if (q.data === 'help') { await d.api('answerCallbackQuery', { callback_query_id: q.id }); await d.api('sendMessage', helpMsg(chatId, tr)); return; }
    await d.api('answerCallbackQuery', { callback_query_id: q.id });
    return;
  }
  const m = u.message;
  if (!m?.chat?.id || m.chat.type !== 'private' || !m.from?.id) return;
  const tr = d.tr(lc(m.from)); const chatId = m.chat.id; const from = m.from;
  if (m.contact) {
    if (Number(m.contact.user_id) !== from.id) { await d.api('sendMessage', { ...phoneMsg(chatId, tr), text: tr('Iltimos, o‘zingizning raqamingizni «Raqamni ulashish» tugmasi orqali yuboring.') }); return; }
    const raw = String(m.contact.phone_number ?? '');
    d.savePhone(from.id, raw.startsWith('+') ? raw : `+${raw}`);
    await d.api('sendMessage', { chat_id: chatId, text: `✅ ${tr('Raqam saqlandi. Rahmat!')}`, reply_markup: { remove_keyboard: true } });
    if (await d.isMember(from.id)) await welcome(d, chatId, from, tr); else await d.api('sendMessage', subscribeMsg(chatId, tr, d.channel ?? CHANNEL));
    return;
  }
  const text = (m.text ?? '').trim();
  const cmd = text.match(/^\/([a-z]+)(?:@\w+)?(?:\s+(\S+))?/i);
  const name = cmd?.[1]?.toLowerCase();
  if (name === 'stop' || name === 'remind') {
    const on = name === 'remind'; const ok = d.setRemind(from.id, on);
    await d.api('sendMessage', { chat_id: chatId, text: !ok ? tr('Avval Sellzen’ni bot orqali oching — hisobingiz ulangach eslatmalar ishlaydi.') : on ? tr('Kunlik eslatmalar yoqildi. O‘chirish: /stop') : tr('Eslatmalar o‘chirildi. Yoqish: /remind') });
    return;
  }
  if (name === 'help') { await d.api('sendMessage', helpMsg(chatId, tr)); return; }
  if (name === 'start') { const ref = cmd?.[2]?.match(/^ref_([a-z2-9]{6,10})$/)?.[1]; if (ref) d.setRef(from.id, ref); }
  if (!(await gate(d, chatId, from, tr))) return;
  if (name && ROUTES[name] && name !== 'app') {
    const route = ROUTES[name]!;
    await d.api('sendMessage', { chat_id: chatId, text: tr('Ochish uchun bosing:'), reply_markup: { inline_keyboard: [[{ text: `▶️ ${tr('Ochish')}`, web_app: { url: appUrl(d.publicUrl, route, d.getRef(from.id)) } }]] } });
    return;
  }
  await welcome(d, chatId, from, tr);
}
