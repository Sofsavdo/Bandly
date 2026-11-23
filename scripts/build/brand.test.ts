// Rebrend tekshiruvi: foydalanuvchiga ko'rinadigan matnlarda eski "Bandly"/"Bandi" nomi qolmagan; logo, favicon, PWA fayllari joyida.
// Ichki texnik kalitlar (bandly.* localStorage, persona id 'bandi', /data/bandly.sqlite, bandly-<UTC>.sqlite zaxiralar) ataylab o'zgartirilmagan — eski ma'lumot buzilmasin.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = [...walk('src'), ...walk('server'), 'index.html', ...walk('public/vositalar'), ...walk('public/ru'), 'scripts/seo/gen.ts'].filter((f) => /\.(tsx?|html|css)$/.test(f) && !/\.test\.ts$/.test(f));
const bad: string[] = [];
for (const f of files) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    // HTML teglar olib tashlanadi: "Band<b>ly</b>" ham ekranda "Bandly" bo'lib ko'rinadi
    const visible = line.replace(/<\/?[a-z][^>]*>/gi, '').replace(/'bandi'|bandly[.\-\w]*/g, '');
    if (/\bBandly\b|\bBandi\b/.test(visible)) bad.push(`${f}:${i + 1}: ${line.trim().slice(0, 100)}`);
  });
}
assert.deepEqual(bad, [], `eski brend nomi qolgan:\n${bad.join('\n')}`);

// Hujjatlar (README, DEPLOY, docs/**): mahsulot nomi "Sellzen". Faqat tashqi identifikatorlar ruxsat: GitHub repo Sofsavdo/Bandly,
// Telegram bot @Bandly_robot (BotFather'da nom o'zgarmaydi). "Bandi" — eski maskot nomi faqat tarixiy audit hujjatlarida yoki "formerly/then called" bilan.
const { execFileSync } = await import('node:child_process');
const mds = execFileSync('git', ['ls-files', '*.md']).toString().split('\n').filter((f) => f && !f.startsWith('plugins/'));
const badDocs: string[] = [];
for (const f of mds) readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
  const t = line.replace(/Sofsavdo\/Bandly|Bandly_robot|\/home\/user\/Bandly|avvalgi nomi Bandly|formerly Bandly/g, '');
  if (/\bBandly\b|\bBANDLY\b/.test(t)) badDocs.push(`${f}:${i + 1}: Bandly`);
  if (!f.startsWith('docs/audit/') && /\bBandi\b/.test(t.replace(/formerly “Bandi”|then called Bandi/g, ''))) badDocs.push(`${f}:${i + 1}: Bandi`);
});
assert.deepEqual(badDocs, [], `hujjatlarda eski brend:\n${badDocs.join('\n')}`);

// Rebrenddan keyin o'zgartirilgan ichki nomlar qaytmasin (CSS, worklet, Telegram callback, to'lov hodisasi, TTS user-agent)
const code = files.map((f) => readFileSync(f, 'utf8')).join('\n');
for (const old of ['bandlyTgAuth', 'bandly-mic', 'BandlyMic', 'bandly:pay', 'bandly-tts', '.bandi-wrap', 'bandi-wrap']) assert.ok(!code.includes(old), `eski ichki nom qaytdi: ${old}`);
for (const f of ['public/favicon.svg', 'public/favicon-16.png', 'public/favicon-32.png', 'public/apple-touch-icon.png', 'public/manifest.webmanifest', 'public/brand/icon-192.png', 'public/brand/icon-512.png', 'public/brand/icon-maskable-512.png', 'public/brand/og-image.png', 'public/brand/sellzen-logo-light.svg', 'public/brand/sellzen-logo-dark.svg'])
  assert.ok(existsSync(f), `brend fayli yo‘q: ${f}`);
const m = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as { name: string; short_name: string; start_url: string; icons: { sizes: string }[] };
assert.equal(m.short_name, 'Sellzen'); assert.ok(m.icons.some((i) => i.sizes === '192x192') && m.icons.some((i) => i.sizes === '512x512'));
const html = readFileSync('index.html', 'utf8');
assert.ok(html.includes('<link rel="canonical" href="https://www.sellzen.uz/"') /* asosiy domen = PUBLIC_URL (www): Telegram webhook va Mini App shu yerda */ && html.includes('og:image') && html.includes('manifest.webmanifest'), 'SEO/OG/manifest');
assert.ok(!/railway\.app/.test(html + readFileSync('public/sitemap.xml', 'utf8') + readFileSync('public/robots.txt', 'utf8')), 'eski domen qolmagan');
console.log('brand.test: OK');
