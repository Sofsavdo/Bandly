// Instagram bio/Reel linki uchun yengil "bridge" sahifa (/r/<kod>): ilova (SPA) yuklanmaydi — bitta kichik HTML.
// Foydalanuvchi veb-saytda davom etishni yoki Telegram botni ochishni tanlaydi. Matnlar oltita tilda (uz, en, ru, tg, ky, kk);
// til: link tili → brauzer tili → uz. Telegram chuqur havolasi (t.me/<bot>?start=ref_<kod>) alohida variant sifatida saqlanadi (mavjud bot oqimi o'zgarmagan).
export const BRIDGE_LANGS = ['uz', 'en', 'ru', 'tg', 'ky', 'kk'] as const;
export type BridgeLang = (typeof BRIDGE_LANGS)[number];
export const BRIDGE_KEYS = ['title', 'lead', 'web', 'tg', 'note', 'disclaimer'] as const;
/** Manba matnlar (o'zbekcha). Boshqa tillar — loyihaning umumiy tarjima katalogidan (server/i18n.ts trServer: src/i18n/locales/*.json), alohida lug'at yo'q. */
export const BRIDGE_UZ: Record<(typeof BRIDGE_KEYS)[number], string> = {
  title: 'Ingliz tili darajangizni bepul aniqlang', lead: 'Darslar, bepul mock testlar va shaxsiy reja — Sellzen’da.', web: 'Veb-saytda davom etish', tg: 'Telegram’da ochish',
  note: 'Telegram’ni tanlasangiz, bot orqali ochiladi.', disclaimer: 'Sellzen rasmiy IELTS tashkilotlari bilan bog‘liq emas; natija kafolatlanmaydi.',
};
const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Brauzer tili (Accept-Language) → qo'llab-quvvatlanadigan til (aks holda uz). */
export function pickBridgeLang(linkLang: string | null | undefined, acceptLanguage: string | undefined): BridgeLang {
  if (linkLang && (BRIDGE_LANGS as readonly string[]).includes(linkLang)) return linkLang as BridgeLang;
  for (const part of String(acceptLanguage ?? '').split(',')) {
    const l = part.trim().slice(0, 2).toLowerCase();
    const m = l === 'uz' || l === 'en' || l === 'ru' || l === 'tg' || l === 'ky' || l === 'kk' ? l : l === 'tj' ? 'tg' : l === 'kg' ? 'ky' : null;
    if (m) return m as BridgeLang;
  }
  return 'uz';
}

/** code — link kodi (a-z2-9), clickId — 16 hex yoki null (bot/dublikat). Ikkalasi tekshirilgan qiymatlar. */
export function bridgeHtml(o: { lang: BridgeLang; code: string; clickId: string | null; bot: string | null; tr?: (uz: string) => string }): string {
  const tr = o.tr ?? ((x: string) => x);
  const t = Object.fromEntries(BRIDGE_KEYS.map((k) => [k, tr(BRIDGE_UZ[k])])) as Record<(typeof BRIDGE_KEYS)[number], string>;
  const web = `/?ref=${o.code}${o.clickId ? `&cid=${o.clickId}` : ''}#/`;
  const tgHref = o.bot && /^[A-Za-z0-9_]{3,40}$/.test(o.bot) ? `https://t.me/${o.bot}?start=ref_${o.code}` : null;
  return `<!doctype html><html lang="${o.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sellzen — ${esc(t.title)}</title><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer">
<meta property="og:title" content="Sellzen — ${esc(t.title)}"><meta property="og:description" content="${esc(t.lead)}"><meta property="og:type" content="website">
<style>:root{color-scheme:light dark}body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f5fb;color:#14162b}
@media(prefers-color-scheme:dark){body{background:#0d0f1e;color:#f1f1f8}.b2{background:#1b1e36;color:#f1f1f8}}
main{max-width:420px;padding:28px 20px;text-align:center}h1{font-size:24px;line-height:1.2;margin:14px 0 8px}p{margin:6px 0}.logo{font-weight:800;letter-spacing:.08em;font-size:18px}
a.b{display:block;margin:12px 0 0;padding:14px 18px;border-radius:999px;font-weight:700;text-decoration:none;background:#14162b;color:#fff}a.b2{background:#fff;color:#14162b;border:1px solid #c9c9d9}
small{display:block;color:#6b6e86;margin-top:14px;font-size:12px}</style></head><body><main>
<div class="logo">SELLZEN.UZ</div><h1>${esc(t.title)}</h1><p>${esc(t.lead)}</p>
<a class="b" id="web" href="${web}">${esc(t.web)}</a>
${tgHref ? `<a class="b b2" href="${tgHref}">${esc(t.tg)}</a><small>${esc(t.note)}</small>` : ''}
<small>${esc(t.disclaimer)}</small></main>
<script>(function(){var c=${JSON.stringify(o.clickId)};try{if(c){fetch('/api/creator/ping',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({cid:c}),keepalive:true})}}catch(e){}
document.getElementById('web').addEventListener('click',function(){try{if(!localStorage.getItem('bandly.lang'))localStorage.setItem('bandly.lang',${JSON.stringify(o.lang)})}catch(e){}})})();</script></body></html>`;
}
