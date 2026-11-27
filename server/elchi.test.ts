// Elchi dasturi (egasi, 2026-11-26): har faol bloger uchun 25 000; oyda 5 ta faol → +50 000, 10 ta → +150 000 (qo'shilmaydi);
// kamida 1 000 obunachi; elchi bloger ham bo'la oladi; oylik byudjet chegarasi yo'q.
import assert from 'node:assert/strict';
import { byToken, createDb, join, setRole } from './db';
import { createLink } from './creatorLinks';
import { reviewPost, savePost } from './creatorOps';
import { decideEntry } from './creatorLedger';
import { settleVideo, videoTerms } from './videoPay';
import { ensurePartnersTable, publicTerms, submitApplication, listApplications } from './partners';
import { ensureElchiTables, elchiInfo, onVideoApproved, reconcileElchi } from './elchi';
import { noteCreatorDevice } from './creatorLinks';
import { refCodeOf } from './referral';

const DAY = 86_400_000, POSTED = '2026-11-01', T0 = Date.parse(`${POSTED}T00:00:00Z`), T = T0 + 3_600_000, SETTLE = T0 + 15 * DAY + 3_600_000;
const throwsMsg = (fn: () => unknown, re: RegExp, msg: string) => assert.throws(fn, (e: Error) => re.test(e.message), msg);

const db = createDb(); ensurePartnersTable(db); ensureElchiTables(db);
const pl = (n: string) => byToken(db, join(db, n, T).token).id;
const admin = pl('Admin Elchi');
const elchi = pl('Elchi Aka'); setRole(db, 'Elchi Aka', 'creator');
const code = refCodeOf(db, elchi);
let n = 0;
const app = (pid: number | null, b: Record<string, unknown>) => submitApplication(db, { kind: 'blogger', name: 'Bloger', link: `@blog${++n}x`, audience: '10k-100k', contact: `@contact${n}x`, consent: true, elchi: code, ...b }, { ip: `10.0.0.${n}`, playerId: pid }, T);

// Shartlar: egasi tasdiqlagan summalar, Instagram sellzen.ai
{
  const t = videoTerms(db);
  assert.equal(t.elchiSom, 25_000); assert.deepEqual(t.elchiTiers, [{ min: 5, som: 50_000 }, { min: 10, som: 150_000 }]);
  assert.equal(t.instagram, 'sellzen.ai');
  assert.deepEqual(publicTerms(db).elchi, { som: 25_000, tiers: [{ min: 5, som: 50_000 }, { min: 10, som: 150_000 }], payDays: 14 });
}

// Ariza: 1 000 dan kam obunachili bloger qabul qilinmaydi; elchi havolasi — faqat hisob bilan; elchi o'zi ariza yubora oladi (auditoriyasiz)
{
  throwsMsg(() => app(pl('Kichik Bloger'), { audience: '<1k' }), /1 000 obunachi/, 'bloger 1 000 dan kam — rad');
  throwsMsg(() => app(null, {}), /kiring/, 'elchi havolasi bilan mehmon ariza yubormaydi');
  const e2 = submitApplication(db, { kind: 'elchi', name: 'Yangi Elchi', link: '@elchi_new', contact: '@elchinew', consent: true }, { ip: '10.1.1.1', playerId: null }, T);
  assert.equal(e2.duplicate, false, 'elchi arizasi — obunachi soni so‘ralmaydi');
  assert.equal(app(elchi, {}).elchi, false, 'o‘zini o‘zi olib kelish sanalmaydi');
  const already = pl('Eski Hamkor'); setRole(db, 'Eski Hamkor', 'creator');
  assert.equal(app(already, {}).elchi, false, 'avvaldan hamkor bo‘lgan bloger elchiga bog‘lanmaydi');
  assert.equal(submitApplication(db, { kind: 'teacher', name: 'Ustoz', link: '@ustoz1x', audience: '<1k', contact: '@ustoz1x', consent: true, elchi: code }, { ip: '10.2.2.2', playerId: pl('Ustoz Bir') }, T).elchi, false, 'o‘qituvchi 1 000 dan kam — ariza qabul, lekin elchiga sanalmaydi');
}

