import assert from 'node:assert/strict';
import { UZ_MULTILEVEL as F } from './examFormats';
import { checkWriting } from '../lib/lessons';

assert.deepEqual(F.sections.map((s) => s.minutes.value), [45, 60, 60, 15], 'official timings (VM 73-son, 22-band)');
assert.ok(F.sections.every((s) => s.items.verified && s.minutes.verified && s.items.source), 'every shown field is verified with a source');
assert.deepEqual(F.scoring.value.cutoffs.map((c) => c.range), ['65–75', '51–64', '38–50', '1–37']);
assert.ok(F.sources.every((s) => /^https:\/\//.test(s.url)) && F.notesUz.length > 0);
// word ranges are enforced by the writing checker
const t = { promptUz: 'x', minWords: 100, maxWords: 150, require: [], model: '' };
const words = (n: number) => Array.from({ length: n }, (_, i) => (i % 10 === 9 ? 'end.' : 'word')).join(' ');
assert.equal(checkWriting(t, words(120)).passed, true);
assert.equal(checkWriting(t, words(160)).tooLong, true); assert.equal(checkWriting(t, words(160)).passed, false);
assert.equal(checkWriting(t, words(90)).enoughWords, false);
console.log('examFormats.test: OK');
