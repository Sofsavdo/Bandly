import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generate, IELTS_CEFR, SITE } from './gen';

// Fayllar kontent bilan mos (o'zgarsa: npx tsx scripts/seo/gen.ts)
const root = new URL('../../public/', import.meta.url).pathname;
for (const [path, content] of Object.entries(generate())) assert.equal(readFileSync(root + path, 'utf8'), content, `${path} eskirgan: npx tsx scripts/seo/gen.ts`);
const html = generate();
const canon = (h: string) => h.match(/rel="canonical" href="([^"]+)"/)?.[1];
const alts = (h: string) => Object.fromEntries([...h.matchAll(/hreflang="([a-z-]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
const byCanon = new Map(Object.values(html).filter((h) => h.startsWith('<!doctype')).map((h) => [canon(h), h]));
for (const [p, h] of Object.entries(html)) if (p.endsWith('.html')) {
  assert.ok(/<title>[^<]{10,}<\/title>/.test(h) && /name="description" content="[^"]{50,}"/.test(h) && h.includes('rel="canonical"'), `${p}: SEO teglari`);
  const lang = p.startsWith('ru/') ? 'ru' : 'uz';
  assert.ok(h.includes(`<html lang="${lang}">`), `${p}: til`);
  assert.ok(h.includes('href="/#/placement"'), `${p}: CTA mehmonga ochiq daraja testiga olib boradi (login devoriga emas)`);
  assert.ok(!/Band<b>ly|Bandly/.test(h) && h.includes('Sell<b>zen</b>'), `${p}: eski brend yo'q`);
  assert.equal(new Set([...h.matchAll(/<h1>/g)]).size <= 1 && (h.match(/<h1>/g) ?? []).length, 1, `${p}: bitta h1`);
  // hreflang: o'zaro (A → B bo'lsa, B → A) va o'ziga ishora qiladi
  const a = alts(h);
  if (Object.keys(a).length) {
    assert.equal(a[lang], canon(h), `${p}: hreflang o'ziga ishora qiladi`);
    assert.ok(a['x-default'], `${p}: x-default`);
    for (const [l, u] of Object.entries(a)) if (l !== 'x-default') { const other = byCanon.get(u); assert.ok(other, `${p}: ${l} juftligi mavjud (${u})`); assert.equal(alts(other!)[lang], canon(h), `${p}: ${l} juftligi orqaga ishora qiladi`); }
  }
}
const titles = Object.values(html).map((h) => h.match(/<title>([^<]+)<\/title>/)?.[1]).filter(Boolean);
assert.equal(new Set(titles).size, titles.length, 'sarlavhalar takrorlanmaydi');
assert.deepEqual(IELTS_CEFR.map((r) => r.cefr), ['C2', 'C1', 'B2', 'B1']);
assert.ok(html['vositalar/ielts-cefr-multilevel.html']!.includes('65–75') && html['vositalar/ielts-cefr-multilevel.html']!.includes('ielts.org'), 'manbali ma’lumot');
assert.ok(html['vositalar/multilevel-ball-hisoblash.html']!.includes('65–75') && html['vositalar/multilevel-ball-hisoblash.html']!.includes('lex.uz'), 'Multilevel: manbali chegaralar');
assert.ok(html['vositalar/cefr-darajalari.html']!.includes('"@type":"FAQPage"'), 'FAQ structured data');
for (const p of Object.keys(html).filter((x) => x.endsWith('.html'))) {
  const url = `${SITE}/${p.replace(/index\.html$/, '').replace(/\.html$/, '')}`;
  assert.ok(html['sitemap.xml']!.includes(`<loc>${url}</loc>`), `sitemap: ${url}`);
}
console.log('seo gen.test: OK');
