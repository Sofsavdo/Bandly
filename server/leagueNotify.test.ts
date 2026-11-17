import assert from 'node:assert/strict';
import { byToken, createDb, loginTelegram, weekStart } from './db';
import { awardXp } from './xp';
import { leagueMessage, runLeagueNotices } from './leagueNotify';

const db = createDb();
const W0 = weekStart(Date.UTC(2026, 10, 18, 12)) + 3_600_000; // o'tgan hafta dushanba
const W1 = W0 + 7 * 86_400_000;                                // yangi hafta
const ids = Array.from({ length: 14 }, (_, i) => byToken(db, loginTelegram(db, 9000 + i, `O${i}`, undefined, W0).token).id);
ids.forEach((id, i) => awardXp(db, id, `w0-${id}-xp`, 'lesson', 150 - i * 10, W0 + i * 1000)); // 0 — eng ko'p XP
const sent: Record<string, unknown>[] = [];
assert.equal(await runLeagueNotices(db, async (m) => { sent.push(m); }, 'https://x/league', W1), 14);
const byChat = Object.fromEntries(sent.map((m) => [m.chat_id, String(m.text)]));
assert.match(byChat[9000]!, /1-o‘rin — Kumush ligasiga ko‘tarildingiz/);
assert.match(byChat[9013]!, /tushdingiz|ligasi\)/); // Bronzadan pastga tushib bo'lmaydi — "qoldi"
assert.match(byChat[9008]!, /9-o‘rin \(Bronza ligasi\)/);
// Takror yuborilmaydi
assert.equal(await runLeagueNotices(db, async () => undefined, 'https://x/league', W1 + 600_000), 0);
assert.match(String(leagueMessage({ playerId: 1, tgId: 1, lang: null, rank: 3, n: 20, before: 2, after: 1 }, 'u').text), /Kumush ligasiga tushdingiz/);
console.log('league notify: OK');
