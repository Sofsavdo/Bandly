import assert from 'node:assert/strict';
import { byToken, createDb, join, weekStart } from './db';
import { DEMOTE, GROUP_SIZE, PROMOTE, TIERS, leagueView } from './league';
import { awardXp } from './xp';

const W0 = weekStart(Date.UTC(2026, 10, 18, 12)) + 3_600_000; // dushanba 01:00
const W1 = W0 + 7 * 86_400_000;
const db = createDb();
const ids: number[] = [];
for (let i = 0; i < 20; i++) ids.push(byToken(db, join(db, `Oquvchi${i}`, W0).token).id);

// XP olmagan o'quvchi ligaga kirmaydi
assert.equal(leagueView(db, ids[0]!, W0).joined, false);
// Hammasi XP oladi: i-o'quvchi (20 - i) * 10 XP
ids.forEach((id, i) => awardXp(db, id, `ev-${i}-a`, 'lesson', (20 - i) * 5, W0));
const v = leagueView(db, ids[0]!, W0);
assert.equal(v.joined, true); assert.equal(v.tierName, TIERS[0]); assert.equal(v.rows.length, 20);
assert.deepEqual(v.rows.slice(0, 2).map((r) => r.xp), [100, 95]);
assert.equal(v.rows.filter((r) => r.zone === 'up').length, PROMOTE);
assert.equal(v.rows.filter((r) => r.zone === 'down').length, 0, 'Bronzada pastga tushish yo‘q');
assert.ok(v.rows[0]!.me);

// Keyingi hafta: yuqori 7 — Kumushga ko'tariladi, qolganlar Bronzada
awardXp(db, ids[0]!, 'ev-0-b', 'lesson', 10, W1);
awardXp(db, ids[15]!, 'ev-15-b', 'lesson', 10, W1);
assert.equal(leagueView(db, ids[0]!, W1).tierName, TIERS[1]);
assert.equal(leagueView(db, ids[15]!, W1).tierName, TIERS[0]);
assert.equal(leagueView(db, ids[6]!, W1).tier, 1, 'XP olmagan holda ham natija ko‘rilganda hisoblanadi');
assert.equal(leagueView(db, ids[7]!, W1).tier, 0);
// Har darajada alohida guruh
assert.equal(leagueView(db, ids[0]!, W1).rows.length, 1);
// Guruh hajmi chegarasi
const many: number[] = []; for (let i = 0; i < GROUP_SIZE + 3; i++) many.push(byToken(db, join(db, `Kop${i}`, W1).token).id);
many.forEach((id, i) => awardXp(db, id, `m-${i}-x`, 'game', 10, W1));
assert.ok(leagueView(db, many[0]!, W1).rows.length <= GROUP_SIZE);
assert.ok(leagueView(db, many[GROUP_SIZE + 2]!, W1).rows.length >= 1);
assert.ok(DEMOTE > 0);
console.log('league.test: OK');
