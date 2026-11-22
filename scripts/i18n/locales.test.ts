// Tarjimalar to'liqligi va sifati (src/i18n/locales/*.json): 5 til × katalog.
// Tekshiradi: yo'q/bo'sh/eskirgan kalitlar, o'rinbosarlar ({0}, {n}) mosligi, yozuv tizimi (ru/kk/ky/tg — kirill),
// tarjima qilinmay ko'chirilgan matn, va INGLIZCHA O'QUV MATERIALI tarjimada o'zgarmasligi (qo'shtirnoq ichidagi inglizcha
// ibora — «I went», 'look forward to' — har bir tilda harfma-harf saqlanadi).
// Interfeys (catalog-ui.json: ekranlar, server xabarlari, bot) va butun katalog (darslar, izohlar, mashq ko'rsatmalari)
// quyidagi COMPLETE ro'yxatidagi tillarda 100% bo'lishi shart. Yangi o'zbekcha matn qo'shilsa — locales/*.json ga tarjimasi
// ham qo'shiladi (inglizcha o'quv materiali bo'lsa — keep-english.json ga).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { englishOnly } from './english';
import { looksUz } from './detect';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '../..');
const LANGS = ['en', 'ru', 'kk', 'ky', 'tg'] as const;
/** Interfeysi to'liq tarjima qilingan tillar (bu yerdagi til uchun bitta yetishmagan interfeys matni ham testni yiqitadi). */
export const COMPLETE: readonly string[] = ['en', 'ru', 'kk', 'ky', 'tg'];

const read = <T>(f: string): T => JSON.parse(readFileSync(join(ROOT, f), 'utf8')) as T;
const catalog = new Set(read<string[]>('src/i18n/catalog.json'));
const ui = read<string[]>('src/i18n/catalog-ui.json');
const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
// Qo'shtirnoq ichidagi inglizcha o'quv iboralari: «...», “...”, "...", '...'
const quotedEnglish = (s: string): string[] => [...s.matchAll(/«([^»]{2,80})»|“([^”]{2,80})”|"([^"]{2,80})"|(?<![A-Za-z])'([^']{2,60})'(?![A-Za-z])/g)].map((m) => (m[1] ?? m[2] ?? m[3] ?? m[4])!.trim()).filter((q) => /[a-z]/i.test(q) && !/^-/.test(q) && englishOnly(q) && q.split(' ').length >= 1 && !/^[A-Z]{2,6}$/.test(q));
const CYR = /[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІіЈјӢӣӮӯҶҷ]/;

const report: string[] = [];
for (const l of LANGS) {
  const d = read<Record<string, string>>(`src/i18n/locales/${l}.json`);
  const errs: string[] = [];
  for (const [src, tr] of Object.entries(d)) {
    if (!catalog.has(src)) { errs.push(`eskirgan kalit (katalogda yo'q): ${src.slice(0, 60)}`); continue; }
    if (typeof tr !== 'string' || !tr.trim()) { errs.push(`bo'sh: ${src.slice(0, 60)}`); continue; }
    if (ph(tr) !== ph(src)) errs.push(`o'rinbosar: ${src.slice(0, 50)} → ${tr.slice(0, 50)}`);
    if (l !== 'en' && /[A-Za-z]{3}/.test(src) && looksUz(src) && !CYR.test(tr) && !englishOnly(tr)) errs.push(`kirill yo'q: ${tr.slice(0, 60)}`);
    if (tr === src && /[‘’'ʻ]/.test(src) && looksUz(src)) errs.push(`tarjima qilinmagan (manba bilan bir xil): ${src.slice(0, 60)}`);
    for (const q of quotedEnglish(src)) if (!tr.includes(q)) errs.push(`inglizcha o'quv iborasi o'zgargan «${q}»: ${tr.slice(0, 70)}`);
  }
  const missingUi = ui.filter((s) => !d[s]);
  if (COMPLETE.includes(l) && missingUi.length) errs.push(`interfeysda ${missingUi.length} ta tarjima yo'q, masalan: ${missingUi.slice(0, 3).join(' | ')}`);
  const missingAll = [...catalog].filter((s) => !d[s]);
  if (COMPLETE.includes(l) && missingAll.length) errs.push(`katalogda ${missingAll.length} ta tarjima yo'q, masalan: ${missingAll.slice(0, 3).join(' | ')}`);
  assert.deepEqual(errs, [], `${l}: ${errs.length} ta muammo`);
  report.push(`${l}: interfeys ${ui.length - missingUi.length}/${ui.length}, jami ${Object.keys(d).length}/${catalog.size}`);
}
console.log(`locales.test: OK — ${report.join('; ')}`);
