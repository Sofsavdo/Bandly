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
console.log('chunks.test: OK');
