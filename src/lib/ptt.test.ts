import assert from 'node:assert/strict';
import { MIN_VOICED_MS, PTT_IDLE, TAP_MS, pttStep, tallyVoiced, type PttAction, type PttInput, type PttState } from './ptt';

const run = (events: PttInput[]): { state: PttState; actions: PttAction[] } => {
  let state = PTT_IDLE; const actions: PttAction[] = [];
  for (const e of events) { const [n, a] = pttStep(state, e); state = n; actions.push(a); }
  return { state, actions };
};

// Bosib turib gapirish: bosildi → start; qo'yib yuborildi → stop
{
  const r = run([{ type: 'down', at: 0 }, { type: 'up', at: 1800 }]);
  assert.deepEqual(r.actions, ['start', 'stop']); assert.equal(r.state.mode, 'idle');
}
// Klaviatura auto-repeat (Probel bosib turilganda "down" takrorlanadi): bitta start
{
  const r = run([{ type: 'down', at: 0 }, { type: 'down', at: 40 }, { type: 'down', at: 80 }, { type: 'up', at: 900 }]);
  assert.deepEqual(r.actions, ['start', null, null, 'stop']);
}
// Qisqa (tasodifiy) tegish — "tap": tinglash bekor, hech narsa yuborilmaydi; qulf rejimi yo'q (qo'l olinsa — har doim to'xtaydi)
{
  const r = run([{ type: 'down', at: 0 }, { type: 'up', at: TAP_MS - 1 }]);
  assert.deepEqual(r.actions, ['start', 'tap']); assert.equal(r.state.mode, 'idle');
  const r2 = run([{ type: 'down', at: 0 }, { type: 'up', at: 100 }, { type: 'down', at: 5000 }, { type: 'up', at: 7000 }]);
  assert.deepEqual(r2.actions, ['start', 'tap', 'start', 'stop'], 'keyingi bosish — yangi navbat');
}
// TAP_MS ning o'zi — hali qisqa emas (bosib turilgan)
assert.deepEqual(run([{ type: 'down', at: 0 }, { type: 'up', at: TAP_MS }]).actions, ['start', 'stop']);
// Bekor qilish (sahifa fonga o'tdi, barmoq ekrandan chiqdi): faqat yozuv bor bo'lsa stop
assert.deepEqual(run([{ type: 'cancel' }]).actions, [null]);
assert.deepEqual(run([{ type: 'down', at: 0 }, { type: 'cancel' }]).actions, ['start', 'stop']);
// Bosilmagan holatda "up" — hech narsa
assert.deepEqual(run([{ type: 'up', at: 10 }]).actions, [null]);

// Ovozli vaqt: faqat chegaradan baland kadrlar sanaladi
{
  let ms = 0;
  for (let i = 0; i < 100; i++) ms = tallyVoiced(ms, 0.004, 0.024, 2.7); // jimlik/shovqin
  assert.equal(ms, 0);
  for (let i = 0; i < 100; i++) ms = tallyVoiced(ms, 0.08, 0.024, 2.7); // gap
  assert.ok(ms >= MIN_VOICED_MS, `${ms}`);
}
console.log('ptt: OK');
