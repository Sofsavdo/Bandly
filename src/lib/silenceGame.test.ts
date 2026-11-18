import assert from 'node:assert/strict';
import { LEVELS, BRICKS_PER_FLOOR, LINKER_BONUS, ROUND_MS, TOPICS, bricksOf, checkFall, countLinkers, countWords, floorsOf, pickTopic, reaction, result, score, tier, wobble } from './silenceGame';

// O'z mexanikamiz: boshqa o'yinning vaqtlari (12/10/5/2.5 s, 60 s) ishlatilmaydi
assert.deepEqual(LEVELS.map((l) => l.silenceMs).slice(1), [8_000, 6_000, 4_000]);
assert.equal(ROUND_MS, 90_000);
assert.ok(LEVELS.every((l, i) => i === 0 || l.goal > LEVELS[i - 1]!.goal), 'qiyinroq daraja — balandroq maqsad');

assert.equal(countWords("I'm here, and it’s fine."), 5);
assert.equal(countLinkers('I like it because it is cheap. However, for example, the bus is slow.'), 3);
assert.equal(countLinkers('For instance, on the other hand'), 2, 'uzun iboralar bitta sanaladi');
assert.equal(countLinkers('the bus is slow'), 0);
const b = bricksOf('I like it because it is cheap');
assert.equal(b.words, 7); assert.equal(b.linkers, 1); assert.equal(b.bricks, 7 + (LINKER_BONUS - 1));

assert.equal(floorsOf(BRICKS_PER_FLOOR * 4, 0), 4); assert.equal(floorsOf(BRICKS_PER_FLOOR * 4, 1), 3); assert.equal(floorsOf(3, 5), 0, 'manfiy emas');
assert.equal(wobble(3_000, 6_000), 0.5); assert.equal(wobble(99_000, 6_000), 1); assert.equal(wobble(99_999, Number.POSITIVE_INFINITY), 0, 'bosimsiz rejim tebranmaydi');
assert.ok(checkFall(6_000, 6_000, 2)); assert.ok(!checkFall(5_999, 6_000, 2)); assert.ok(!checkFall(9_000, 6_000, 0), 'qavat bo‘lmasa qulamaydi');
assert.ok(!checkFall(1e9, Number.POSITIVE_INFINITY, 5), 'bosimsiz: qulash yo‘q');

const long = 'I think so because it is true. However I also like it. '.repeat(12);
const r = result('medium', ROUND_MS, long, 0);
assert.ok(r.floors >= LEVELS.find((l) => l.id === 'medium')!.goal, `${r.floors} qavat`); assert.ok(r.reachedGoal); assert.equal(tier(r), 'master');
const shaky = result('hard', 40_000, 'word '.repeat(40), 3);
assert.equal(shaky.floors, 5); assert.ok(!shaky.reachedGoal); assert.equal(tier(shaky), 'shaky');
assert.equal(tier(result('easy', 5_000, 'hello there', 0)), 'silent');
assert.ok(score(result('hard', ROUND_MS, long, 0)) > score(result('easy', ROUND_MS, long, 0)), 'qiyinroq daraja ko‘proq ball');
assert.notEqual(reaction(shaky, true), reaction(shaky, false)); assert.ok(reaction(shaky, false).length > 10);

assert.equal(pickTopic('A1', () => 0).en, TOPICS.filter((t) => t.band === 'low')[0]!.en);
assert.equal(pickTopic('C1', () => 0.99).en, TOPICS.filter((t) => t.band === 'high').at(-1)!.en);
assert.ok(TOPICS.some((t) => /plov|bazaar|mahalla|Navruz|wedding/i.test(t.en)), 'o‘zbek hayotidan mavzular');
console.log('silenceGame.test: OK');
