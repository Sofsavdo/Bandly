// Ovoz qamrovi hisoboti (kredit sarflamaydi): ilovada ovozlanadigan inglizcha matnlardan nechtasiga ElevenLabs fayli tayyor.
// Ishlatish: npx tsx scripts/audio/coverage.ts [--strict]   (--strict: yetishmayotgan bo'lsa chiqish kodi 1)
import { existsSync, readFileSync } from 'node:fs';
import { clipInventory, listeningInventory } from './inventory';

const R = new URL('../../public/audio/', import.meta.url).pathname;
const m = JSON.parse(readFileSync(`${R}manifest.json`, 'utf8')) as { clips: string[]; listening: Record<string, { file: string; provider?: string }> };
const inManifest = new Set(m.clips);
const by: Record<string, { total: number; missing: number; missChars: number; chars: number }> = {};
let missing = 0, missChars = 0;
for (const c of clipInventory()) {
  const b = (by[c.category] ??= { total: 0, missing: 0, missChars: 0, chars: 0 });
  b.total++; b.chars += c.text.length;
  if (!(inManifest.has(c.key) && existsSync(`${R}clips/${c.key}.mp3`))) { b.missing++; b.missChars += c.text.length; missing++; missChars += c.text.length; }
}
for (const [k, b] of Object.entries(by)) console.log(k.padEnd(16), `jami ${String(b.total).padStart(5)}  yetishmaydi ${String(b.missing).padStart(5)}  (${b.missChars} belgi)`);
const lis = listeningInventory();
const lisMissing = lis.filter((l) => !(m.listening[l.id]?.provider === 'elevenlabs' && existsSync(`${R}listening/${l.id}.mp3`)));
console.log('listening'.padEnd(16), `jami ${String(lis.length).padStart(5)}  yetishmaydi ${String(lisMissing.length).padStart(5)}`);
console.log(`\nYetishmaydi: ${missing} klip, ${missChars} belgi (≈${Math.ceil(missChars * 0.3)}–${Math.ceil(missChars * 0.5)} kredit) + ${lisMissing.length} listening`);
if (process.argv.includes('--strict') && (missing || lisMissing.length)) process.exit(1);