/** Bloger elchi havolasi orqali keladi, hamkor bo'ladi, video joylaydi, admin hisoblaydi va tasdiqlaydi. */
let vid = 0;
function activeBlogger(name: string, at = SETTLE, approve = true): { id: number; entry: number; res: ReturnType<typeof onVideoApproved> | null } {
  const id = pl(name);
  const r = app(id, {}); assert.equal(r.elchi, true, `${name} elchiga bog‘landi`);
  setRole(db, name, 'creator');
  return { id, ...video(id, at, approve) };
}
function video(id: number, at = SETTLE, approve = true): { entry: number; res: ReturnType<typeof onVideoApproved> | null } {
  const link = createLink(db, id, { kind: 'reel', label: `V${++vid}` }, T);
  const post = savePost(db, id, { platform: 'instagram', url: `https://www.instagram.com/reel/ELCHI${vid}/`, lang: 'uz', postedOn: POSTED, caption: '#reklama', linkCode: link.code, submit: true }, T);
  reviewPost(db, admin, post.id, { decision: 'approved', note: 'ok' }, T);
  const e = settleVideo(db, admin, post.id, { views: 1_000, bio: true, comment: true, tag: true }, at);
  if (!approve) { decideEntry(db, admin, e.id, 'rejected', 'talab bajarilmagan', at); return { entry: e.id, res: onVideoApproved(db, e.id, at) }; }
  decideEntry(db, admin, e.id, 'approved', null, at);
  return { entry: e.id, res: onVideoApproved(db, e.id, at) };
}
const elchiRows = () => (db.prepare("SELECT kind, amount_minor AS a, status FROM creator_ledger WHERE creator_id = ? ORDER BY id").all(elchi) as { kind: string; a: number; status: string }[]).map((r) => ({ ...r }));

// 1-faol bloger: 25 000; ikkinchi video uchun elchi yana olmaydi; rad etilgan video — elchiga yo'q
{
  const b1 = activeBlogger('Bloger Bir');
  assert.deepEqual(b1.res, { paid: 25_000, tier: 0 });
  assert.deepEqual(onVideoApproved(db, b1.entry, SETTLE), { paid: 0, tier: 0 }, 'takroriy chaqiruv — ikki marta to‘lanmaydi');
  assert.deepEqual(video(b1.id).res, { paid: 0, tier: 0 }, 'shu blogerning ikkinchi videosi — elchiga to‘lanmaydi');
  const rej = activeBlogger('Bloger Rad', SETTLE, false);
  assert.deepEqual(rej.res, { paid: 0, tier: 0 }, 'video hisobi rad etilsa — bloger faol emas');
  assert.deepEqual(elchiRows(), [{ kind: 'elchi', a: 2_500_000, status: 'approved' }], 'faqat bitta yozuv, tasdiqlangan (14 kunda to‘lanadi)');
  assert.equal(elchiInfo(db, elchi, SETTLE).activeThisMonth, 1);
  assert.deepEqual(elchiInfo(db, elchi, SETTLE).next, { need: 4, som: 50_000 }, 'yana 4 ta faol — +50 000');
  assert.equal(listApplications(db).find((a) => a.name === 'Bloger' && a.elchi)?.elchi, 'Elchi Aka', 'admin arizada elchini ko‘radi');
  // Rad etilgan blogerning keyingi videosi tasdiqlansa — endi faol
  assert.deepEqual(video(rej.id).res, { paid: 25_000, tier: 0 });
}

// Oyda 5 ta faol → +50 000; 10 ta → yana +100 000 (jami bonus 150 000, qo'shilmaydi)
{
  const tier = () => elchiRows().filter((r) => r.kind === 'elchi_tier').map((r) => r.a / 100);
  for (const k of [3, 4]) activeBlogger(`Bloger ${k}`);
  assert.deepEqual(tier(), [], '4 ta faol — bonus yo‘q');
  const b5 = activeBlogger('Bloger 5');
  assert.deepEqual(b5.res, { paid: 25_000, tier: 50_000 }, '5-faol bloger — +50 000');
  for (const k of [6, 7, 8, 9]) assert.equal(activeBlogger(`Bloger ${k}`).res!.tier, 0);
  const b10 = activeBlogger('Bloger 10');
  assert.deepEqual(b10.res, { paid: 25_000, tier: 100_000 }, '10-faol bloger — bonus 150 000 gacha (+100 000)');
  assert.deepEqual(tier(), [50_000, 100_000]);
  const info = elchiInfo(db, elchi, SETTLE);
  assert.equal(info.activeThisMonth, 10); assert.equal(info.next, null, 'eng yuqori pog‘ona');
  assert.equal(info.earnedSom, 10 * 25_000 + 150_000, 'egasining misoli: 10 × 25 000 + 150 000 = 400 000');
  assert.equal(info.bloggers.filter((b) => b.activeAt !== null).length, 10);
  // Keyingi oy — hisob yangidan: 1 ta faol, bonus yo'q
  const next = activeBlogger('Bloger Dekabr', Date.parse('2026-12-05T10:00:00Z'));
  assert.deepEqual(next.res, { paid: 25_000, tier: 0 });
  assert.equal(elchiInfo(db, elchi, Date.parse('2026-12-05T11:00:00Z')).activeThisMonth, 1);
}

