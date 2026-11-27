import assert from 'node:assert/strict';
import { LEAD0, LEAD_MAX, LEAD_STEP, makeResampler, planChunk, startLead } from './liveCall';

// 16 kHz ga o'tkazuvchi: past chastota saqlanadi, 8 kHz dan yuqori (aliasing) kuchli kesiladi, kadrlarga bo'lib berilsa ham natija bir xil
const tone = (hz: number, rate: number, sec: number, amp = 0.5): Float32Array => Float32Array.from({ length: Math.round(rate * sec) }, (_, i) => amp * Math.sin((2 * Math.PI * hz * i) / rate));
const rmsOf = (a: Int16Array, from = 200): number => { let s = 0, n = 0; for (let i = from; i < a.length - 50; i++) { const v = a[i]! / 32768; s += v * v; n++; } return Math.sqrt(s / Math.max(1, n)); };

for (const rate of [48000, 44100, 32000, 16000]) {
  const r = makeResampler(rate);
  const lo = r.process(tone(1000, rate, 0.5)); r.reset();
  assert.ok(Math.abs(lo.length - 8000) <= 20, `${rate}: uzunlik ${lo.length}`);
  assert.ok(Math.abs(rmsOf(lo) - 0.5 / Math.SQRT2) < 0.03, `${rate}: 1 kHz amplitudasi saqlanadi (${rmsOf(lo).toFixed(3)})`);
  if (rate > 16000) {
    const hi = r.process(tone(rate === 32000 ? 12000 : 12000, rate, 0.5)); r.reset();
    assert.ok(rmsOf(hi) < 0.02, `${rate}: 12 kHz (aliasing) bostirildi (${rmsOf(hi).toFixed(4)})`);
  }
}
// Kadrlab (128 namuna) berilsa ham, butun berilgandek natija (holat kadrlar orasida saqlanadi)
{
  const whole = makeResampler(44100), parts = makeResampler(44100);
  const x = tone(700, 44100, 0.3);
  const a = whole.process(x); const chunks: number[] = [];
  for (let i = 0; i < x.length; i += 128) chunks.push(...parts.process(x.subarray(i, i + 128)));
  assert.ok(Math.abs(a.length - chunks.length) <= 2, `${a.length} vs ${chunks.length}`);
  let maxDiff = 0; for (let i = 100; i < Math.min(a.length, chunks.length) - 10; i++) maxDiff = Math.max(maxDiff, Math.abs(a[i]! - chunks[i]!) / 32768);
  assert.ok(maxDiff < 0.002, `kadrlab farq ${maxDiff}`);
}
// Ustoz ovozi bo'laklari (egasi, 2026-11-27: "gapirayotganida uzilib gapiryapti"): javob boshida bufer, navbatdagi bo'lak oldingisining orqasidan,
// javob o'rtasida ovoz tugab qolsa — uzilish sanaladi va bufer oshadi (LEAD_MAX dan oshmaydi)
{
  let p = planChunk(10, 0, LEAD0, false);
  assert.deepEqual(p, { at: 10 + LEAD0, underrun: false, lead: LEAD0 }, 'javob boshi: bufer bilan');
  p = planChunk(10.05, 10.5, LEAD0, true);
  assert.deepEqual(p, { at: 10.5, underrun: false, lead: LEAD0 }, 'navbatdagi bo‘lak — uzluksiz');
  p = planChunk(11, 10.9, LEAD0, true);
  assert.equal(p.underrun, true, 'javob o‘rtasida kechikdi — uzilish'); assert.ok(Math.abs(p.lead - (LEAD0 + LEAD_STEP)) < 1e-9, 'bufer oshdi'); assert.ok(Math.abs(p.at - (11 + p.lead)) < 1e-9);
  let l = LEAD0; for (let i = 0; i < 20; i++) l = planChunk(20 + i, 0, l, true).lead;
  assert.equal(l, LEAD_MAX, 'bufer chegaradan oshmaydi');
  assert.equal(LEAD_MAX, 1.2, 'egasi: bufer 1,2 s gacha');
  // Keyingi qo'ng'iroq: o'rganilgan bufer bir qadam kichikroqdan boshlanadi; yomon qiymat — LEAD0
  assert.equal(startLead(null), LEAD0); assert.equal(startLead('abc'), LEAD0); assert.equal(startLead('0.2'), LEAD0);
  assert.ok(Math.abs(startLead('1.2') - (1.2 - LEAD_STEP)) < 1e-9); assert.equal(startLead('99'), LEAD_MAX); assert.equal(startLead('-5'), LEAD0);
  assert.equal(planChunk(30, 29, LEAD_MAX, false).underrun, false, 'yangi javob boshi uzilish emas');
}
console.log('liveCall (resampler, ovoz buferi): OK');
