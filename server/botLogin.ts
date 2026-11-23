// Saytga Telegram bot orqali kirish (vidjet ishlamaganda: domen, ilova ichidagi brauzer).
// Oqim: sayt start() → { code, poll } oladi; foydalanuvchi t.me/<bot>?start=login_<code> ni ochadi va botda tasdiqlaydi
// (confirm) → sayt poll kaliti bilan so'raydi va sessiya tokenini BIR MARTA oladi.
// Xavfsizlik: havoladagi `code` va so'rash kaliti `poll` alohida tasodifiy qiymatlar. Havola ko'ringan/forward qilingan bo'lsa ham
// begona odam tokenni ololmaydi — poll kaliti faqat kirishni boshlagan brauzerda. Kodlar 10 daqiqa yashaydi, xotirada (bazaga yozilmaydi).
import { randomBytes } from 'node:crypto';

export const BOT_LOGIN_TTL = 10 * 60_000;
export const BOT_LOGIN_MAX = 5000;
interface Entry { at: number; poll: string; token?: string; nickname?: string }

export class BotLogins {
  private byCode = new Map<string, Entry>();
  private byPoll = new Map<string, string>(); // poll → code

  private sweep(now: number): void {
    for (const [c, e] of this.byCode) if (now - e.at > BOT_LOGIN_TTL) { this.byCode.delete(c); this.byPoll.delete(e.poll); }
  }
  /** Yangi kirish: null — juda ko'p ochiq kod (himoya). */
  start(now = Date.now()): { code: string; poll: string } | null {
    this.sweep(now);
    if (this.byCode.size >= BOT_LOGIN_MAX) return null;
    const code = randomBytes(16).toString('hex'), poll = randomBytes(16).toString('hex');
    this.byCode.set(code, { at: now, poll });
    this.byPoll.set(poll, code);
    return { code, poll };
  }
  /** Botda tasdiqlandi: issue() sessiya ochadi. Kod eskirgan/ishlatilgan bo'lsa false (sessiya ochilmaydi). */
  confirm(code: string, issue: () => { token: string; nickname: string }, now = Date.now()): boolean {
    const e = this.byCode.get(code);
    if (!e || e.token || now - e.at > BOT_LOGIN_TTL) return false;
    const r = issue();
    e.token = r.token; e.nickname = r.nickname;
    return true;
  }
  /** Sayt so'raydi: 'gone' — kod yo'q/eskirgan; 'pending' — hali tasdiqlanmagan; aks holda token (bir martalik). */
  poll(poll: string, now = Date.now()): 'gone' | 'pending' | { token: string; nickname: string } {
    const code = this.byPoll.get(poll);
    const e = code ? this.byCode.get(code) : undefined;
    if (!code || !e || now - e.at > BOT_LOGIN_TTL) { if (code) { this.byCode.delete(code); this.byPoll.delete(poll); } return 'gone'; }
    if (!e.token) return 'pending';
    this.byCode.delete(code); this.byPoll.delete(poll);
    return { token: e.token, nickname: e.nickname! };
  }
}
