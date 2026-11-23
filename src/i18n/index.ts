// Sellzen interfeysi 6 tilda: o'zbekcha (manba), English, Русский, Қазақша, Кыргызча, Тоҷикӣ.
// Usul (gettext): kalit — o'zbekcha manba matnning o'zi. L('Darslar') tanlangan tildagi tarjimani qaytaradi, topilmasa — o'zbekchani.
// Tarjimalar serverda saqlanadi (/api/i18n/:lang, Metodist kabineti → Tarjimalar), brauzerda keshlanadi va ilova modullari
// yuklanishidan OLDIN o'qiladi (main.tsx), shuning uchun modul darajasidagi L() chaqiruvlari ham to'g'ri tilda bo'ladi.
import { useSyncExternalStore } from 'react';
import { uz, type Key } from './uz';

export type { Key };
export const LANGS = ['uz', 'en', 'ru', 'kk', 'ky', 'tg'] as const;
export type Lang = (typeof LANGS)[number];
export const isLang = (s: unknown): s is Lang => (LANGS as readonly unknown[]).includes(s);
export const LANG_NAMES: Record<Lang, string> = { uz: 'O‘zbekcha', en: 'English', ru: 'Русский', kk: 'Қазақша', ky: 'Кыргызча', tg: 'Тоҷикӣ' };
/** AI ko'rsatmalari uchun tilning inglizcha nomi. */
export const LANG_EN: Record<Lang, string> = { uz: 'Uzbek (Latin script)', en: 'English', ru: 'Russian', kk: 'Kazakh (Cyrillic)', ky: 'Kyrgyz (Cyrillic)', tg: 'Tajik (Cyrillic)' };

const KEY = 'bandly.lang';
const CACHE = (l: Lang) => `bandly.i18n.${l}`;
type Dict = Record<string, string>;

const store = (): Storage | null => { try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; } };

/** Telegram Mini App foydalanuvchisining tili (initData URL'da keladi). */
function telegramLang(): string | null {
  try {
    const raw = `${location.hash}&${location.search}`.match(/tgWebAppData=([^&]+)/)?.[1];
    if (!raw) return null;
    const user = new URLSearchParams(decodeURIComponent(raw)).get('user');
    return user ? (JSON.parse(user) as { language_code?: string }).language_code ?? null : null;
  } catch { return null; }
}

/** Saqlangan tanlov → Telegram tili → brauzer tili (inglizcha brauzer — o'zbekcha, chunki asosiy auditoriya) → o'zbekcha. */
export function detectLang(saved: string | null, tg: string | null, browser: readonly string[]): Lang {
  if (isLang(saved)) return saved;
  for (const c of [tg, ...browser]) {
    const base = (c ?? '').toLowerCase().split('-')[0];
    if (base && base !== 'en' && isLang(base)) return base;
  }
  return 'uz';
}

// Faqat tarjimasi tayyor tillar yoqiladi (server: qamrov ≥ 98%). Tayyor bo'lmagan til tanlangan bo'lsa — o'zbekcha.
const ENABLED_KEY = 'bandly.i18n.langs';
let enabled: Lang[] = (() => { try { const v = JSON.parse(store()?.getItem(ENABLED_KEY) ?? '["uz"]') as unknown[]; return v.filter(isLang); } catch { return ['uz' as Lang]; } })();
if (!enabled.includes('uz')) enabled.unshift('uz');
export const enabledLangs = (): Lang[] => enabled;
const wanted: Lang = detectLang(store()?.getItem(KEY) ?? null, typeof location === 'undefined' ? null : telegramLang(), typeof navigator === 'undefined' ? [] : navigator.languages ?? []);
let lang: Lang = enabled.includes(wanted) ? wanted : 'uz';
let dict: Dict = readCache(lang);
function readCache(l: Lang): Dict {
  if (l === 'uz') return {};
  try { return (JSON.parse(store()?.getItem(CACHE(l)) ?? '{}') as { dict?: Dict }).dict ?? {}; } catch { return {}; }
}
const listeners = new Set<() => void>();
/** Tekshiruv rejimi (bandly.i18n.pseudo=1): tarjimadan o'tgan har bir matn ko'rinmas belgi bilan o'raladi — qolib ketgan matnlarni topish uchun. */
const PSEUDO = store()?.getItem('bandly.i18n.pseudo') === '1';
const MARK = '\u2063';
let pseudoSet: Set<string> | null = null;

export const getLang = (): Lang => lang;
export const hasDict = (): boolean => lang === 'uz' || Object.keys(dict).length > 0;
if (typeof document !== 'undefined') document.documentElement.lang = lang;

type Vars = (string | number | null | undefined)[] | Record<string, string | number | null | undefined>;
const fill = (s: string, vars?: Vars): string => (vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => { const v = (vars as Record<string, unknown>)[k]; return v === undefined || v === null ? m : String(v); }) : s);

/** Tarjima: manba (o'zbekcha) matn → joriy tildagi matn. {0}, {n} kabi o'rinlar to'ldiriladi. */
export function L(src: string, vars?: Vars): string {
  if (!src) return src;
  let tr = dict[src];
  if (tr === undefined) { const key = src.replace(/\s+/g, ' ').trim(); const hit = dict[key]; if (hit !== undefined) tr = src.match(/^\s*/)![0] + hit + src.match(/\s*$/)![0]; }
  const out = fill(tr ?? src, vars);
  return PSEUDO ? MARK + out + MARK : out;
}

