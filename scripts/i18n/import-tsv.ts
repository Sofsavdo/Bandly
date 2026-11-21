// Tarjimalarni TSV fayllardan src/i18n/locales/<til>.json ga yozadi.
// Format: har qator "id<TAB>en<TAB>ru<TAB>kk<TAB>ky<TAB>tg"; id — manba ro'yxatidagi (JSON massiv) tartib raqami.
// Ishlatish: npx tsx scripts/i18n/import-tsv.ts <manba.json> <fayl.tsv>...
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '../..');
const LANGS = ['en', 'ru', 'kk', 'ky', 'tg'] as const;
const [srcFile, ...files] = process.argv.slice(2);
const src = JSON.parse(readFileSync(srcFile!, 'utf8')) as string[];
const ph = (s: string) => (s.match(/\{[\w]+\}/g) ?? []).sort().join(',');
const loc = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(readFileSync(join(ROOT, `src/i18n/locales/${l}.json`), 'utf8')) as Record<string, string>]));
let n = 0; const errs: string[] = [];
for (const f of files) {
  for (const [ln, line] of readFileSync(f, 'utf8').split('\n').entries()) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    const id = Number(cols[0]);
    if (cols.length !== 6 || !Number.isInteger(id) || !src[id]) { errs.push(`${f}:${ln + 1}: ustunlar ${cols.length}`); continue; }
    const s = src[id]!;
    LANGS.forEach((l, i) => {
      const t = cols[i + 1]!.trim();
      if (!t) { errs.push(`${f}:${ln + 1} ${l}: bo'sh`); return; }
      if (ph(t) !== ph(s)) { errs.push(`${f}:${ln + 1} ${l}: o'rinbosar ${ph(s)} ≠ ${ph(t)}`); return; }
      loc[l]![s] = t;
    });
    n++;
  }
}
if (errs.length) { console.error(errs.slice(0, 30).join('\n')); process.exit(1); }
for (const l of LANGS) {
  const sorted = Object.fromEntries(Object.entries(loc[l]!).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  writeFileSync(join(ROOT, `src/i18n/locales/${l}.json`), JSON.stringify(sorted, null, 1) + '\n');
}
console.log(`${n} ta qator → ${LANGS.length} til`);
