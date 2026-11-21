// Rebrend tekshiruvi: foydalanuvchiga ko'rinadigan matnlarda eski "Bandly"/"Bandi" nomi qolmagan; logo, favicon, PWA fayllari joyida.
// Ichki texnik kalitlar (bandly.* localStorage, persona id 'bandi', BandlyMic worklet) ataylab o'zgartirilmagan — eski ma'lumot buzilmasin.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = [...walk('src'), ...walk('server'), 'index.html', ...walk('public/vositalar'), ...walk('public/ru'), 'scripts/seo/gen.ts'].filter((f) => /\.(tsx?|html|css)$/.test(f) && !/\.test\.ts$/.test(f));
const bad: string[] = [];
for (const f of files) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    // HTML teglar olib tashlanadi: "Band<b>ly</b>" ham ekranda "Bandly" bo'lib ko'rinadi
    const visible = line.replace(/<\/?[a-z][^>]*>/gi, '').replace(/class BandlyMic|BandlyMic\)|'bandi'|bandly[.\-\w]*/g, '');
    if (/\bBandly\b|\bBandi\b/.test(visible)) bad.push(`${f}:${i + 1}: ${line.trim().slice(0, 100)}`);
  });
}
assert.deepEqual(bad, [], `eski brend nomi qolgan:\n${bad.join('\n')}`);
for (const f of ['public/favicon.svg', 'public/favicon-16.png', 'public/favicon-32.png', 'public/apple-touch-icon.png', 'public/manifest.webmanifest', 'public/brand/icon-192.png', 'public/brand/icon-512.png', 'public/brand/icon-maskable-512.png', 'public/brand/og-image.png', 'public/brand/sellzen-logo-light.svg', 'public/brand/sellzen-logo-dark.svg'])
  assert.ok(existsSync(f), `brend fayli yo‘q: ${f}`);
const m = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as { name: string; short_name: string; start_url: string; icons: { sizes: string }[] };
assert.equal(m.short_name, 'Sellzen'); assert.ok(m.icons.some((i) => i.sizes === '192x192') && m.icons.some((i) => i.sizes === '512x512'));
const html = readFileSync('index.html', 'utf8');
assert.ok(html.includes('<link rel="canonical" href="https://sellzen.uz/"') && html.includes('og:image') && html.includes('manifest.webmanifest'), 'SEO/OG/manifest');
assert.ok(!/railway\.app/.test(html + readFileSync('public/sitemap.xml', 'utf8') + readFileSync('public/robots.txt', 'utf8')), 'eski domen qolmagan');
console.log('brand.test: OK');
