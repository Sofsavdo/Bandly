import assert from 'node:assert/strict';
import { ensurePartnersTable, listApplications, normContact, normLink, publicTerms, setApplicationStatus, submitApplication } from './partners';
import { createRule, enableRule } from './creatorLedger';
import { createDb } from './db';

const db = createDb();
ensurePartnersTable(db);

// Havola va aloqa tekshiruvi
assert.equal(normLink('instagram.com/sellzen'), 'https://instagram.com/sellzen');
assert.equal(normLink('@sellzen_uz'), '@sellzen_uz');
assert.equal(normLink('salom'), null);
assert.equal(normContact('@aziz_blog'), '@aziz_blog');
assert.equal(normContact('+998 90 123-45-67'), '+998901234567');
assert.equal(normContact('12'), null);

// Ariza: majburiy maydonlar, rozilik, takroriy ariza, spam chegarasi
const ok = { kind: 'blogger', name: 'Aziz', link: 'tiktok.com/@aziz', audience: '10k-100k', contact: '@aziz_blog', consent: true };
assert.throws(() => submitApplication(db, { ...ok, consent: false }, { ip: '1' }), /rozilik/);
assert.throws(() => submitApplication(db, { ...ok, link: 'x' }, { ip: '1' }), /havola/);
assert.throws(() => submitApplication(db, { ...ok, kind: 'boss' }, { ip: '1' }), /Kim/);
const a1 = submitApplication(db, ok, { ip: '1' }, 1000);
assert.equal(a1.duplicate, false);
assert.deepEqual(submitApplication(db, ok, { ip: '1' }, 2000), { id: a1.id, duplicate: true }, 'bir xil aloqa — takroriy ariza yaratilmaydi');
for (let i = 0; i < 5; i++) submitApplication(db, { ...ok, contact: `+99890000000${i}` }, { ip: '9' }, 3000 + i);
assert.throws(() => submitApplication(db, { ...ok, contact: '+998900000009' }, { ip: '9' }, 3100), /Juda ko/);
const list = listApplications(db);
assert.equal(list.length, 6); assert.equal(list.at(-1)!.name, 'Aziz'); assert.equal(list.at(-1)!.status, 'new');
setApplicationStatus(db, a1.id, 'approved', 'Hamkor rolini berdik');
assert.equal(listApplications(db, 'approved')[0]!.adminNote, 'Hamkor rolini berdik');
assert.throws(() => setApplicationStatus(db, a1.id, 'xyz', ''), /Holat/);

// Ochiq shartlar: faqat yoqilgan (egasi tasdiqlagan) qoidalar ko'rsatiladi; summa so'mda
assert.deepEqual(publicTerms(db, Date.now(), {}).rules, [], 'qoida yo‘q — summa va’da qilinmaydi');
const r = createRule(db, 1, { name: 'Obuna foizi', kind: 'paid_pct', pct: 20, capPerCreatorMinor: 100_000_000, budgetMinor: 1_000_000_000 });
assert.equal(publicTerms(db, Date.now(), {}).rules.length, 0, 'qoralama qoida ko‘rinmaydi');
enableRule(db, 1, r.id, { confirmOwnerApproved: true });
const v = createRule(db, 1, { name: 'Ko‘rishlar', kind: 'verified_views_per_1k', amountMinor: 1_500_000, capPerItemMinor: 50_000_000, capPerCreatorMinor: 100_000_000, budgetMinor: 1_000_000_000 });
enableRule(db, 1, v.id, { confirmOwnerApproved: true });
const t = publicTerms(db, Date.now(), { REF_XP: '100', REF_PLAN_DAYS: '7' });
assert.deepEqual(t.rules.map((x) => [x.kind, x.pct, x.som]).sort(), [['paid_pct', 20, null], ['verified_views_per_1k', null, 15000]]);
assert.deepEqual(t.invite, { xp: 100, days: 7 });
console.log('partners: OK');
