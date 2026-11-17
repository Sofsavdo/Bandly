import assert from 'node:assert/strict';
import { byToken, createDb, join, setRole } from './db';
import { attachReferral, refCodeOf } from './referral';
import { creatorStats, creatorsOverview } from './creator';

const db = createDb();
const NOW = Date.UTC(2026, 10, 17, 9);
const c = byToken(db, join(db, 'Blogger', NOW - 90 * 86_400_000).token);
setRole(db, 'Blogger', 'creator');
const code = refCodeOf(db, c.id);
const ids = ['Ali', 'Vali', 'Gani'].map((n, i) => { const p = byToken(db, join(db, n, NOW - (i + 1) * 86_400_000).token); attachReferral(db, p.id, code); return p.id; });
db.prepare('UPDATE players SET ref_rewarded = 1 WHERE id IN (?, ?)').run(ids[0]!, ids[1]!);
db.prepare("INSERT INTO payments (id, player_id, track, days, amount, status, created_at, paid_at) VALUES ('a', ?, 'all', 30, 129000, 'success', ?, ?), ('b', ?, 'exam', 30, 99000, 'cancelled', ?, NULL)").run(ids[0]!, NOW - 3600_000, NOW - 3600_000, ids[1]!, NOW);

const s = creatorStats(db, c.id, NOW, {});
assert.equal(s.invited, 3); assert.equal(s.invited30, 3); assert.equal(s.activated, 2);
assert.equal(s.payers, 1); assert.equal(s.revenue, 129000); assert.equal(s.revenue30, 129000);
assert.equal(s.commissionPct, null); assert.equal(s.commission, null, 'stavka o‘rnatilmagan — hisob-kitob yo‘q');
assert.equal(s.months.at(-1)!.revenue, 129000);
assert.equal(creatorStats(db, c.id, NOW, { CREATOR_COMMISSION_PCT: '20' }).commission, 25800);
assert.equal(creatorsOverview(db, NOW).length, 1);
console.log('creator: OK');
