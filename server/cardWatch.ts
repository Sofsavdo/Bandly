import type { DatabaseSync } from 'node:sqlite';
import { acquireLease, handleNotice, newLeaseOwner, releaseLease, type CardPayConfig, type RawNotice } from './cardPay';

// Telegram'dagi karta-xabarlar botlarini (CardXabar / HUMOcard) o'qiydi. Bot boshqa botning xabarini ko'ra olmaydi, shuning uchun
// KARTA EGASINING Telegram akkaunti (MTProto sessiyasi, GramJS) ishlatiladi. Sessiya = akkauntga to'liq kirish: faqat Railway Variables'da saqlang.
// Faqat o'qiydi (hech narsa yubormaydi). Bir vaqtda faqat bitta jarayon ulanadi (aks holda Telegram sessiyani bekor qiladi) — DB lease bilan.

export interface TgCreds { apiId: number; apiHash: string; session: string }
export interface NoticeFeed {
  /** Ulanadi, manbalarni topadi, yangi xabarlarga obuna bo'ladi va o'tkazib yuborilganlarni qayta o'qiydi. */
  start(onNotice: (n: RawNotice) => void): Promise<void>;
  /** Yangilanish yo'qolgan bo'lsa ushlash uchun: oxirgi xabarlarni qayta o'qiydi (takrorlar bazada filtrlanadi). */
  poll(onNotice: (n: RawNotice) => void): Promise<void>;
  stop(): Promise<void>;
}

const LEASE_TTL = 60_000;
const TICK = 20_000;
const POLL_EVERY = 3; // har 3-tickda (≈60 s)

/** Haqiqiy Telegram ulagichi. Paket faqat kerak bo'lganda yuklanadi (PAY_OWN_MODE=off bo'lsa umuman ishga tushmaydi). */
export function telegramFeed(creds: TgCreds, sources: string[], log: (m: string) => void): NoticeFeed {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let client: any = null;
  const ents = new Map<string, { entity: unknown; name: string }>();
  const emit = (onNotice: (n: RawNotice) => void, name: string, m: { id: number; message?: string; date: number; out?: boolean }): void => {
    if (m.out || !m.message) return;
    onNotice({ source: name, msgId: m.id, text: m.message, at: m.date * 1000 });
  };
  const feed: NoticeFeed = {
    async start(onNotice) {
      const { TelegramClient } = await import('telegram');
      const { StringSession } = await import('telegram/sessions');
      const { NewMessage } = await import('telegram/events');
      const { LogLevel } = await import('telegram/extensions/Logger');
      client = new TelegramClient(new StringSession(creds.session), creds.apiId, creds.apiHash, { connectionRetries: 5 });
      client.setLogLevel(LogLevel.ERROR);
      await client.connect();
      if (!(await client.isUserAuthorized())) throw new Error('Telegram session invalid (revoked) - log in again: npm run pay:login');
      for (const s of sources) {
        try { const e = await client.getEntity(s); ents.set(String(e.id), { entity: e, name: s }); } catch { log(`[cardpay] manba topilmadi: @${s} (botga akkauntdan /start yuborilganmi?)`); }
      }
      if (!ents.size) throw new Error('no source bot found');
      client.addEventHandler((ev: { message: { id: number; message?: string; date: number; out?: boolean; senderId?: unknown } }) => {
        const src = ents.get(String(ev.message.senderId)); // faqat belgilangan botlardan (yuboruvchi ID'sini soxtalashtirib bo'lmaydi)
        if (src) emit(onNotice, src.name, ev.message);
      }, new NewMessage({ incoming: true }));
      log(`[cardpay] Telegram ulandi, manbalar: ${[...ents.values()].map((v) => '@' + v.name).join(', ')}`);
      await feed.poll(onNotice); // o'chiq turgan paytdagi xabarlar
    },
    async poll(onNotice) {
      for (const { entity, name } of ents.values()) {
        const msgs = (await client.getMessages(entity, { limit: 30 })) as { id: number; message?: string; date: number; out?: boolean }[];
        for (const m of [...msgs].reverse()) emit(onNotice, name, m);
      }
    },
    async stop() { const c = client; client = null; ents.clear(); try { await c?.disconnect(); await c?.destroy?.(); } catch { /* allaqachon uzilgan */ } },
  };
  return feed;
}

export interface WatchDeps { db: DatabaseSync; cfg: CardPayConfig; creds: TgCreds; log?: (m: string) => void; now?: () => number }

/** Kuzatuvchini ishga tushiradi: lease olinsa ulanadi, yo'qotilsa uzadi, xatoda keyingi tickda qayta urinadi. */
export function startCardWatch(deps: WatchDeps, makeFeed?: () => NoticeFeed): { stop(): Promise<void> } {
  const { db, cfg } = deps;
  const log = deps.log ?? (() => undefined);
  const now = deps.now ?? Date.now;
  const owner = newLeaseOwner();
  let feed: NoticeFeed | null = null;
  let stopped = false;
  let ticks = 0;
  let busy = false;
  const onNotice = (n: RawNotice): void => {
    try {
      const r = handleNotice(db, cfg, n, now());
      if (r.id !== null) log(`[cardpay] xabar #${r.id} (@${n.source}) → ${r.outcome ?? cfg.mode}`); // matn va karta ma'lumoti jurnalga yozilmaydi
    } catch (e) { log(`[cardpay] xabarni qayta ishlashda xato: ${(e as Error).message}`); }
  };
  const tick = async (): Promise<void> => {
    if (stopped || busy) return;
    busy = true;
    try {
      if (!acquireLease(db, owner, now(), LEASE_TTL)) {
        if (feed) { const f = feed; feed = null; await f.stop(); log('[cardpay] boshqa nusxa ulangan — uzildi'); }
        return;
      }
      if (!feed) {
        const f = (makeFeed ?? (() => telegramFeed(deps.creds, cfg.sources, log)))();
        try { await f.start(onNotice); feed = f; } catch (e) { log(`[cardpay] ulanish xatosi: ${(e as Error).message}`); await f.stop(); }
        return;
      }
      if (++ticks % POLL_EVERY === 0) await feed.poll(onNotice);
    } catch (e) {
      log(`[cardpay] tick xatosi: ${(e as Error).message}`);
      if (feed) { const f = feed; feed = null; await f.stop().catch(() => undefined); } // keyingi tickda qayta ulanadi
    } finally { busy = false; }
  };
  const timer = setInterval(() => { void tick(); }, TICK);
  timer.unref();
  void tick();
  return {
    async stop() {
      stopped = true;
      clearInterval(timer);
      try { await feed?.stop(); } catch { /* */ }
      feed = null;
      try { releaseLease(db, owner); } catch { /* baza yopilgan */ }
    },
  };
}
