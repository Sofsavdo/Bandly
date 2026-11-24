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
console.log('aiAvatar: OK');
