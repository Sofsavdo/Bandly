// Creator Growth HTTP testi: haqiqiy server jarayoni + vaqtinchalik baza. /r/<kod> → bridge → ping → hodisa → ro'yxatdan o'tish → creator/admin API chegaralari.
// Haqiqiy pul, AI yoki foydalanuvchi ma'lumoti ishlatilmaydi.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'sz-creator-'));
const PORT = 38000 + Math.floor(Math.random() * 1500);
const env: NodeJS.ProcessEnv = {};
for (const [k, v] of Object.entries(process.env)) if (!/KEY|TOKEN|SECRET|HAMYON|TELEGRAM|^AI_|GEMINI|ELEVEN|S3|ADMIN|PUBLIC_URL|PRICE|CREATOR/i.test(k)) env[k] = v;
Object.assign(env, { PORT: String(PORT), HOST: '127.0.0.1', DB_PATH: join(dir, 'c.sqlite'), BACKUP_DISABLED: '1', NODE_ENV: 'test', ADMIN_NICKNAMES: 'AdminOne', API_RATE_PER_MIN: '5000' });
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; srv.stdout.on('data', (c) => (log += c)); srv.stderr.on('data', (c) => (log += c));
const base = `http://127.0.0.1:${PORT}`;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Instagram 300.0';
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* hali ishga tushmoqda */ }
    if (i > 150 || srv.exitCode !== null) throw new Error('server ishga tushmadi:\n' + log);
    await new Promise((r) => setTimeout(r, 200));
  }
  const api = async (path: string, o: { method?: string; token?: string; body?: unknown } = {}) => {
    const r = await fetch(base + path, { method: o.method ?? (o.body !== undefined ? 'POST' : 'GET'), headers: { 'content-type': 'application/json', ...(o.token ? { 'x-token': o.token } : {}) }, body: o.body !== undefined ? JSON.stringify(o.body) : undefined });
    return { status: r.status, json: await r.json().catch(() => ({})) as Record<string, any>, headers: r.headers }; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  const joinAs = async (nickname: string, extra: Record<string, unknown> = {}) => { const r = await api('/api/join', { body: { nickname, ...extra } }); assert.equal(r.status, 200, JSON.stringify(r.json)); return String(r.json.token); };
  const adminT = await joinAs('AdminOne'), aT = await joinAs('Bloger A'), bT = await joinAs('Bloger B'), xT = await joinAs('Oddiy X');
  for (const n of ['Bloger A', 'Bloger B']) assert.equal((await api('/api/staff/role', { token: adminT, body: { nickname: n, role: 'creator' } })).status, 200, 'admin laqab bilan creator rolini beradi');

  // ---- Link yaratish va chegaralar ----
  assert.equal((await api('/api/creator/links', { token: xT, body: { kind: 'bio', label: 'x' } })).status, 403, 'creator bo‘lmagan foydalanuvchi');
  assert.equal((await api('/api/creator/links', { body: { kind: 'bio', label: 'xx' } })).status, 401, 'tokensiz');
  assert.equal((await api('/api/creator/links', { token: aT, body: { kind: 'bio', label: 'a' } })).status, 400, 'nom juda qisqa');
  const la = (await api('/api/creator/links', { token: aT, body: { kind: 'bio', label: 'IG bio', lang: 'ru' } })).json.link; assert.match(la.code, /^[a-z2-9]{8}$/);
  const lb = (await api('/api/creator/links', { token: bT, body: { kind: 'tiktok', label: 'TikTok 1' } })).json.link;
  assert.equal((await api(`/api/creator/links/${la.code}/active`, { token: bT, body: { active: false } })).status, 404, 'boshqa creator linkini to‘xtata olmaydi');

  // ---- /r/<kod>: bridge sahifa, click, bot/HEAD filtr ----
  const human = await fetch(`${base}/r/${la.code}`, { headers: { 'user-agent': UA, 'accept-language': 'uz-UZ,uz;q=0.9' } });
  const html = await human.text();
  assert.equal(human.status, 200); assert.match(human.headers.get('content-type') ?? '', /text\/html/); assert.equal(human.headers.get('cache-control'), 'no-store');
  assert.match(human.headers.get('x-robots-tag') ?? '', /noindex/); assert.match(html, /<html lang="ru">/, 'link tili (ru) brauzer tilidan ustun');
  const cid = /[?&]cid=([a-f0-9]{16})/.exec(html)?.[1]; assert.ok(cid, 'inson uchun click identifikatori web havolada'); assert.match(html, new RegExp(`href="/\\?ref=${la.code}&amp;cid=${cid}#/"|href="/\\?ref=${la.code}&cid=${cid}#/"`)); assert.doesNotMatch(html, /t\.me\//, 'bot sozlanmagan — Telegram tugmasi yo‘q');
  assert.ok(!/\+998|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(html), 'sahifada telefon/IP yo‘q (shaxsiy ma’lumot yo‘q)');
  const bot = await (await fetch(`${base}/r/${la.code}`, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } })).text();
  assert.doesNotMatch(bot, /cid=/, 'bot uchun click identifikatori berilmaydi');
  const head = await fetch(`${base}/r/${la.code}`, { method: 'HEAD', headers: { 'user-agent': UA } }); assert.equal(head.status, 200); assert.equal((await head.text()), '');
  const unk = await fetch(`${base}/r/zzzzzzzz`, { redirect: 'manual' }); assert.equal(unk.status, 302); assert.equal(unk.headers.get('location'), '/', 'noma’lum kod — bosh sahifaga (404 emas)');
  await fetch(`${base}/r/${la.code}`, { headers: { 'user-agent': UA } }); // takror (dublikat: 10 soniya ichida)
  // ---- Ping va click bilan bog'langan hodisa (faqat ruxsat etilgan nomlar) ----
  assert.equal((await api('/api/creator/ping', { body: { cid } })).status, 204);
  assert.equal((await api('/api/event', { body: { name: 'signup_start', vid: 'v'.repeat(24), cid, revenue: 999999, paid: true } })).status, 204);
  assert.equal((await api('/api/event', { body: { name: 'payment_success', vid: 'v'.repeat(24), cid } })).status, 204, 'ro‘yxatda yo‘q nom e’tiborsiz (204, lekin sanalmaydi)');
  // ---- Ro'yxatdan o'tish: first/last va click bilan ----
  const sT = await joinAs('Student One', { ref: la.code, ref0: la.code, cid });
  assert.ok(sT);
  const ov = (await api('/api/creator/overview?days=30', { token: aT })).json;
  assert.equal(ov.funnel.signups, 1, 'ro‘yxat creator voronkasida'); assert.equal(ov.funnel.uniqueClicks, 1, 'noyob klik'); assert.ok(ov.funnel.clicks >= 1 && ov.funnel.filteredClicks >= 2, 'xom/filtrlangan alohida (bot, HEAD, dublikat)');
  assert.equal(ov.funnel.landingViews, 1); assert.equal(ov.funnel.signupStarts, 1, 'bir click — bir hodisa'); assert.equal(ov.funnel.grossRevenue, 0, 'mijozdan kelgan tushum/paid e’tiborga olinmadi');
  assert.equal(ov.links.length, 1); assert.equal(ov.links[0].signups, 1);
  const ovB = (await api('/api/creator/overview', { token: bT })).json; assert.equal(ovB.funnel.signups, 0, 'B A ning ro‘yxatlarini ko‘rmaydi'); assert.equal(ovB.links.length, 1); assert.equal(ovB.links[0].code, lb.code);
  assert.equal((await api('/api/creator/overview', { token: xT })).status, 403); assert.equal((await api('/api/creator/overview')).status, 401);
  assert.ok(!JSON.stringify(ov).match(/Student|nickname|phone|email|tg_id|token/i), 'creator javobida o‘quvchi ma’lumoti yo‘q (agregat)');
  // Eski oqim: shaxsiy ref kodi ham ishlaydi; eski /api/creator javobi saqlangan
  const code0 = (await api('/api/referral', { token: aT })).json.code as string; await joinAs('Eski Ref', { ref: code0 });
  const legacy = (await api('/api/creator', { token: aT })).json; assert.equal(legacy.me.invited, 2, 'eski referral: shaxsiy kod ham, link kodi ham referred_by orqali hisoblanadi'); assert.ok('bot' in legacy && 'all' in legacy);
  assert.equal((await api('/api/creator', { token: adminT })).json.all.length, 2, 'admin barcha hamkorlarni ko‘radi');

  // ---- Post topshirish va admin tasdiqlash ----
  const post = (await api('/api/creator/posts', { token: aT, body: { platform: 'instagram', url: 'https://www.instagram.com/reel/AbC123/', lang: 'ru', postedOn: new Date().toISOString().slice(0, 10), caption: 'IELTS maslahati #reklama', linkCode: la.code, claimedViews: 5000, submit: true } })).json.post;
  assert.equal(post.status, 'submitted'); assert.equal(post.viewsVerified, false);
  assert.equal((await api('/api/creator/posts', { token: bT, body: { platform: 'instagram', url: 'https://instagram.com/reel/abc123', lang: 'uz', postedOn: new Date().toISOString().slice(0, 10), caption: 'Boshqa caption matni', linkCode: lb.code, submit: true } })).status, 409, 'dublikat havola');
  assert.equal((await api('/api/creator/posts', { token: bT })).json.posts.length, 0, 'B A postlarini ko‘rmaydi');
  assert.equal((await api(`/api/creatoradmin/posts/${post.id}/review`, { token: aT, body: { decision: 'approved' } })).status, 403, 'creator o‘z postini tasdiqlay olmaydi');
  assert.equal((await api(`/api/creatoradmin/posts/${post.id}/review`, { token: adminT, body: { decision: 'approved', note: 'ok', verifiedViews: 4800 } })).json.post.status, 'approved');
  const mine = (await api('/api/creator/posts', { token: aT })).json.posts[0]; assert.equal(mine.status, 'approved'); assert.equal(mine.claimedViews, 5000); assert.equal(mine.verifiedViews, 4800);

  // ---- Admin CRM, CSV, belgilar ----
  assert.equal((await api('/api/creatoradmin/list', { token: aT })).status, 403, 'creator admin ro‘yxatini ko‘rmaydi'); assert.equal((await api('/api/creatoradmin/list', { token: xT })).status, 403);
  const adm = (await api('/api/creatoradmin/list?days=30', { token: adminT })).json; assert.equal(adm.creators.length, 2); assert.equal(adm.program.commissionEnabled, false, 'komissiya standart o‘chiq'); assert.ok(adm.kpis.funnel);
  const csv = await fetch(`${base}/api/creatoradmin/export.csv`, { headers: { 'x-token': adminT } }); assert.equal(csv.status, 200); assert.match(csv.headers.get('content-type') ?? '', /text\/csv/); const csvText = await csv.text();
  assert.match(csvText.split('\n')[0]!, /^nickname,status/); assert.ok(!/Student|phone|email/i.test(csvText), 'CSV: o‘quvchi ma’lumoti yo‘q');
  assert.equal((await fetch(`${base}/api/creatoradmin/export.csv`, { headers: { 'x-token': aT } })).status, 403, 'CSV faqat admin');
  assert.equal((await fetch(`${base}/api/creatoradmin/export.csv`)).status, 401);
  assert.equal((await api('/api/creatoradmin/profile', { token: adminT, body: { nickname: 'Bloger B', status: 'paused', locale: 'ru' } })).json.profile.status, 'paused');
  assert.equal((await api('/r/' + lb.code)).status === 200, true); // to'xtatilgan hamkor linki baribir saytga yo'naltiradi (atribusiyasiz)
  const sB = await joinAs('Student Two', { ref: lb.code, ref0: lb.code });
  assert.ok(sB); assert.equal((await api('/api/creator/overview', { token: bT })).json.funnel.signups, 0, 'to‘xtatilgan hamkor yangi atribusiya olmaydi');
  // ---- Mukofot: standart o'chiq, avtomatik hisoblash yo'q; yoqish egasi tasdig'isiz bo'lmaydi ----
  assert.deepEqual((await api('/api/creatoradmin/accrue', { token: adminT, body: {} })).json, { created: 0, skipped: {}, disabled: true });
  assert.equal((await api('/api/creatoradmin/program', { token: adminT, body: { commissionEnabled: true } })).status, 409);
  const rw = (await api('/api/creator/rewards', { token: aT })).json; assert.equal(rw.enabled, false); assert.deepEqual(rw.entries, []);
  assert.equal((await api('/api/creator/rewards', { token: xT })).status, 403);
  assert.equal((await api('/api/creator/ranking', { token: aT })).status, 200);
  console.log('creatorApi.test: OK');
} catch (e) {
  console.error(e, '\n--- server log ---\n', log.slice(-1500)); process.exitCode = 1;
} finally {
  srv.kill(); rmSync(dir, { recursive: true, force: true });
}
