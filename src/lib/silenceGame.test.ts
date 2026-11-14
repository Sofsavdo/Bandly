import assert from 'node:assert/strict';
import { LEVELS, danger, result, score, tier, reaction, pickTopic, countWords, ROUND_MS, TOPICS } from './silenceGame';

assert.deepEqual(LEVELS.map((l) => l.silenceMs).slice(1), [12_000, 10_000, 5_000, 2_500], 'thresholds as specified (hypotheses)');
assert.equal(danger(5_000, 10_000), 0.5); assert.equal(danger(20_000, 10_000), 1); assert.equal(danger(-1, 10_000), 0);
assert.equal(danger(99_999, Number.POSITIVE_INFINITY), 0, 'relaxed mode never in danger');
assert.equal(countWords("I'm here, and it’s fine."), 5);
const full = result('hard', ROUND_MS, 'word '.repeat(100)); assert.ok(full.survived); assert.equal(full.wpm, 100); assert.equal(tier(full), 'fluent');
const early = result('hard', 20_000, 'word '.repeat(30)); assert.ok(!early.survived); assert.equal(early.wpm, 90); assert.equal(tier(early), 'tryhard');
assert.equal(tier(result('easy', 5_000, 'hello there')), 'silent');
assert.ok(result('relaxed', 10_000, 'x').survived, 'relaxed: no failure');
assert.ok(score(full) > score(result('easy', ROUND_MS, 'word '.repeat(100))), 'harder level scores more');
assert.equal(score(result('easy', ROUND_MS, '')), 50);
for (const t of ['silent', 'tryhard', 'solid', 'fluent'] as const) void t;
assert.notEqual(reaction(early, true), reaction(early, false)); assert.ok(reaction(early, false).length > 10);
assert.equal(pickTopic('A1', () => 0).en, TOPICS.filter((t) => t.band === 'low')[0]!.en);
assert.equal(pickTopic('C1', () => 0.99).en, TOPICS.filter((t) => t.band === 'high').at(-1)!.en);
console.log('silenceGame.test: OK');
