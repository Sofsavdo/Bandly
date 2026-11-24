import assert from 'node:assert/strict';
import { byToken, createDb, join, loginTelegram, setRole } from './db';
import { attachReferral, refCodeOf } from './referral';
import { awardXp } from './xp';
import { ATTRIBUTION_WINDOW_DAYS, attachAttribution, createLink, creatorFunnel, isBotUa, linksOf, noteCreatorDevice, purgeCreatorData, recordClick, recordClickEvent, resolveCreatorCode, scanClickBursts, setLinkActive } from './creatorLinks';

const db = createDb();
const DAY = 86_400_000;
const T = Date.UTC(2026, 10, 20, 8);
const player = (name: string) => byToken(db, join(db, name, T).token).id;
const creator = (name: string) => { const id = player(name); setRole(db, name, 'creator'); return id; };
let tg = 9000;
const signup = (t: Parameters<typeof attachAttribution>[2], at = T, fp: string | null = null) => {
  const id = byToken(db, loginTelegram(db, ++tg, `U${tg}`, undefined, at).token).id;
  return { id, r: attachAttribution(db, id, t, fp, at) };
};
const attrib = (id: number) => db.prepare('SELECT * FROM creator_attrib WHERE player_id = ?').get(id) as Record<string, unknown> | undefined;
const click = (code: string, ip: string, ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1', at = T, method = 'GET') => recordClick(db, code, { ip, ua, method }, at, {} as NodeJS.ProcessEnv);

const A = creator('Bloger A'), B = creator('Bloger B');
// ---- Linklar ----
const bio = createLink(db, A, { kind: 'bio', label: 'Instagram bio', lang: 'uz' }, T);
const reel = createLink(db, A, { kind: 'reel', label: 'Reel #1 — IELTS tips', postRef: 'reel-1', lang: 'ru' }, T);
const bLink = createLink(db, B, { kind: 'tiktok', label: 'TikTok 1' }, T);
assert.match(bio.code, /^[a-z2-9]{8}$/, 'link kodi ref_code alifbosida (eski ?ref= va ref_ oqimlari tushunadi)');
assert.equal(new Set([bio.code, reel.code, bLink.code, refCodeOf(db, A)]).size, 4, 'kodlar to‘qnashmaydi');
assert.throws(() => createLink(db, A, { kind: 'x', label: 'abc' }), /Link turi/);
assert.throws(() => createLink(db, A, { kind: 'bio', label: ' ' }), /Link nomi/);
assert.throws(() => createLink(db, A, { kind: 'bio', label: 'abc', lang: 'de' }), /Til/);
assert.throws(() => createLink(db, A, { kind: 'bio', label: 'abc', campaignId: 999 }), /Kampaniya/, 'mavjud bo‘lmagan kampaniya');
assert.equal(createLink(db, A, { kind: 'bio', label: 'a<b>c\n d' }, T).label, 'abc d', 'belgilar tozalanadi');
assert.equal(linksOf(db, A).length, 3); assert.equal(linksOf(db, B).length, 1, 'creator faqat o‘z linklarini ko‘radi');

// ---- Kod → kim; eski ref kodlar ishlashda davom etadi ----
assert.equal(resolveCreatorCode(db, bio.code)?.link?.code, bio.code);
assert.deepEqual({ ...resolveCreatorCode(db, refCodeOf(db, A)), link: null }, { creatorId: A, link: null, source: 'ref' }, 'eski shaxsiy ref kodi o‘zgarishsiz');
assert.equal(resolveCreatorCode(db, 'zzzzzz'), null); assert.equal(resolveCreatorCode(db, 'BAD!!'), null); assert.equal(resolveCreatorCode(db, undefined), null);
// attachReferral link kodini ham tushunadi; eski kod ham
{ const u = player('Eski Dost'); assert.equal(attachReferral(db, u, refCodeOf(db, A)), true, 'eski ref_code bilan taklif'); assert.equal((db.prepare('SELECT referred_by FROM players WHERE id=?').get(u) as { referred_by: number }).referred_by, A); }
{ const u = player('Link Dost'); assert.equal(attachReferral(db, u, reel.code), true); assert.equal((db.prepare('SELECT referred_by FROM players WHERE id=?').get(u) as { referred_by: number }).referred_by, A, 'link kodi → creator'); assert.equal(attachReferral(db, u, bLink.code), false, 'ikkinchi marta bog‘lanmaydi'); }

// ---- Click: xom / noyob / filtr ----
const ua = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 Instagram 300';
const c1 = click(bio.code, '1.1.1.1', ua, T)!;
assert.ok(c1.clickId && /^[a-f0-9]{16}$/.test(c1.clickId) && c1.unique && !c1.dup && c1.bot === 0);
const cDup = click(bio.code, '1.1.1.1', ua, T + 3000)!;
assert.equal(cDup.dup, true, '10 soniya ichida takror (refresh) — dublikat'); assert.equal(cDup.unique, false);
const c2 = click(bio.code, '1.1.1.1', ua, T + 60_000)!;
assert.equal(c2.dup, false); assert.equal(c2.unique, false, 'shu kun shu qurilmadan ikkinchi klik — xom, lekin noyob emas');
const c3 = click(bio.code, '2.2.2.2', ua, T + 61_000)!; assert.equal(c3.unique, true, 'boshqa qurilma — noyob');
const c4 = click(bio.code, '1.1.1.1', ua, T + DAY)!; assert.equal(c4.unique, true, 'ertasi kuni yana noyob');
assert.equal(click(bio.code, '3.3.3.3', 'Mozilla/5.0 (compatible; Googlebot/2.1)')!.bot, 1, 'bot');
assert.equal(click(bio.code, '3.3.3.4', 'TelegramBot (like TwitterBot)')!.clickId, null, 'bot uchun click identifikatori berilmaydi');
assert.equal(click(bio.code, '3.3.3.5', ua, T, 'HEAD')!.bot, 1, 'HEAD — bot');
assert.equal(click(bio.code, '3.3.3.6', '')!.bot, 1, 'UA yo‘q — bot');
assert.equal(recordClick(db, bio.code, { ip: '9.9.9.9', ua }, T, { CREATOR_INTERNAL_IPS: '9.9.9.9, 8.8.8.8' } as NodeJS.ProcessEnv)!.bot, 2, 'ichki trafik');
assert.equal(click('zzzzzz', '1.1.1.1'), null, 'noma‘lum kod yozilmaydi');
assert.equal(isBotUa(ua), false); assert.equal(isBotUa('curl/8.0'), true);
setLinkActive(db, bLink.code, false, { id: B, admin: false });
assert.equal(click(bLink.code, '1.1.1.1'), null, 'to‘xtatilgan link yangi click/atribusiya yozmaydi');
assert.equal(resolveCreatorCode(db, bLink.code), null);
assert.throws(() => setLinkActive(db, bio.code, false, { id: B, admin: false }), /topilmadi/, 'boshqa creator linkini to‘xtata olmaydi');
setLinkActive(db, bLink.code, true, { id: 0, admin: true });
assert.equal(resolveCreatorCode(db, bLink.code)?.creatorId, B, 'admin yoqa oladi');

// ---- Atribusiya ----
let S1 = 0, S2 = 0, SFB = 0;
{ // click → signup: first/last
  const s = signup({ ref: bio.code, ref0: bio.code, cid: c1.clickId }, T + 5 * 60_000);
  assert.deepEqual({ ...s.r }, { bound: true, attributed: true });
  const a = attrib(s.id)!; assert.equal(a.last_click, c1.clickId); assert.equal(a.first_click, c1.clickId); assert.equal(a.first_link, bio.code); assert.equal(a.source, 'link'); S1 = s.id;
}
{ // first-touch ≠ last-touch: A (bio) avval, B (tiktok) keyin; referred_by — oxirgi (mavjud xulq), first_/last_ alohida
  const cb = click(bLink.code, '4.4.4.4', ua, T + 10_000)!;
  const s = signup({ ref: bLink.code, ref0: bio.code, cid: cb.clickId }, T + 20_000);
  const a = attrib(s.id)!; assert.equal(a.first_creator, A); assert.equal(a.last_creator, B); assert.equal(a.last_click, cb.clickId); assert.equal(a.first_click, null, 'birinchi tegish clicki noma‘lum bo‘lsa — null');
  assert.equal((db.prepare('SELECT referred_by FROM players WHERE id=?').get(s.id) as { referred_by: number }).referred_by, B, 'players.referred_by oxirgi tegilgan kod (eski xulq)'); SFB = s.id;
}
{ // 30 kunlik oyna: eski click atribusiyaga bog'lanmaydi (kod bo'yicha creator baribir)
  const old = click(bio.code, '5.5.5.5', ua, T)!;
  const s = signup({ ref: bio.code, cid: old.clickId }, T + (ATTRIBUTION_WINDOW_DAYS + 1) * DAY);
  assert.equal(attrib(s.id)!.last_click, null, '31 kunlik click bog‘lanmaydi');
  const s2 = signup({ ref: bio.code, cid: old.clickId }, T + ATTRIBUTION_WINDOW_DAYS * DAY);
  assert.equal(attrib(s2.id)!.last_click, old.clickId, '30 kun ichida bog‘lanadi'); S2 = s2.id;
}
{ // boshqa link clicki yoki bot clicki ishlatilmaydi
  const s = signup({ ref: reel.code, cid: c3.clickId }, T + 1000); assert.equal(attrib(s.id)!.last_click, null, 'boshqa linkning clicki');
  const bot = click(bio.code, '6.6.6.6', 'Googlebot/2.1 (+http://www.google.com/bot.html)')!; assert.equal(bot.clickId, null);
  assert.equal(recordClickEvent(db, 'f'.repeat(16), 'signup_start', T), false, 'noma‘lum click');
}
{ // mavjud foydalanuvchi retroaktiv bog'lanmaydi; ikki marta yuborish (double submit) bitta yozuv
  const exist = player('Avvalgi User');
  assert.deepEqual(attachAttribution(db, exist, { ref: bio.code }, null, T), { bound: true, attributed: true });
  const before = JSON.stringify(attrib(exist));
  assert.deepEqual(attachAttribution(db, exist, { ref: bLink.code, ref0: bLink.code }, null, T + 1000), { bound: false, attributed: false }, 'allaqachon bog‘langan — qayta bog‘lanmaydi');
  assert.equal(JSON.stringify(attrib(exist)), before, 'atribusiya o‘zgarmadi (double submit/eski hisob)');
  const nobody = player('Hech Kimsiz'); assert.deepEqual(attachAttribution(db, nobody, {}, null, T), { bound: false, attributed: false }, 'ref yo‘q (boshqa qurilmada ochilgan hisob) — atribusiya yo‘q');
  assert.equal(attrib(nobody), undefined);
}
{ // o'z-o'zini taklif; oddiy (creator bo'lmagan) foydalanuvchi kodi
  assert.deepEqual(attachAttribution(db, A, { ref: bio.code }, null, T), { bound: false, attributed: false }, 'o‘z linki bilan o‘zini taklif qila olmaydi');
  const plain = player('Oddiy Taklif'); const s = signup({ ref: refCodeOf(db, plain) }, T);
  assert.deepEqual(s.r, { bound: true, attributed: false }, 'oddiy referral eski xulq bilan bog‘lanadi, creator atribusiyasi yozilmaydi');
}
{ // paused / rejected creator: link yangi atribusiya bermaydi
  db.prepare("INSERT INTO creator_profiles (player_id, status, created_at, updated_at) VALUES (?, 'paused', ?, ?) ON CONFLICT(player_id) DO UPDATE SET status = 'paused'").run(B, T, T);
  assert.equal(resolveCreatorCode(db, bLink.code), null); const s = signup({ ref: bLink.code }, T); assert.deepEqual(s.r, { bound: false, attributed: false });
  db.prepare("UPDATE creator_profiles SET status = 'approved' WHERE player_id = ?").run(B);
}

// ---- Hodisalar (click bilan bog'langan): dedupe va oyna ----
{
  const c = click(reel.code, '7.7.7.7', ua, T)!;
  assert.equal(recordClickEvent(db, c.clickId, 'landing_view', T + 1), true); assert.equal(recordClickEvent(db, c.clickId, 'landing_view', T + 2), false, 'bir click bir hodisani bir marta');
  assert.equal(recordClickEvent(db, c.clickId, 'signup_start', T + 3), true);
  assert.equal(recordClickEvent(db, c.clickId, 'revenue', T), false, 'ro‘yxatda yo‘q hodisa nomi (mijoz tushum/bonus yubora olmaydi)');
  assert.equal(recordClickEvent(db, c.clickId, 'checkout_start', T + 31 * DAY), false, '30 kundan keyin yozilmaydi');
  assert.ok((db.prepare('SELECT landed_ts FROM creator_clicks WHERE id=?').get(c.clickId) as { landed_ts: number }).landed_ts);
}

// ---- Voronka: serverda jadvallardan; kredit rejimi; filtrlar ----
const NOW = T + 40 * DAY, F0 = T - DAY, F1 = NOW + DAY;
const xpAt = (id: number, key: string, src: string, at: number) => awardXp(db, id, key, src, 20, at);
xpAt(S1, 'pl1-event', 'placement', T + 10 * 60_000); xpAt(S1, 'ls1-event', 'lesson', T + 20 * 60_000); xpAt(S1, 'mk1-event', 'mock', T + 30 * 60_000);
xpAt(S1, 'd7a-event', 'lesson', T + 5 * 60_000 + 8 * DAY);                       // D7: ro'yxatdan 8 kun keyin faol
xpAt(S2, 'ls2-event', 'lesson', T + 30 * DAY + 3600_000);                         // faollashgan (7 kun ichida dars)
db.prepare("INSERT INTO user_events (player_id, name, day, first_ts, n) VALUES (?, 'plan_open', '2026-11-20', ?, 1)").run(S1, T);
const pay = (id: string, pid: number, status: string, amount: number) => db.prepare('INSERT INTO payments (id, player_id, track, days, amount, status, created_at, paid_at) VALUES (?, ?, ?, 30, ?, ?, ?, ?)').run(id, pid, 'exam', amount, status, T + DAY, status === 'success' ? T + DAY : null);
pay('p-ok', S1, 'success', 69000); pay('p-cancel', S2, 'cancelled', 49000);
db.prepare("INSERT INTO creator_refunds (payment_id, amount_minor, currency, at, recorded_by) VALUES ('p-ok', ?, 'UZS', ?, 1)").run(20000 * 100, T + 2 * DAY);

const fa = creatorFunnel(db, { creatorId: A, from: F0, to: F1, mode: 'last' }, NOW);
assert.ok(fa.clicks > fa.uniqueClicks && fa.uniqueClicks >= 3, `xom (${fa.clicks}) > noyob (${fa.uniqueClicks})`);
assert.ok(fa.filteredClicks >= 5, 'bot, dublikat, HEAD, UA yo‘q, ichki trafik filtrlangan hisoblanadi');
assert.ok(fa.landingViews >= 1 && fa.signupStarts >= 1);
assert.deepEqual({ signups: fa.signups, placement: fa.placement, mock: fa.mock, planOpen: fa.planOpen, firstLesson: fa.firstLesson, activated: fa.activated, checkout: fa.checkout, paid: fa.paid, refunded: fa.refunded },
  { signups: 5, placement: 1, mock: 1, planOpen: 1, firstLesson: 2, activated: 2, checkout: 2, paid: 1, refunded: 1 }, 'voronka (kredit: oxirgi tegish)');
assert.deepEqual(fa.d7, { eligible: 5, active: 1 }); assert.equal(fa.grossRevenue, 69000); assert.equal(fa.refundedSum, 20000); assert.equal(fa.netRevenue, 49000, 'sof tushum = tushum − qaytarilgan');
assert.deepEqual(fa.rates, { clickToSignup: Math.round((5 / fa.uniqueClicks) * 1000) / 10, signupToActivation: 40, activatedToD7: 20, activationToPaid: 50, refundRate: 100 });
assert.equal(fa.weakest, null, 'namuna 10 dan kam — "eng zaif bosqich" aytilmaydi');
// Kredit rejimi: first-touch A ni 6 ga, B ni 0 ga keltiradi (oxirgi tegish: B 1)
assert.equal(creatorFunnel(db, { creatorId: A, from: F0, to: F1, mode: 'first' }, NOW).signups, 6);
assert.equal(creatorFunnel(db, { creatorId: B, from: F0, to: F1, mode: 'last' }, NOW).signups, 1);
assert.equal(creatorFunnel(db, { creatorId: B, from: F0, to: F1, mode: 'first' }, NOW).signups, 0);
assert.equal(creatorFunnel(db, { creatorId: A, from: F0, to: F1 }, NOW, { CREATOR_ATTRIBUTION: 'first' } as NodeJS.ProcessEnv).mode, 'first', 'CREATOR_ATTRIBUTION=first');
assert.equal(creatorFunnel(db, { creatorId: A, from: F0, to: F1 }, NOW, {} as NodeJS.ProcessEnv).mode, 'last', 'standart: last (mavjud referred_by bilan mos)');
// Filtrlar va sana oralig'i
assert.equal(creatorFunnel(db, { creatorId: A, kind: 'reel', from: F0, to: F1, mode: 'last' }, NOW).signups, 1, 'platforma/tur bo‘yicha filtr');
assert.equal(creatorFunnel(db, { creatorId: A, lang: 'ru', from: F0, to: F1, mode: 'last' }, NOW).signups, 1, 'til bo‘yicha filtr');
assert.equal(creatorFunnel(db, { creatorId: A, linkCode: bio.code, from: F0, to: F1, mode: 'last' }, NOW).signups, 4, 'link bo‘yicha');
assert.equal(creatorFunnel(db, { creatorId: A, from: T + 100 * DAY, to: T + 101 * DAY, mode: 'last' }, NOW).signups, 0, 'sana oralig‘i');
assert.equal(creatorFunnel(db, { from: F0, to: F1, mode: 'last' }, NOW).signups, 6, 'admin: hamma hamkorlar (A 5 + B 1)');
// Creator boshqa creator'ning hisobini ko'rmaydi
assert.equal(creatorFunnel(db, { creatorId: B, linkCode: bio.code, from: F0, to: F1, mode: 'last' }, NOW).signups, 0, 'B A linkining voronkasini ko‘rmaydi');
// "eng zaif bosqich": yetarli namunada aniqlanadi
{
  const C = creator('Bloger C'); const cl = createLink(db, C, { kind: 'bio', label: 'C bio' }, T);
  for (let i = 0; i < 12; i++) { const c = click(cl.code, `10.0.0.${i}`, ua, T + i * 1000)!; signup({ ref: cl.code, cid: c.clickId }, T + i * 1000 + 500); }
  const f = creatorFunnel(db, { creatorId: C, from: F0, to: F1, mode: 'last' }, NOW);
  assert.equal(f.uniqueClicks, 12); assert.equal(f.signups, 12); assert.equal(f.rates.clickToSignup, 100); assert.equal(f.weakest, 'signup_to_activation', '12 ta ro‘yxat, 0 faollashgan → eng zaif bosqich');
}

// ---- Firibgarlik belgilari ----
{
  const flags = (kind: string) => (db.prepare('SELECT COUNT(*) AS n FROM creator_flags WHERE kind = ?').get(kind) as { n: number }).n;
  const D = creator('Bloger D'); const dl = createLink(db, D, { kind: 'reel', label: 'D reel' }, T);
  for (let i = 0; i < 3; i++) signup({ ref: dl.code }, T, 'samefp0000000000');
  assert.equal(flags('same_device_signups'), 1, 'bir qurilmadan 3 hisob → belgi (hisob bloklanmaydi)');
  noteCreatorDevice(db, D, 'creatordevice000');
  signup({ ref: dl.code }, T, 'creatordevice000'); assert.equal(flags('self_referral'), 1, 'creator qurilmasidan ro‘yxat → o‘z-o‘zini taklif gumoni');
  const cc = click(dl.code, '11.1.1.1', ua, T)!;
  for (let i = 0; i < 3; i++) signup({ ref: dl.code, cid: cc.clickId }, T);
  assert.equal(flags('click_reuse'), 1, 'bitta click bilan ko‘p hisob');
  for (let i = 0; i < 9; i++) click(dl.code, '12.2.2.2', ua, T + 20_000 + i * 11_000);
  assert.equal(scanClickBursts(db, T + 200_000), 1, 'bitta qurilmadan klik portlashi'); assert.equal(scanClickBursts(db, T + 200_000), 0, 'bir xil belgi takrorlanmaydi (dedupe)');
}

// ---- Saqlash muddati ----
{
  const before = (db.prepare('SELECT COUNT(*) AS n FROM creator_clicks').get() as { n: number }).n;
  purgeCreatorData(db, T + 100 * DAY); // 90 kundan eski barmoq izlari tozalanadi, 180 kundan eski clicklar o'chadi
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM creator_clicks WHERE fp IS NOT NULL AND ts < ?').get(T + 10 * DAY) as { n: number }).n, 0);
  purgeCreatorData(db, T + 400 * DAY);
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM creator_clicks').get() as { n: number }).n, 0); assert.ok(before > 0);
  assert.ok(attrib(S1), 'atribusiya yozuvi (anonim) saqlanadi');
}
console.log('creatorLinks.test: OK');
