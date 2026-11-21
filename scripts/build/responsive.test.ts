// Mobil responsive himoyasi (2026-11-21 auditi): jadval sahifani yonga cho'zmasin, ekran balandligi sakramasin.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const tsx = walk('src').filter((f) => f.endsWith('.tsx'));
const bad: string[] = [];
for (const f of tsx) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/<table className="data/g)) {
    const before = s.slice(Math.max(0, m.index! - 60), m.index);
    if (!/className="table-scroll">\s*$/.test(before)) bad.push(`${f}: <table className="data"> table-scroll ichida emas`);
  }
}
assert.deepEqual(bad, [], `jadvallar mobilda sahifani cho'zadi:\n${bad.join('\n')}`);

// dvh manzil satri yashirinib-ko'ringanda balandlikni o'zgartiradi — ekran sakraydi; svh/vh ishlating
const css = walk('src').filter((f) => f.endsWith('.css')).map((f) => [f, readFileSync(f, 'utf8')] as const);
const dvh = css.flatMap(([f, s]) => s.split('\n').map((l, i) => [f, i + 1, l] as const).filter(([, , l]) => /\d+dvh/.test(l) && !/\/\*.*dvh.*\*\//.test(l)));
assert.deepEqual(dvh.map(([f, n]) => `${f}:${n}`), [], 'CSS da dvh ishlatilmasin');
console.log('responsive.test: OK');
