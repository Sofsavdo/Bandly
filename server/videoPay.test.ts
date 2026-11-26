// Video uchun to'lov: egasi belgilagan model (asosiy 50 000 + ko'rishlar va o'quvchilar pog'onasi, 15-kun, bir marta, admin tasdig'i).
import assert from 'node:assert/strict';
import { byToken, createDb, join, loginTelegram, setRole } from './db';
import { attachAttribution, createLink } from './creatorLinks';
import { reviewPost, savePost } from './creatorOps';
import { adminLedger, decideEntry, markPaid } from './creatorLedger';
import { calcVideo, DEFAULT_TERMS, setVideoTerms, settleVideo, videoPayOf, videoQueue, videoTerms } from './videoPay';
import { publicTerms } from './partners';
import { awardXp } from './xp';

const DAY = 86_400_000, POSTED = '2026-11-01', T0 = Date.parse(`${POSTED}T00:00:00Z`), T = T0 + 3_600_000;
const throwsMsg = (fn: () => unknown, re: RegExp, msg: string) => assert.throws(fn, (e: Error) => re.test(e.message), msg);

// 1) Hisob formulasi: eng yuqori pog'ona (pog'onalar qo'shilmaydi)
{
  const t = { ...DEFAULT_TERMS, updatedAt: null };
  assert.equal(calcVideo(t, 9_999, 49).totalSom, 50_000, 'norma yetmasa — faqat asosiy to‘lov');
  assert.deepEqual(calcVideo(t, 10_000, 50), { baseSom: 50_000, views: 10_000, viewBonusSom: 50_000, learners: 50, learnerBonusSom: 50_000, totalSom: 150_000 });
  const top = calcVideo(t, 150_000, 120);
  assert.equal(top.viewBonusSom, 200_000); assert.equal(top.learnerBonusSom, 150_000);
  assert.equal(top.totalSom, 400_000, '100 000+ ko‘rish va 100+ o‘quvchi: 50 000 + 200 000 + 150 000');
}

