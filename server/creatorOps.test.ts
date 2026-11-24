import assert from 'node:assert/strict';
import { byToken, createDb, join, setRole } from './db';
import { createLink } from './creatorLinks';
import { adminCreators, adminSetProfile, createCampaign, csvCell, creatorsCsv, listCampaigns, listFlags, normalizePostUrl, postsForAdmin, postsOf, profileOf, resolveFlag, reviewPost, savePost, selfSetProfile, updateCampaign } from './creatorOps';
import { addFlag } from './creatorLinks';

const db = createDb();
const T = Date.UTC(2026, 10, 20, 8);
const DAY = 86_400_000;
const pl = (n: string) => byToken(db, join(db, n, T).token).id;
const admin = pl('Admin Bosh');
const A = pl('Bloger A'), B = pl('Bloger B'); setRole(db, 'Bloger A', 'creator'); setRole(db, 'Bloger B', 'creator');
const plain = pl('Oddiy User');
const throwsMsg = (fn: () => unknown, re: RegExp, msg: string) => assert.throws(fn, (e: Error) => re.test(e.message), msg);

// ---- Profil/status ----
assert.equal(profileOf(db, A).status, 'approved', 'mavjud creator (profilsiz) — tasdiqlangan: eski hisoblar ishlashda davom etadi');
assert.equal(profileOf(db, A).rankOptIn, false, 'ommaviy reyting — standart: yo‘q');
assert.equal(adminSetProfile(db, admin, 'bloger a', { status: 'paused', locale: 'ru', country: 'UZ', platforms: 'instagram,tiktok', social: '@bloger_a', note: 'Test izoh' }, T).status, 'paused');
throwsMsg(() => adminSetProfile(db, admin, 'Bloger A', { status: 'vip' }), /Status/, 'noto‘g‘ri status');
throwsMsg(() => adminSetProfile(db, admin, 'Oddiy User', { status: 'approved' }), /topilmadi/, 'creator bo‘lmagan foydalanuvchiga profil berilmaydi');
adminSetProfile(db, admin, 'Bloger A', { status: 'approved' }, T);
assert.equal(selfSetProfile(db, A, { status: 'rejected', note: 'hack', country: 'KZ', rankOptIn: true }, T).status, 'approved', 'creator o‘z statusini/izohini o‘zgartira olmaydi');
assert.equal(profileOf(db, A).country, 'KZ'); assert.equal(profileOf(db, A).rankOptIn, true); assert.equal(profileOf(db, A).note, 'Test izoh');

// ---- Kampaniya: standart draft va mukofot o'chiq; creator faqat faolini ko'radi (moliyasiz) ----
const camp = createCampaign(db, admin, { name: 'Noyabr UGC', brief: 'Qisqa video', rules: 'Reklama deb belgilang', requiresVideo: true, startsAt: T - DAY, endsAt: T + 30 * DAY }, T);
assert.equal(camp.status, 'draft'); assert.equal(camp.rewardEnabled, false, 'mukofot standart o‘chiq');
assert.deepEqual(listCampaigns(db, false, T), [], 'qoralama kampaniya creator ko‘rmaydi'); assert.equal(listCampaigns(db, true, T).length, 1);
throwsMsg(() => createLink(db, A, { kind: 'campaign', label: 'Kampaniya linki', campaignId: camp.id }, T), /Kampaniya/, 'faol bo‘lmagan kampaniyaga link');
throwsMsg(() => createCampaign(db, admin, { name: 'ab' }), /nomi/, 'nom'); throwsMsg(() => createCampaign(db, admin, { name: 'Test k', startsAt: T, endsAt: T - 1 }), /Tugash/, 'sana tartibi');
updateCampaign(db, admin, camp.id, { status: 'active', budgetMinor: 5_000_000, capPerCreatorMinor: 1_000_000 }, T);
const vis = listCampaigns(db, false, T)[0]!; assert.equal(vis.name, 'Noyabr UGC'); assert.equal(vis.budgetMinor, null, 'creator byudjet/moliya sozlamalarini ko‘rmaydi'); assert.equal(vis.rewardEnabled, false);
assert.deepEqual(listCampaigns(db, false, T + 40 * DAY), [], 'muddati o‘tgan kampaniya ko‘rinmaydi');
throwsMsg(() => updateCampaign(db, admin, camp.id, { budgetMinor: -5 }), /Byudjet/, 'manfiy byudjet'); throwsMsg(() => updateCampaign(db, admin, 999, {}), /topilmadi/, 'yo‘q kampaniya');
const cl = createLink(db, A, { kind: 'campaign', label: 'Noyabr UGC link', campaignId: camp.id }, T);
const bl = createLink(db, B, { kind: 'reel', label: 'B reel' }, T);

