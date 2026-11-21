// Build tekshiruvi: "boot" bo'lagi (React + til tizimi) "app" bo'lagidan hech narsa import qilmasligi kerak.
// Aks holda app bo'lagi til lug'ati tayyor bo'lishidan oldin ishga tushadi va sahifa oq ekran bilan yiqiladi
// ("Cannot access 'dict' before initialization"). npm run build'dan keyin ishlaydi (test:ci tartibi).
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const dir = 'dist/assets';
if (!existsSync(dir)) { console.log('chunks.test: SKIP (dist yo‘q — avval npm run build)'); process.exit(0); }
const files = readdirSync(dir);
const boot = files.filter((f) => /^boot-.*\.js$/.test(f));
assert.ok(boot.length >= 1, 'boot bo‘lagi bor');
for (const f of boot) {
  const src = readFileSync(`${dir}/${f}`, 'utf8');
  const bad = [...src.matchAll(/from\s*["']\.\/(app-[\w-]+\.js)["']|import\s*["']\.\/(app-[\w-]+\.js)["']/g)].map((m) => m[1] ?? m[2]);
  assert.deepEqual(bad, [], `${f} app bo‘lagini statik import qilmasligi kerak (circular → oq ekran)`);
}
// Lazy bo'laklar (xodimlar paneli, sertifikat): app ularni statik import qilsa — bo'lish befoyda (har doim yuklanadi)
for (const f of files.filter((x) => /^app-.*\.js$/.test(x))) {
  const src = readFileSync(`${dir}/${f}`, 'utf8');
  const eager = [...src.matchAll(/(?:from|import)\s*["']\.\/((?:staff|cert)-[\w-]+\.js)["']/g)].map((m) => m[1]);
  assert.deepEqual(eager, [], `${f} lazy bo'laklarni statik import qilmasligi kerak`);
}
// Javob kalitlari (src/content/readingTests.ts, listeningTests.ts) faqat serverda: brauzer fayllarida "evidence"/"answers" bo'lmasligi kerak
const { readingTests } = await import('../../src/content/readingTests');
const { listeningTests } = await import('../../src/content/listeningTests');
const all = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(`${dir}/${f}`, 'utf8')).join('\n');
const evid = [...readingTests, ...listeningTests].flatMap((t) => [...(t.questions ?? []), ...((t as { sections?: { questions: typeof t.questions }[] }).sections ?? []).flatMap((s) => s.questions)])
  .map((q) => (q as { evidence?: string } | undefined)?.evidence).filter((e): e is string => typeof e === 'string' && e.length > 30);
assert.ok(evid.length > 50, 'tekshirish uchun yetarli dalil matni bor');
const leaked = evid.filter((e) => all.includes(JSON.stringify(e).slice(1, -1)));
assert.deepEqual(leaked.slice(0, 3), [], `javob dalillari brauzer bundle'iga tushgan (${leaked.length} ta)`);
console.log('chunks.test: OK');
