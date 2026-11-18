import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generate, IELTS_CEFR } from './gen';

// Fayllar kontent bilan mos (o'zgarsa: npx tsx scripts/seo/gen.ts)
const root = new URL('../../public/', import.meta.url).pathname;
for (const [path, content] of Object.entries(generate())) assert.equal(readFileSync(root + path, 'utf8'), content, `${path} eskirgan: npx tsx scripts/seo/gen.ts`);
const html = generate();
for (const [p, h] of Object.entries(html)) if (p.endsWith('.html')) {
  assert.ok(/<title>[^<]{10,}<\/title>/.test(h) && /name="description" content="[^"]{50,}"/.test(h) && h.includes('rel="canonical"'), `${p}: SEO teglari`);
  assert.ok(h.includes('lang="uz"') && h.includes('/#/start'), `${p}: til va CTA`);
}
assert.deepEqual(IELTS_CEFR.map((r) => r.cefr), ['C2', 'C1', 'B2', 'B1']);
assert.ok(html['vositalar/ielts-cefr-multilevel.html']!.includes('65–75') && html['vositalar/ielts-cefr-multilevel.html']!.includes('ielts.org'), 'manbali ma’lumot');
assert.ok(html['sitemap.xml']!.includes('/vositalar/ielts-band-kalkulyator'));
console.log('seo gen.test: OK');
