import type { DatabaseSync } from 'node:sqlite';
import { ApiError } from './db';
import { audit } from './certificates';
import { saveSession, sessionKey } from './tgSession';

// Telegram'ga admin paneldan ulanish: telefon → Telegram yuborgan kod → (bo'lsa) 2 bosqichli parol. Kod va parol faqat shu serverga
// (admin o'z paneliga) kiritiladi; hech qayerda saqlanmaydi va jurnalga yozilmaydi. Natija — sessiya, u shifrlangan holda saqlanadi.

export interface LoginClient {
  sendCode(phone: string): Promise<{ hash: string; viaApp: boolean }>;
  signIn(phone: string, hash: string, code: string): Promise<'ok' | 'password'>;
  password(pw: string): Promise<void>;
  session(): string;
  disconnect(): Promise<void>;
}
export type LoginFactory = (creds: { apiId: number; apiHash: string }) => Promise<LoginClient>;

/** Haqiqiy GramJS ulagichi (paket faqat shu yerda yuklanadi). */
export const gramLoginFactory: LoginFactory = async ({ apiId, apiHash }) => {
  const { TelegramClient, Api } = await import('telegram');
  const { StringSession } = await import('telegram/sessions');
  const { LogLevel } = await import('telegram/extensions/Logger');
  const client = new TelegramClient(new StringSession(''), apiId, apiHash, { connectionRetries: 3 });
  client.setLogLevel(LogLevel.ERROR);
  await client.connect();
  return {
    async sendCode(phone) { const r = await client.sendCode({ apiId, apiHash }, phone); return { hash: r.phoneCodeHash, viaApp: r.isCodeViaApp }; },
    async signIn(phone, hash, code) {
      try {
        const r = await client.invoke(new Api.auth.SignIn({ phoneNumber: phone, phoneCodeHash: hash, phoneCode: code }));
        if (r.className === 'auth.AuthorizationSignUpRequired') throw new Error('PHONE_NOT_REGISTERED');
        return 'ok';
      } catch (e) {
        if (/SESSION_PASSWORD_NEEDED/.test(String((e as Error).message))) return 'password';
        throw e;
      }
    },
    async password(pw) {
      let last: Error | null = null;
      try { await client.signInWithPassword({ apiId, apiHash }, { password: async () => pw, onError: async (e) => { last = e; return true; } }); } catch (e) { throw last ?? e; }
    },
    session: () => (client.session as unknown as { save(): string }).save(),
    async disconnect() { try { await client.disconnect(); await (client as unknown as { destroy?: () => Promise<void> }).destroy?.(); } catch { /* */ } },
  };
};

/** Telegram xatosini admin ko'radigan aniq xabarga aylantiradi (xom xato matni va kod/parol chiqarilmaydi). */
export function loginError(e: unknown): ApiError {
  const m = String((e as Error)?.message ?? e);
  if (e instanceof ApiError) return e;
  if (/PHONE_CODE_INVALID/.test(m)) return new ApiError(400, 'Kod noto‘g‘ri');
  if (/PHONE_CODE_EXPIRED|PHONE_CODE_EMPTY/.test(m)) return new ApiError(400, 'Kod eskirgan — qaytadan so‘rang');
  if (/PASSWORD_HASH_INVALID/.test(m)) return new ApiError(400, 'Parol noto‘g‘ri');
  if (/PHONE_NUMBER_INVALID|PHONE_NUMBER_BANNED|PHONE_NOT_REGISTERED/.test(m)) return new ApiError(400, 'Telefon raqami noto‘g‘ri yoki Telegram’da ro‘yxatdan o‘tmagan');
  if (/FLOOD|PHONE_PASSWORD_FLOOD/.test(m)) return new ApiError(429, 'Telegram vaqtincha cheklab qo‘ydi — keyinroq urinib ko‘ring');
  if (/API_ID_INVALID|API_ID_PUBLISHED_FLOOD/.test(m)) return new ApiError(400, 'TG_API_ID yoki TG_API_HASH noto‘g‘ri');
  return new ApiError(502, 'Telegram bilan ulanib bo‘lmadi — keyinroq urinib ko‘ring');
}

interface Pending { client: LoginClient; phone: string; hash: string; step: 'code' | 'password'; at: number }
const TTL = 10 * 60_000;
const MAX_STARTS = 5; // soatiga

export class LoginFlow {
  private pending = new Map<number, Pending>();
  private starts = new Map<number, number[]>();
  constructor(private db: DatabaseSync, private factory: LoginFactory, private apiCreds: () => { apiId: number; apiHash: string } | null, private env: NodeJS.ProcessEnv = process.env, private onDone: () => void = () => undefined) {}

