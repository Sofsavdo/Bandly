import assert from 'node:assert/strict';
import { byToken, createDb, join, loginTelegram } from './db';
import { REF_XP, attachReferral, isRefCode, maybeRewardReferral, refCodeOf, refStats } from './referral';
import { awardXp } from './xp';
import { handleUpdate } from './telegram';

const db = createDb();
const T = Date.UTC(2026, 10, 17, 8);
const host = byToken(db, join(db, 'Ustoz', T).token);
const code = refCodeOf(db, host.id);
assert.ok(isRefCode(code)); assert.equal(refCodeOf(db, host.id), code, 'kod barqaror');

// Yangi Telegram hisobi kod bilan bog'lanadi; o'zini taklif qila olmaydi; ikkinchi marta bog'lanmaydi
const guest = byToken(db, loginTelegram(db, 5001, 'Mehmon', undefined, T).token);
assert.equal(attachReferral(db, guest.id, code), true);
assert.equal(attachReferral(db, guest.id, code), false);
assert.equal(attachReferral(db, host.id, code), false);
assert.equal(attachReferral(db, guest.id, 'BAD!!'), false);
assert.deepEqual({ ...refStats(db, host.id), code: 'x' }, { code: 'x', invited: 1, activated: 0, xpEach: REF_XP });

// O'yin o'ynash mukofot bermaydi; birinchi dars — ikkalasiga XP, faqat bir marta
const xp = (id: number) => (db.prepare('SELECT COALESCE(SUM(accepted),0) AS s FROM xp_events WHERE player_id = ?').get(id) as { s: number }).s;
awardXp(db, guest.id, 'game-000001', 'game', 20, T);
assert.equal(maybeRewardReferral(db, guest.id, T), false);
awardXp(db, guest.id, 'lesson-000001', 'lesson', 30, T);
const h0 = xp(host.id);
assert.equal(maybeRewardReferral(db, guest.id, T), true);
assert.equal(maybeRewardReferral(db, guest.id, T), false);
assert.equal(xp(host.id) - h0, REF_XP);
assert.equal(refStats(db, host.id).activated, 1);

// Telegram: /start ref_KOD — ilova tugmalari havolasida kod bor
const rep = handleUpdate({ message: { chat: { id: 7, type: 'private' }, from: { id: 7 }, text: `/start ref_${code}` } }, 'https://app.example');
assert.match(JSON.stringify(rep), new RegExp(`ref=${code}`));
console.log('referral: OK');
