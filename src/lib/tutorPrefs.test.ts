// Ustoz sozlamalari (egasi, 2026-11-26): erkak/ayol ovoz, romantik (18+) va bolalar xarakteri, bolalar rejimi PIN bilan.
import assert from 'node:assert/strict';
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k), clear: () => mem.clear(), key: () => null, length: 0 } as Storage;
const S = await import('./store');

// Standart: erkak ovoz, yumshoq uslub
assert.equal(S.getProfile().tutorVoice ?? 'male', 'male');
assert.equal(S.liveStyle(), 0);
S.setTutorVoice('female'); assert.equal(S.getProfile().tutorVoice, 'female');

// Romantik — faqat 18+
S.setTutorChoice('romantic', false); assert.equal(S.liveStyle(), 0, '18+ siz romantik tanlanmaydi');
S.setPersona(0, true); S.setTutorChoice('romantic');
assert.equal(S.liveStyle(), 4); assert.equal(S.personaLevel(), 0, 'mashqlardagi hazil iboralari — muloyim');

// Jallod (18+) tanlangan, keyin bolalar rejimi yoqiladi: ustoz faqat bolalar xarakterida, 18+ amalda o'chiq
S.setPersona(3, true); assert.equal(S.liveStyle(), 3);
assert.equal(S.setKidsMode(true, '12a4'), false, 'PIN — 4 ta raqam');
assert.equal(S.setKidsMode(true, '2580'), true);
assert.equal(S.liveStyle(), 5, 'bolalar rejimi — bolalar xarakteri');
assert.equal(S.adultOn(), false, 'ota-onaning 18+ tasdig‘i bolaga o‘tmaydi');
assert.equal(S.personaLevel(), 0);
S.setPersona(3, true); S.setTutorChoice('romantic');
assert.equal(S.liveStyle(), 5, 'bolalar rejimida xarakterni o‘zgartirib bo‘lmaydi');
assert.ok(!JSON.stringify(S.getProfile()).includes('2580'), 'PIN ochiq saqlanmaydi');

// O'chirish — faqat to'g'ri PIN bilan
assert.equal(S.setKidsMode(false, '0000'), false); assert.equal(S.liveStyle(), 5);
assert.equal(S.setKidsMode(false, '2580'), true); assert.equal(S.liveStyle(), 3, 'rejim o‘chgach avvalgi xarakter qaytadi');
assert.equal(S.adultOn(), true);

// Bolalar xarakteri rejimsiz ham tanlanadi (ota-ona bola bilan birga)
S.setTutorChoice('kids'); assert.equal(S.liveStyle(), 5);
console.log('tutorPrefs: OK');