// 2) To'liq oqim: video → tasdiq → 15-kun → admin hisob → tasdiq → to'landi
{
  const db = createDb(); let tg = 9000;
  const pl = (n: string) => byToken(db, join(db, n, T).token).id;
  const admin = pl('Admin Bosh');
  const cid = pl('Bloger Video'); setRole(db, 'Bloger Video', 'creator');
  const link = createLink(db, cid, { kind: 'reel', label: 'Reel 1' }, T);
  const learner = (at: number, active = true) => {
    const id = byToken(db, loginTelegram(db, ++tg, `L${tg}`, undefined, at).token).id;
    attachAttribution(db, id, { ref: link.code, ref0: link.code }, null, at);
    if (active) awardXp(db, id, `lesson-${id}-a`, 'lesson', 20, at + 1000);
    return id;
  };
  for (let i = 0; i < 52; i++) learner(T + DAY + i * 60_000);          // 15 kun ichida, darsni boshlagan — sanaladi
  for (let i = 0; i < 5; i++) learner(T + 2 * DAY + i * 60_000, false); // darsni boshlamagan — sanalmaydi
  for (let i = 0; i < 3; i++) learner(T0 + 16 * DAY + i * 60_000);     // 15 kundan keyin kelgan — sanalmaydi

  const post = savePost(db, cid, { platform: 'instagram', url: 'https://www.instagram.com/reel/VID001/', lang: 'uz', postedOn: POSTED, caption: 'Sellzen bilan IELTS #reklama', linkCode: link.code, claimedViews: 120_000, submit: true }, T);
  throwsMsg(() => settleVideo(db, admin, post.id, { views: 1, bio: true, comment: true, tag: true }, T0 + 20 * DAY), /tasdiqlang/, 'tasdiqlanmagan video hisoblanmaydi');
  reviewPost(db, admin, post.id, { decision: 'approved', note: 'ok' }, T);

  const q = videoQueue(db, T0 + 10 * DAY)[0]!;
  assert.equal(q.due, false); assert.equal(q.dueAt, T0 + 15 * DAY); assert.equal(q.learners, 52);
  throwsMsg(() => settleVideo(db, admin, post.id, { views: 120_000, bio: true, comment: true, tag: true }, T0 + 10 * DAY), /2026-11-16/, '15 kun to‘lmaguncha hisob yo‘q');
  const at = T0 + 15 * DAY + 3_600_000;
  throwsMsg(() => settleVideo(db, admin, post.id, { views: 120_000, bio: true, comment: false, tag: true }, at), /Talablar/, 'talablar tasdiqlanmasa — hisob yo‘q');
  throwsMsg(() => settleVideo(db, admin, post.id, { views: 120_000, baseSom: 40_000, bio: true, comment: true, tag: true }, at), /Asosiy/, 'asosiy to‘lov minimaldan kam bo‘lmaydi');

  const e = settleVideo(db, admin, post.id, { views: 120_000, bio: true, comment: true, tag: true }, at);
  assert.equal(e.status, 'pending', 'admin tasdiqlamaguncha kutilmoqda');
  assert.equal(e.amountMinor, (50_000 + 200_000 + 50_000) * 100, '120 000 ko‘rish (+200 000) va 52 o‘quvchi (+50 000)');
  assert.equal(e.basis!.learners, 52);
  throwsMsg(() => settleVideo(db, admin, post.id, { views: 500_000, bio: true, comment: true, tag: true }, at + 15 * DAY), /bir marta/, 'keyingi o‘sish qo‘shimcha to‘lanmaydi');

  const row = adminLedger(db).find((x) => x.id === e.id)!; assert.equal(row.kind, 'video');
  decideEntry(db, admin, e.id, 'approved', null, at + 1000);
  assert.equal(markPaid(db, admin, e.id, 'Click #123', at + 2000).status, 'paid');

  const mine = videoPayOf(db, cid, at + 3000);
  assert.equal(mine.items.length, 1); assert.equal(mine.items[0]!.entry!.status, 'paid');
  assert.ok(!('creator' in mine.items[0]!), 'creator javobida boshqa hamkor laqabi yo‘q');
}

// 3) Admin shartlarni tahrirlaydi; ochiq sahifa shu qiymatlarni ko'radi; o'chirilsa sahifada yo'q
{
  const db = createDb(); const admin = byToken(db, join(db, 'Admin Ikki', T).token).id;
  assert.equal(videoTerms(db).baseSom, 50_000, 'egasi belgilagan boshlang‘ich qiymat');
  assert.deepEqual(publicTerms(db, T, {}).video?.learnerTiers, [{ min: 50, som: 50_000 }, { min: 100, som: 150_000 }]);
  throwsMsg(() => setVideoTerms(db, admin, { viewTiers: [{ min: 10, som: 5 }, { min: 10, som: 6 }] }), /takrorlanmasin/, 'bir xil norma');
  throwsMsg(() => setVideoTerms(db, admin, { instagram: 'yomon nom!' }), /Instagram/, 'Instagram nomi');
  const t = setVideoTerms(db, admin, { baseSom: 70_000, viewTiers: [{ min: 100_000, som: 250_000 }, { min: 10_000, som: 60_000 }], instagram: '@sellzen.uz' }, T);
  assert.equal(t.baseSom, 70_000); assert.deepEqual(t.viewTiers.map((x) => x.min), [10_000, 100_000], 'normalar tartiblanadi'); assert.equal(t.instagram, 'sellzen.uz');
  assert.equal(publicTerms(db, T, {}).video?.baseSom, 70_000);
  setVideoTerms(db, admin, { enabled: false }, T);
  assert.equal(publicTerms(db, T, {}).video, null, 'o‘chirilgan dastur sahifada ko‘rinmaydi');
  assert.ok((db.prepare("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'creator.video.terms'").get() as { n: number }).n >= 2, 'audit jurnali');
}
console.log('videoPay: OK');