  private async drop(adminId: number): Promise<void> { const p = this.pending.get(adminId); this.pending.delete(adminId); await p?.client.disconnect(); }
  private get(adminId: number, now: number): Pending {
    const p = this.pending.get(adminId);
    if (!p || now - p.at > TTL) { void this.drop(adminId); throw new ApiError(400, 'Ulanish muddati tugadi — qaytadan boshlang'); }
    return p;
  }

  async start(adminId: number, phoneRaw: string, now = Date.now()): Promise<{ step: 'code'; viaApp: boolean }> {
    const creds = this.apiCreds();
    if (!creds) throw new ApiError(400, 'TG_API_ID va TG_API_HASH sozlanmagan');
    if (!sessionKey(this.env)) throw new ApiError(500, 'Maxfiy kalit yo‘q: serverda ADMIN_TOKEN yoki PAY_SESSION_KEY sozlanishi kerak'); // sessiya saqlanmaydigan bo'lsa, Telegram'ga kirishni boshlamaymiz
    const phone = '+' + phoneRaw.replace(/\D/g, '');
    if (!/^\+\d{9,15}$/.test(phone)) throw new ApiError(400, 'Telefon raqami noto‘g‘ri yoki Telegram’da ro‘yxatdan o‘tmagan');
    const recent = (this.starts.get(adminId) ?? []).filter((t) => now - t < 3_600_000);
    if (recent.length >= MAX_STARTS) throw new ApiError(429, 'Telegram vaqtincha cheklab qo‘ydi — keyinroq urinib ko‘ring');
    this.starts.set(adminId, [...recent, now]);
    await this.drop(adminId);
    let client: LoginClient | null = null;
    try {
      client = await this.factory(creds);
      const r = await client.sendCode(phone);
      this.pending.set(adminId, { client, phone, hash: r.hash, step: 'code', at: now });
      audit(this.db, adminId, 'pay.tg.code', null, { phone: `…${phone.slice(-4)}` }, now);
      return { step: 'code', viaApp: r.viaApp };
    } catch (e) { await client?.disconnect(); throw loginError(e); }
  }

  async code(adminId: number, code: string, now = Date.now()): Promise<{ step: 'done' | 'password' }> {
    const p = this.get(adminId, now);
    if (p.step !== 'code') throw new ApiError(400, 'Ulanish muddati tugadi — qaytadan boshlang');
    try {
      const r = await p.client.signIn(p.phone, p.hash, code.replace(/\D/g, ''));
      if (r === 'password') { p.step = 'password'; p.at = now; return { step: 'password' }; }
      await this.finish(adminId, p, now);
      return { step: 'done' };
    } catch (e) { const err = loginError(e); if (/muddati|eskirgan/.test(err.message)) await this.drop(adminId); throw err; }
  }

  async password(adminId: number, pw: string, now = Date.now()): Promise<{ step: 'done' }> {
    const p = this.get(adminId, now);
    if (p.step !== 'password') throw new ApiError(400, 'Ulanish muddati tugadi — qaytadan boshlang');
    try { await p.client.password(pw); } catch (e) { throw loginError(e); }
    await this.finish(adminId, p, now);
    return { step: 'done' };
  }

  private async finish(adminId: number, p: Pending, now: number): Promise<void> {
    try { saveSession(this.db, p.client.session(), this.env, now); } finally { this.pending.delete(adminId); await p.client.disconnect(); }
    audit(this.db, adminId, 'pay.tg.connect', null, { phone: `…${p.phone.slice(-4)}` }, now);
    this.onDone();
  }

  async cancel(adminId: number): Promise<void> { await this.drop(adminId); }
}

/** Telegram tomonida shu sessiyani tugatadi (log out). Xatosi e'tiborsiz: baza yozuvi baribir o'chiriladi. */
export async function gramTerminate(creds: { apiId: number; apiHash: string }, session: string): Promise<void> {
  const { TelegramClient, Api } = await import('telegram');
  const { StringSession } = await import('telegram/sessions');
  const { LogLevel } = await import('telegram/extensions/Logger');
  const client = new TelegramClient(new StringSession(session), creds.apiId, creds.apiHash, { connectionRetries: 1 });
  client.setLogLevel(LogLevel.ERROR);
  try { await client.connect(); await client.invoke(new Api.auth.LogOut()); } finally { try { await client.disconnect(); } catch { /* */ } }
}