const ENGLISH_FIELDS = new Set(['en', 'example', 'listen', 'accept', 'answers', 'words', 'model', 'word', 'def', 'paragraphs', 'script', 'passage', 'transcript', 'said', 'better', 'objective']); // prompt/options/q da qavs ichidagi o'zbekcha izohlar bor — ular server lug'ati orqali (faqat aralash matn) tarjima qilinadi
/** Ma'lumotlardagi (darslar, grammatika, so'zlar) o'zbekcha matnlarni joyida tarjima qiladi. Inglizcha misollar tegilmaydi — ular lug'atda yo'q. */
export function deepTranslate<T>(obj: T, seen = new WeakSet<object>()): T {
  if ((lang === 'uz' && !PSEUDO) || !obj || typeof obj !== 'object' || seen.has(obj as object)) return obj;
  seen.add(obj as object);
  const o = obj as Record<string, unknown>;
  for (const k of Object.keys(o)) {
    const v = o[k];
    // O'quv materiali — inglizcha maydonlar hech qachon tarjima qilinmaydi (misollar, savollar, variantlar, kalitlar, namunaviy javob, matnlar)
    if (ENGLISH_FIELDS.has(k) || (k === 'title' && 'titleUz' in o)) continue;
    if (typeof v === 'string') {
      const key = v.replace(/\s+/g, ' ').trim();
      if (PSEUDO) { if (pseudoSet?.has(key) && !Object.isFrozen(o)) o[k] = MARK + (dict[key] ?? v) + MARK; continue; }
      const tr = dict[v] ?? dict[key]; if (tr !== undefined && !Object.isFrozen(o)) o[k] = tr;
    }
    else if (v && typeof v === 'object') deepTranslate(v, seen);
  }
  return obj;
}

/** Serverdan joriy til lug'atini oladi (keshdan tez, keyin yangilanadi). Ilova modullari shundan keyin yuklanadi. */
export async function initI18n(fetchImpl: typeof fetch = fetch): Promise<void> {
  if (PSEUDO) pseudoSet = new Set((await import('./catalog.json')).default as string[]);
  // Qaysi tillar tayyor — serverdan (keyingi ochilish uchun keshlanadi)
  const langsReq = fetchImpl('/api/i18n', { signal: AbortSignal.timeout(4000) }).then((r) => (r.ok ? r.json() : null)).then((j: { langs?: unknown[] } | null) => {
    if (!j?.langs) return;
    enabled = ['uz', ...j.langs.filter(isLang).filter((l) => l !== 'uz')];
    try { store()?.setItem(ENABLED_KEY, JSON.stringify(enabled)); } catch { /* joy yo'q */ }
  }).catch(() => undefined);
  if (wanted !== 'uz') { await langsReq; lang = enabled.includes(wanted) ? wanted : 'uz'; dict = readCache(lang); if (typeof document !== 'undefined') document.documentElement.lang = lang; }
  if (lang === 'uz') return;
  const cached = store()?.getItem(CACHE(lang));
  const ver = (() => { try { return (JSON.parse(cached ?? '{}') as { v?: string }).v ?? ''; } catch { return ''; } })();
  const load = fetchImpl(`/api/i18n/${lang}?v=${encodeURIComponent(ver)}`, { signal: AbortSignal.timeout(6000) })
    .then(async (r) => {
      if (r.status === 304 || !r.ok) return;
      const j = (await r.json()) as { v: string; dict: Dict };
      dict = j.dict ?? {};
      try { store()?.setItem(CACHE(lang), JSON.stringify({ v: j.v, dict })); } catch { /* joy yo'q */ }
    })
    .catch(() => undefined);
  // Kesh bo'lsa — kutmaymiz (keyingi ochilishda yangisi), bo'lmasa — birinchi marta kutamiz
  if (!Object.keys(dict).length) await load;
}

/** Tilni almashtiradi va ilovani qayta yuklaydi (barcha matnlar yangi tilda qayta hosil bo'ladi). */
export function setLang(l: string): void {
  if (!isLang(l) || l === lang || !enabled.includes(l)) return;
  try { store()?.setItem(KEY, l); } catch { /* ruxsat yo'q */ }
  if (typeof location !== 'undefined' && typeof window !== 'undefined') location.reload();
  else { lang = l; dict = readCache(l); listeners.forEach((f) => f()); }
}

/** Eski kalitli API (nav.*) — endi ham manba matn orqali tarjima qilinadi. */
export function translate(_l: string, key: Key, vars?: Record<string, string | number>): string { return L(uz[key] ?? key, vars); }
export const t = (key: Key, vars?: Record<string, string | number>): string => L(uz[key] ?? key, vars);

/** Komponent ichida: til o'zgarsa qayta chizadi. */
export function useT(): typeof t {
  useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => lang);
  return t;
}

/** Testlar uchun: lug'atni to'g'ridan-to'g'ri o'rnatish. */
export function __setForTest(l: Lang, d: Dict): void { lang = l; dict = d; if (!enabled.includes(l)) enabled.push(l); }
