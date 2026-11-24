// Taklif havolasidan kelgan kodni eslab qoladi (30 kun) — hisob ochilganda serverga yuboriladi.
const KEY = 'bandly.ref';
const FIRST = 'bandly.ref.first';   // birinchi tegilgan kod (first-touch): oxirgi tegish (KEY) o'zgarsa ham saqlanadi, 30 kundan keyin yangilanadi
const CID = 'bandly.cid';           // creator linkidagi click identifikatori (anonim; shaxsiy ma'lumot emas)
const DAYS30 = 30 * 86_400_000;
const ok = (s: string | null | undefined): s is string => !!s && /^[a-z2-9]{6,10}$/.test(s);

/** ?ref=KOD (sayt), #/...?ref=KOD, Telegram Mini App: tgWebAppStartParam=ref_KOD. Telegram URL'ni tozalashidan OLDIN chaqiriladi. */
export function captureRef(href: string = typeof location === 'undefined' ? '' : location.href): string | null {
  const m = href.match(/[?&#]ref=([a-z2-9]{6,10})\b/) ?? href.match(/tgWebAppStartParam=ref_([a-z2-9]{6,10})\b/);
  const code = m?.[1] ?? null;
  if (ok(code)) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
      if (!getFirstRef()) localStorage.setItem(FIRST, JSON.stringify({ code, at: Date.now() }));
    } catch { /* saqlab bo'lmadi */ }
  }
  captureClick(href);
  return code;
}

export function getRef(now = Date.now()): string | undefined {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { code?: string; at?: number } | null; return v && ok(v.code) && now - (v.at ?? 0) < 30 * 86_400_000 ? v.code : undefined; } catch { return undefined; }
}

/** Birinchi tegilgan kod (30 kun ichida). */
export function getFirstRef(now = Date.now()): string | undefined {
  try { const v = JSON.parse(localStorage.getItem(FIRST) ?? 'null') as { code?: string; at?: number } | null; return v && ok(v.code) && now - (v.at ?? 0) < DAYS30 ? v.code : undefined; } catch { return undefined; }
}
/** ?cid=<16 hex> (bridge sahifasidan): creator linkidagi click identifikatori. */
export function captureClick(href: string = typeof location === 'undefined' ? '' : location.href): string | null {
  const id = href.match(/[?&#]cid=([a-f0-9]{16})\b/)?.[1] ?? null;
  if (id) { try { localStorage.setItem(CID, JSON.stringify({ id, at: Date.now() })); } catch { /* */ } }
  return id;
}
export function getClickId(now = Date.now()): string | undefined {
  try { const v = JSON.parse(localStorage.getItem(CID) ?? 'null') as { id?: string; at?: number } | null; return v && /^[a-f0-9]{16}$/.test(v.id ?? '') && now - (v.at ?? 0) < DAYS30 ? v.id : undefined; } catch { return undefined; }
}
/** Hisob yaratish so'roviga qo'shiladigan atribusiya maydonlari (server tekshiradi; bo'lmasa — hech narsa). */
export const touchFields = (): { ref?: string; ref0?: string; cid?: string } => ({ ref: getRef(), ref0: getFirstRef(), cid: getClickId() });
