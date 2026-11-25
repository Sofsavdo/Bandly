import assert from 'node:assert/strict';
import { avatarLook } from './AiAvatar';

// Holat → shakl va rang: navbat sizda (yashil tabletka), tinglash (ko'k tabletka), o'ylash (bulut), xato (pushti tabletka)
assert.deepEqual(avatarLook('idle'), { shape: 'pill', mood: 'calm', color: '#2DD4BF' });
assert.deepEqual(avatarLook('listening', 'angry'), { shape: 'pill', mood: 'attentive', color: '#38BDF8' }, 'tinglayotganda ustoz hissiyoti ko‘rsatilmaydi');
assert.deepEqual(avatarLook('thinking'), { shape: 'cloud', mood: 'thinking', color: '#A5B4FC' });
assert.equal(avatarLook('error').mood, 'error');
// Gapirayotganda hissiyotga qarab: nutq pufagi / oval / yurak / pufak / qizil tabletka / bulut
const sp = (e: Parameters<typeof avatarLook>[1]) => avatarLook('speaking', e);
assert.deepEqual([sp('neutral').shape, sp('neutral').mood], ['bubble', 'talk']);
assert.deepEqual([sp('happy').shape, sp('happy').mood], ['egg', 'happy']);
assert.deepEqual([sp('impressed').shape, sp('impressed').mood], ['heart', 'love'], 'iliq maqtov — yurak');
assert.deepEqual([sp('laugh').shape, sp('laugh').mood], ['bubble', 'laugh']);
assert.deepEqual([sp('angry').shape, sp('angry').mood], ['pill', 'angry']);
assert.deepEqual([sp('disappointed').shape, sp('disappointed').mood], ['cloud', 'sad']);
assert.equal(sp('angry').color, '#EF4444');
// Barcha hissiyotlar uchun ko'rinish bor (yangi hissiyot qo'shilsa — shu yerda ham)
for (const e of ['neutral', 'happy', 'laugh', 'angry', 'disappointed', 'impressed', 'serious', 'sarcastic'] as const) { const l = sp(e); assert.ok(l.shape && l.mood && /^#[0-9A-F]{6}$/i.test(l.color), e); }
assert.equal(sp('serious').mood, 'stern', 'jiddiy va kinoya — alohida yuz');
assert.equal(sp('sarcastic').mood, 'smug');

// 2026-11-25 (egasi: "yuz ifodalari sayoz, faqat ranglar bilan"): har hissiyotning o'z ko'zi, qoshi, og'zi va belgilari bor
{
  const { createElement: h } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { AiAvatar } = await import('./AiAvatar');
  const face = (e: Parameters<typeof avatarLook>[1], level = 0.6) => renderToStaticMarkup(h(AiAvatar, { phase: 'speaking', emotion: e, level }));
  const inner = (html: string) => html.replace(/<path class="av-shape[^>]*>/g, '').replace(/style="[^"]*"/g, '').replace(/class="ai-avatar[^"]*"/, '');
  const all = (['neutral', 'happy', 'laugh', 'angry', 'disappointed', 'impressed', 'serious', 'sarcastic'] as const).map((e) => inner(face(e)));
  assert.equal(new Set(all).size, all.length, 'har hissiyotda yuz chizmasi boshqacha (faqat rang emas)');
  for (const f of all) assert.ok(f.includes('av-brow-l') && f.includes('av-cheek'), 'qosh va yonoq har doim bor');
  assert.ok(face('angry').includes('av-teeth') && face('angry').includes('av-vein') && face('angry').includes('av-steam'), 'jahl: tish, tomir, bug‘');
  assert.ok(face('laugh').includes('av-tongue') && face('laugh').includes('av-joy'), 'kulgi: katta og‘iz, til, quvonch yoshi');
  assert.ok(face('impressed').includes('av-heart-eye') && face('impressed').includes('fx-heart'), 'maqtov: yurak ko‘zlar');
  assert.ok(face('disappointed').includes('av-tear'), 'hafsala: ko‘z yoshi');
  // 2026-11-25 (egasi: "jahl chiqsa bug', olov — ekrandan emas, yuz qismidan; ko'z yosh, hafsalani bildiruvchi elementlar")
  assert.ok(face('angry').includes('fx-flame') && face('angry').includes('emo-fx behind') && face('angry').includes('fx-steam'), 'jahl: yuz ortida olov, boshdan bug‘');
  assert.ok(face('disappointed').includes('fx-cloud') && face('disappointed').includes('fx-rain') && (face('disappointed').match(/av-stream/g) ?? []).length === 2, 'hafsala: yomg‘ir buluti, ikki ko‘zdan yosh');
  // og'iz ovoz balandligi bilan ochiladi
  assert.notEqual(inner(face('neutral', 0)), inner(face('neutral', 1)), 'og‘iz ovozga qarab ochiladi');
  assert.notEqual(inner(face('angry', 0)), inner(face('angry', 1)));
  // gapirmayotganda hissiyot ko'rsatilmaydi (tinglash — diqqatli yuz)
  assert.ok(!renderToStaticMarkup(h(AiAvatar, { phase: 'listening', emotion: 'angry', level: 0.5 })).includes('av-vein'));
}
console.log('aiAvatar: OK');
