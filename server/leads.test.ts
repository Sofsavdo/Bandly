import assert from 'node:assert/strict';
import { createDb, join } from './db';
import { grant } from './payments';
import { ensureLeadsTable, hasLead, listLeads, normalizePhone, saveLead, saveTelegramContact, updateLead } from './leads';

assert.equal(normalizePhone('90 123 45 67'), '+998901234567');
assert.equal(normalizePhone('+998 (90) 123-45-67'), '+998901234567');
assert.equal(normalizePhone('998901234567'), '+998901234567');
assert.equal(normalizePhone('+7 701 123 45 67'), '+77011234567', 'xalqaro raqam');
assert.equal(normalizePhone('12345'), null);
assert.equal(normalizePhone('abc'), null);

const db = createDb(); ensureLeadsTable(db);
const T = Date.UTC(2026, 10, 21);
join(db, 'Aziza', T); join(db, 'Bek', T + 1);
const id = (n: string) => (db.prepare('SELECT id FROM players WHERE nickname = ?').get(n) as { id: number }).id;

assert.throws(() => saveLead(db, id('Aziza'), { phone: '901234567', consent: false, source: 'form' }), /Rozilik/, 'roziliksiz saqlanmaydi');
assert.throws(() => saveLead(db, id('Aziza'), { phone: '12', consent: true, source: 'form' }), /noto/);
saveLead(db, id('Aziza'), { phone: '90 123 45 67', consent: true, source: 'form', goal: 'ielts', level: 'B1', minutes: 20 }, T);
assert.ok(hasLead(db, id('Aziza')) && !hasLead(db, id('Bek')));
updateLead(db, id('Aziza'), { status: 'interested', note: 'Kechqurun qo‘ng‘iroq <qiling>' }, 'operator1', T + 5);
saveLead(db, id('Aziza'), { phone: '+998911112233', consent: true, source: 'form' }, T + 10); // qayta yuborish
let rows = listLeads(db, null, 200, T + 20);
assert.equal(rows.length, 1);
assert.deepEqual({ phone: rows[0]!.phone, goal: rows[0]!.goal, status: rows[0]!.status, note: rows[0]!.note, by: rows[0]!.handledBy }, { phone: '+998911112233', goal: 'ielts', status: 'interested', note: 'Kechqurun qo‘ng‘iroq  qiling', by: 'operator1' }, 'holat va izoh saqlanadi, maqsad o‘chmaydi');
assert.throws(() => updateLead(db, id('Aziza'), { status: 'hack' }, 'x'), /holat/);

// Telegram kontakti: faqat o'z raqami va ulangan hisob
db.prepare('UPDATE players SET tg_id = 555 WHERE nickname = ?').run('Bek');
assert.equal(saveTelegramContact(db, 555, { phone_number: '998935554433', user_id: 777 }), false, 'birovning kontakti qabul qilinmaydi');
assert.equal(saveTelegramContact(db, 999, { phone_number: '998935554433', user_id: 999 }), false, 'hisob ulanmagan');
assert.equal(saveTelegramContact(db, 555, { phone_number: '998935554433', user_id: 555 }, T + 30), true);
grant(db, 'Bek', 'all', 30, T);
rows = listLeads(db, null, 200, T + 40);
assert.equal(rows[0]!.nickname, 'Bek', 'eng yangisi birinchi');
assert.equal(rows[0]!.phone, '+998935554433'); assert.equal(rows[0]!.source, 'telegram'); assert.ok(rows[0]!.subscribedUntil! > T);
assert.equal(listLeads(db, 'interested').length, 1);
// To'langan to'lov holati bazada 'success' (payments.applyResult) — ro'yxat shuni sanaydi
db.prepare("INSERT INTO payments (id, player_id, track, days, amount, status, created_at, paid_at) VALUES ('pay1', ?, 'all', 30, 129000, 'success', ?, ?)").run(id('Bek'), T, T);
db.prepare("INSERT INTO payments (id, player_id, track, days, amount, status, created_at) VALUES ('pay2', ?, 'all', 30, 129000, 'cancelled', ?)").run(id('Bek'), T);
assert.equal(listLeads(db, null, 200, T + 40).find((r) => r.nickname === 'Bek')!.paidCount, 1, 'faqat muvaffaqiyatli to‘lov');
console.log('leads: OK');
