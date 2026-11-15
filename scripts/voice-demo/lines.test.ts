import assert from 'node:assert/strict';
import { ALLOWED_TAGS, DEMO_LINES, totalChars } from './lines';
import { elevenLabsFromEnv, isElModel } from '../../server/elevenlabs';

// Kalitsiz klient yaratilmaydi (fail-closed).
assert.equal(elevenLabsFromEnv({}), null);
assert.equal(elevenLabsFromEnv({ ELEVENLABS_API_KEY: '   ' }), null);
assert.ok(isElModel('eleven_v4') && isElModel('eleven_v4_turbo'));
assert.ok(!isElModel('eleven_multilingual_v2'));

// Gaplar: noyob id, qisqa, faqat ruxsat etilgan teglar.
assert.equal(new Set(DEMO_LINES.map((l) => l.id)).size, DEMO_LINES.length);
for (const l of DEMO_LINES) {
  assert.ok(l.text.length > 10 && l.text.length <= 300, l.id);
  for (const m of l.text.matchAll(/\[([^\]]+)\]/g)) assert.ok((ALLOWED_TAGS as readonly string[]).includes(m[1]), `${l.id}: ${m[1]}`);
}
assert.ok(totalChars() < 2000, 'demo bepul limitga sig‘ishi kerak');
console.log('voice-demo lines.test: OK');