// Elchi bloger ham bo'la oladi: o'z videosi uchun odatdagi video to'lovi, elchi summasi emas
{
  const before = elchiRows().filter((r) => r.kind === 'elchi').length;
  const own = video(elchi);
  assert.deepEqual(own.res, { paid: 0, tier: 0 }, 'elchining o‘z videosi elchi summasi bermaydi');
  assert.equal(elchiRows().filter((r) => r.kind === 'video').length, 1, 'video to‘lovi alohida');
  assert.equal(elchiRows().filter((r) => r.kind === 'elchi').length, before);
}
// Kod tekshiruvi (2026-11-27): takroriy ariza, bir qurilma, yo'qolgan to'lovni tiklash
{
  // a) Boshqa o'quvchi birovning aloqasi bilan qayta yuborsa — bog'lanmaydi; o'zi qayta yuborsa — saqlangan auditoriya bilan
  const owner = pl('Asl Egasi');
  const first = submitApplication(db, { kind: 'teacher', name: 'Asl', link: '@asl_egasi', audience: '<1k', contact: '@asl_egasi', consent: true }, { ip: '10.9.0.1', playerId: owner }, T);
  const other = pl('Boshqa Kishi');
  const again = submitApplication(db, { kind: 'blogger', name: 'Boshqa', link: '@asl_egasi', audience: '100k+', contact: '@asl_egasi', consent: true, elchi: code }, { ip: '10.9.0.2', playerId: other }, T);
  assert.equal(again.duplicate, true); assert.equal(again.elchi, false, 'boshqa birovning arizasi bilan bog‘lanmaydi');
  const own = submitApplication(db, { kind: 'blogger', name: 'Asl', link: '@asl_egasi', audience: '100k+', contact: '@asl_egasi', consent: true, elchi: code }, { ip: '10.9.0.3', playerId: owner }, T);
  assert.equal(own.id, first.id); assert.equal(own.elchi, false, 'saqlangan auditoriya <1k — yangi «100k+» deb aytilgani hisobga olinmaydi');
  // b) Elchining o'z qurilmasidan ikkinchi hisob — bog'lanmaydi
  noteCreatorDevice(db, elchi, 'fp-elchi-phone');
  const alt = pl('Elchi Ikkinchi');
  const r = submitApplication(db, { kind: 'blogger', name: 'Alt', link: '@alt_acc1', audience: '10k-100k', contact: '@alt_acc1', consent: true, elchi: code }, { ip: '10.9.0.4', playerId: alt, fp: 'fp-elchi-phone' }, T);
  assert.equal(r.elchi, true, 'bir qurilma — bog‘lanadi (ikki odam bitta Wi-Fi/telefon modelida bo‘lishi mumkin)');
  setRole(db, 'Elchi Ikkinchi', 'creator');
  const sus = video(alt);
  assert.deepEqual(sus.res, { paid: 25_000, tier: 0 }, 'summa yozildi, oylik bonusga kirmaydi');
  const st = (db.prepare("SELECT status, note FROM creator_ledger WHERE event_key = ?").get(`elchi:${alt}`) as { status: string; note: string });
  assert.equal(st.status, 'pending', 'gumon — admin tasdig‘ini kutadi'); assert.match(st.note, /bir qurilma/);
  // c) Qaror yozilib, elchi to'lovi yozilmay qolgan holat (masalan, eski versiya) — soatlik qayta tiklash yozadi, takrorlamaydi
  const lost = pl('Bloger Tiklash'); assert.equal(app(lost, {}).elchi, true); setRole(db, 'Bloger Tiklash', 'creator');
  const link = createLink(db, lost, { kind: 'reel', label: 'VR' }, T);
  const post = savePost(db, lost, { platform: 'instagram', url: 'https://www.instagram.com/reel/RECON1/', lang: 'uz', postedOn: POSTED, caption: '#reklama', linkCode: link.code, submit: true }, T);
  reviewPost(db, admin, post.id, { decision: 'approved', note: 'ok' }, T);
  const e = settleVideo(db, admin, post.id, { views: 1_000, bio: true, comment: true, tag: true }, SETTLE);
  decideEntry(db, admin, e.id, 'approved', null, SETTLE); // onVideoApproved chaqirilmadi
  const before = elchiRows().filter((x) => x.kind === 'elchi').length;
  assert.equal(reconcileElchi(db, SETTLE), 1, 'tiklandi');
  assert.equal(reconcileElchi(db, SETTLE), 0, 'takror yozilmaydi');
  assert.equal(elchiRows().filter((x) => x.kind === 'elchi').length, before + 1);
}
console.log('elchi.test: OK');
