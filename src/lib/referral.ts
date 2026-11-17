// Taklif havolasidan kelgan kodni eslab qoladi (30 kun) — hisob ochilganda serverga yuboriladi.
const KEY = 'bandly.ref';
const ok = (s: string | null | undefined): s is string => !!s && /^[a-z2-9]{6,10}$/.test(s);

/** ?ref=KOD (sayt), #/...?ref=KOD, Telegram Mini App: tgWebAppStartParam=ref_KOD. Telegram URL'ni tozalashidan OLDIN chaqiriladi. */
export function captureRef(href: string = typeof location === 'undefined' ? '' : location.href): string | null {
  const m = href.match(/[?&#]ref=([a-z2-9]{6,10})\b/) ?? href.match(/tgWebAppStartParam=ref_([a-z2-9]{6,10})\b/);
  const code = m?.[1] ?? null;
  if (ok(code)) { try { localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() })); } catch { /* saqlab bo'lmadi */ } }
  return code;
}

export function getRef(now = Date.now()): string | undefined {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { code?: string; at?: number } | null; return v && ok(v.code) && now - (v.at ?? 0) < 30 * 86_400_000 ? v.code : undefined; } catch { return undefined; }
}