// ---- URL tekshiruvi va dublikat aniqlash ----
assert.deepEqual(normalizePostUrl('https://www.instagram.com/reel/ABC123/?utm_source=ig&igsh=xyz', 'instagram').norm, 'instagram.com/reel/abc123');
assert.equal(normalizePostUrl('https://m.youtube.com/watch?v=AbC&feature=share&si=1', 'youtube').norm, normalizePostUrl('https://youtube.com/watch?v=AbC', 'youtube').norm, 'youtube: faqat v parametri; m./www. bir xil');
throwsMsg(() => normalizePostUrl('http://instagram.com/reel/x', 'instagram'), /https/, 'http rad'); throwsMsg(() => normalizePostUrl('https://u:p@instagram.com/x', 'instagram'), /https/, 'login/parol'); throwsMsg(() => normalizePostUrl('https://evil.com/reel/x', 'instagram'), /platformaga/, 'boshqa domen');
throwsMsg(() => normalizePostUrl('javascript:alert(1)', 'other'), /https/, 'javascript:'); throwsMsg(() => normalizePostUrl('', 'other'), /noto‘g‘ri/, 'bo‘sh'); throwsMsg(() => normalizePostUrl(`https://instagram.com/${'a'.repeat(600)}`, 'instagram'), /noto‘g‘ri/, 'uzun');
assert.equal(normalizePostUrl('https://example.org/video/1', 'other').norm, 'example.org/video/1', '"other" platformada istalgan https');

// ---- Post topshirish ----
const full = { platform: 'instagram', url: 'https://www.instagram.com/reel/ABC123/', lang: 'uz', postedOn: '2026-11-19', caption: 'IELTS uchun foydali maslahatlar — #reklama', linkCode: cl.code, campaignId: camp.id, claimedViews: 12000 };
const draft = savePost(db, A, { platform: 'tiktok' }, T); assert.equal(draft.status, 'draft', 'qoralama qisman to‘ldirilgan bo‘lishi mumkin');
for (const [k, re] of [['url', /havolasi majburiy/], ['lang', /Til majburiy/], ['postedOn', /sana majburiy/], ['caption', /Caption/], ['linkCode', /Tracking link tanlash/]] as const)
  throwsMsg(() => savePost(db, A, { ...full, id: draft.id, [k]: '', submit: true }, T), re, `topshirishda ${k} majburiy`);
throwsMsg(() => savePost(db, A, { ...full, linkCode: bl.code, submit: true }, T), /Tracking link topilmadi/, 'boshqa creator linki');
throwsMsg(() => savePost(db, A, { ...full, postedOn: '2027-12-01', submit: true }, T), /Sana/, 'kelajak sanasi'); throwsMsg(() => savePost(db, A, { ...full, platform: 'myspace' }), /Platforma/, 'platforma');
throwsMsg(() => savePost(db, A, { ...full, claimedViews: -3 }), /Ko‘rishlar/, 'manfiy ko‘rishlar'); throwsMsg(() => savePost(db, A, { ...full, campaignId: 999 }), /Kampaniya/, 'yo‘q kampaniya');
const p1 = savePost(db, A, { ...full, id: draft.id, submit: true }, T + 1000);
assert.equal(p1.status, 'submitted'); assert.equal(p1.claimedViews, 12000); assert.equal(p1.viewsVerified, false, 'creator yozgan ko‘rishlar TASDIQLANMAGAN'); assert.equal(p1.verifiedViews, null);
assert.deepEqual(p1.history.map((h) => h.to), ['draft', 'submitted']);
throwsMsg(() => savePost(db, A, { ...full, id: p1.id, caption: 'o‘zgartirish urinishi uzun matn' }, T), /tahrirlab bo‘lmaydi/, 'topshirilganini tahrirlab bo‘lmaydi');
throwsMsg(() => savePost(db, B, { ...full, id: p1.id }, T), /topilmadi/, 'boshqa creator postiga tegib bo‘lmaydi');
throwsMsg(() => savePost(db, B, { ...full, url: 'https://instagram.com/reel/abc123?utm=1', linkCode: bl.code, campaignId: '', submit: true }, T), /allaqachon/, 'dublikat havola (boshqa creator ham)');
assert.equal(postsOf(db, B).length, 0, 'creator faqat o‘z postlarini ko‘radi'); assert.equal(postsOf(db, A).length, 1);

