import assert from 'node:assert/strict';
import { advanceQueue, bossHp, lessonStars, listenRound, pairsRound, reaction, seededShuffle } from './lessonGame';

assert.equal(lessonStars(1, false), 0);
assert.equal(lessonStars(0.8, true), 1);
assert.equal(lessonStars(0.9, true), 2);
assert.equal(lessonStars(1, true), 3);

// barqaror aralashtirish: bir xil urug' — bir xil natija, elementlar yo'qolmaydi
const a = seededShuffle([1, 2, 3, 4, 5, 6], 'x');
assert.deepEqual(a, seededShuffle([1, 2, 3, 4, 5, 6], 'x'));
assert.deepEqual([...a].sort(), [1, 2, 3, 4, 5, 6]);

// eshit va tanla
const ex = [{ en: 'I am here.', uz: 'Men shu yerdaman.' }, { en: 'She is tall.', uz: 'U baland.' }, { en: 'We are friends.', uz: 'Biz do‘stmiz.' }, { en: 'It is cold.', uz: 'Sovuq.' }];
assert.deepEqual(listenRound({ id: 'l', examples: ex.slice(0, 2) }), []);
const lr = listenRound({ id: 'l', examples: ex });
assert.equal(lr.length, 3);
for (const it of lr) {
  assert.equal(it.options.length, 3);
  assert.equal(new Set(it.options).size, 3);
  assert.equal(it.options[it.answer], ex.find((e) => e.en === it.en)!.uz, 'to‘g‘ri javob — o‘sha gapning tarjimasi');
}

// juftini top
assert.equal(pairsRound({ id: 'l', vocab: [{ en: 'a', uz: 'b' }] }), null);
const pr = pairsRound({ id: 'l', vocab: [{ en: 'cat', uz: 'mushuk' }, { en: 'dog', uz: 'it' }, { en: 'Dog', uz: 'it' }, { en: 'bird', uz: 'qush' }] })!;
assert.equal(pr.left.length, 3, 'takror so‘z bir marta');
assert.deepEqual(pr.left.map((x) => x.id).sort(), pr.right.map((x) => x.id).sort());

// xato qaytadi — bir marta
let q = advanceQueue([0, 1, 2], false, new Set());
assert.deepEqual(q.queue, [1, 2, 0]);
q = advanceQueue(q.queue, true, q.retried); assert.deepEqual(q.queue, [2, 0]);
q = advanceQueue(q.queue, true, q.retried); assert.deepEqual(q.queue, [0]);
q = advanceQueue(q.queue, false, q.retried); assert.deepEqual(q.queue, [], 'ikkinchi marta xato — qaytmaydi (cheksiz aylanmaydi)');
assert.deepEqual(advanceQueue([], true, new Set()).queue, []);

assert.equal(bossHp(5, 0), 100); assert.equal(bossHp(5, 5), 0); assert.equal(bossHp(4, 1), 75); assert.equal(bossHp(0, 0), 0);
assert.notEqual(reaction(true, 0), reaction(true, 1));
assert.ok(reaction(false, -1).length > 0);
console.log('lessonGame.test: OK');