// ---- Admin tasdiqlashi ----
throwsMsg(() => reviewPost(db, admin, p1.id, { decision: 'rejected' }), /Izoh/, 'rad etishda izoh majburiy');
throwsMsg(() => reviewPost(db, admin, p1.id, { decision: 'maybe', note: 'x' }), /Qaror/, 'noto‘g‘ri qaror'); throwsMsg(() => reviewPost(db, admin, 999, { decision: 'approved' }), /topilmadi/, 'yo‘q post');
const ch = reviewPost(db, admin, p1.id, { decision: 'needs_changes', note: 'Caption’ga #reklama qo‘shing' }, T + 2000);
assert.equal(ch.status, 'needs_changes'); assert.equal(ch.adminNote, 'Caption’ga #reklama qo‘shing');
throwsMsg(() => reviewPost(db, admin, p1.id, { decision: 'approved' }), /topshirilgan/, 'faqat topshirilgan ko‘rib chiqiladi');
const re1 = savePost(db, A, { ...full, id: p1.id, caption: 'IELTS uchun foydali maslahatlar #reklama #ad', submit: true }, T + 3000); assert.equal(re1.status, 'submitted', 'o‘zgartirish so‘ralgach qayta topshirish');
const ok = reviewPost(db, admin, p1.id, { decision: 'approved', note: 'Yaxshi', verifiedViews: 11800, evidence: 'Ekran yozuvi admin ko‘rdi' }, T + 4000);
assert.equal(ok.status, 'approved'); assert.equal(ok.viewsVerified, true); assert.equal(ok.verifiedViews, 11800); assert.equal(ok.claimedViews, 12000, 'creator da’vosi saqlanadi, tasdiqlangani alohida'); assert.equal(ok.evidence, 'Ekran yozuvi admin ko‘rdi');
assert.deepEqual(ok.history.map((h) => h.to), ['draft', 'submitted', 'needs_changes', 'submitted', 'approved']); assert.deepEqual(ok.history.map((h) => h.byAdmin), [false, false, true, false, true], 'qaror tarixi: kim qaror qildi');
// Rad etilgan havola qayta topshirilishi mumkin
const rej = savePost(db, B, { ...full, url: 'https://tiktok.com/@b/video/1', platform: 'tiktok', linkCode: bl.code, campaignId: '', submit: true }, T);
reviewPost(db, admin, rej.id, { decision: 'rejected', note: 'Brend qoidalari buzilgan' }, T);
assert.equal(savePost(db, A, { platform: 'tiktok', url: 'https://www.tiktok.com/@b/video/1', lang: 'uz', postedOn: '2026-11-19', caption: 'Boshqa caption matni', linkCode: cl.code, submit: true }, T).status, 'submitted', 'rad etilgan havola qayta ishlatilishi mumkin');
// Admin ro'yxati: PII yo'q
const adm = postsForAdmin(db, 'submitted'); assert.ok(adm.every((p) => p.status === 'submitted' && typeof p.creator === 'string'));
assert.ok(!JSON.stringify(postsForAdmin(db)).match(/phone|email|tg_id|token/i), 'post javobida shaxsiy maydonlar yo‘q');

// ---- Admin CRM ro'yxati, filtrlar, CSV ----
const rows = adminCreators(db, { from: T - DAY, to: T + 60 * DAY }, T + 40 * DAY);
assert.equal(rows.length, 2); assert.deepEqual(rows.map((r) => r.nickname).sort(), ['Bloger A', 'Bloger B']); assert.equal(rows.find((r) => r.nickname === 'Bloger A')!.links, 1); assert.equal(rows.find((r) => r.nickname === 'Bloger A')!.posts.submitted, 1);
assert.deepEqual(adminCreators(db, { text: 'bloger b', from: 0, to: T + 99 * DAY }, T).map((r) => r.nickname), ['Bloger B'], 'qidiruv');
assert.deepEqual(adminCreators(db, { locale: 'ru', from: 0, to: T + 99 * DAY }, T).map((r) => r.nickname), ['Bloger A'], 'til filtri');
assert.deepEqual(adminCreators(db, { campaignId: camp.id, from: 0, to: T + 99 * DAY }, T).map((r) => r.nickname), ['Bloger A'], 'kampaniya filtri');
adminSetProfile(db, admin, 'Bloger B', { status: 'rejected' }, T); assert.deepEqual(adminCreators(db, { status: 'rejected', from: 0, to: T + 99 * DAY }, T).map((r) => r.nickname), ['Bloger B'], 'status filtri');
assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"', 'formula in’ektsiyasi (apostrof + tirnoq)'); assert.equal(csvCell('a,b'), '"a,b"'); assert.equal(csvCell(null), ''); assert.equal(csvCell('+1'), "'+1");
const csv = creatorsCsv(rows); assert.match(csv.split('\n')[0]!, /^nickname,status,locale,country,links,unique_clicks,signups,activated,retained_d7,paid,net_revenue_uzs,refunded_uzs,open_flags$/);
assert.ok(!/phone|email|telegram|token|tg_id|ball|score/i.test(csv.split('\n')[0]!), 'CSV: faqat agregat, shaxsiy ma’lumotsiz');

// ---- Belgilar ----
addFlag(db, A, cl.code, 'burst_clicks', 'test', 'k1', T);
const fl = listFlags(db); assert.equal(fl.length, 1); assert.equal(fl[0]!.creator, 'Bloger A');
assert.equal(adminCreators(db, { from: 0, to: T + 99 * DAY }, T).find((r) => r.nickname === 'Bloger A')!.openFlags, 1);
resolveFlag(db, admin, fl[0]!.id, T); assert.equal(listFlags(db).length, 0); assert.equal(listFlags(db, true).length, 1); throwsMsg(() => resolveFlag(db, admin, fl[0]!.id), /topilmadi/, 'ikki marta hal qilinmaydi');
void plain;
console.log('creatorOps.test: OK');
