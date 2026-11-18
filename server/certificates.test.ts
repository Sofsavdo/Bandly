import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readingTests } from '../src/content/readingTests';
import { listeningTests } from '../src/content/listeningTests';
import { ApiError, byToken, createDb, join as joinPlayer } from './db';
import { gradeRequest } from './mockGrade';
import {
  CERT_ID_RE, VALID_MS, auditLog, claimAll, composeFull, imageKind, issueFor, myCertificates, newCertId, publicCertificate, recordResult,
  revokeCertificate, rules, savePhoto, searchCertificates, setFullName, setRule, setSettings, settings,
} from './certificates';

const media = mkdtempSync(join(tmpdir(), 'sellzen-cert-'));
const db = createDb();
const T = Date.UTC(2026, 10, 18, 8);
const a = joinPlayer(db, 'Certchi', T), b = joinPlayer(db, 'Boshqa', T);
const pa = byToken(db, a.token).id, pb = byToken(db, b.token).id;
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1]), Buffer.alloc(200, 7)]);
const fails = (f: () => unknown, status: number, m: string) => assert.throws(f, (e: ApiError) => e.status === status, m);
const key = (q: { type: string; answer?: unknown; answers?: string[] }) => (q.type === 'fill' ? q.answers![0]! : q.answer) as string | number;
const rt = readingTests.find((x) => x.exam !== 'cefr' && x.level === 'C1')!;
const lt = listeningTests.find((x) => x.exam !== 'cefr')!;
const all = <Q extends { id: number; type: string }>(qs: Q[]) => Object.fromEntries(qs.map((q) => [q.id, key(q as never)]));
const half = <Q extends { id: number; type: string }>(qs: Q[]) => Object.fromEntries(qs.slice(0, Math.ceil(qs.length / 2)).map((q) => [q.id, key(q as never)]));

/** To'liq imtihon: L va R serverda baholanadi, W va S — AI natijasi (server yozadi), so'ng server to'rttasini yig'adi. */
function fullExam(token: string, pid: number, start: number, w: number, s: number, rAnswers = all(rt.questions), tag = String(start)) {
  gradeRequest(db, token, { kind: 'listening', testId: lt.id, answers: all(lt.questions), attemptId: `att-l-${tag}` }, [], start + 100, media);
  gradeRequest(db, token, { kind: 'reading', testId: rt.id, answers: rAnswers, attemptId: `att-r-${tag}` }, [], start + 200, media);
  recordResult(db, pid, { module: 'ai', kind: 'writing', testId: 'ai-writing', title: 'Writing', attemptKey: `ai:writing:${tag}`, band: w }, start + 300);
  recordResult(db, pid, { module: 'ai', kind: 'speaking', testId: 'ai-speaking', title: 'Speaking', attemptKey: `ai:speaking:${tag}`, band: s }, start + 400);
  return composeFull(db, pid, start, lt.id, rt.id, start + 1000);
}

// ID: format, yagona, taxmin qilib bo'lmaydigan (60 bit)
const ids = new Set(Array.from({ length: 5000 }, newCertId));
assert.equal(ids.size, 5000, 'ID takrorlanmaydi');
assert.ok([...ids].every((x) => CERT_ID_RE.test(x)), 'ID formati SZ-XXXX-XXXX-XXXX');

// Bitta bo'limli test uchun sertifikat berilmaydi (rasm va ism bo'lsa ham)
setFullName(db, pa, 'Aziza Karimova'); savePhoto(db, pa, JPG, media);
const single = gradeRequest(db, a.token, { kind: 'reading', testId: rt.id, answers: all(rt.questions), attemptId: 'att-single-01' }, [], T, media);
assert.ok(single.resultId); assert.deepEqual(single.certificates, [], 'bitta ball bilan sertifikat berilmaydi');
assert.deepEqual(issueFor(db, pa, single.resultId!, media).issued, []);

// Rasm tekshiruvi
fails(() => savePhoto(db, pa, Buffer.from('<svg onload=alert(1)>'), media), 415, 'SVG/HTML rasm sifatida qabul qilinmaydi');
fails(() => savePhoto(db, pa, Buffer.concat([JPG, Buffer.alloc(2 * 1024 * 1024)]), media), 413, '2 MB dan katta rasm rad etiladi');
assert.equal(imageKind(JPG), 'jpg');
fails(() => setFullName(db, pa, 'A'), 400, 'qisqa ism rad etiladi');
fails(() => setFullName(db, pa, '<script>x</script> y'), 400, 'belgilar bilan ism rad etiladi');

// Rasmsiz o'quvchi: to'liq imtihondan keyin ham sertifikat yo'q, rasm yuklagach beriladi
const fb = fullExam(b.token, pb, T + 10_000, 7, 7.5, all(rt.questions), 'b1');
const nb = issueFor(db, pb, fb.id, media, T + 11_000);
assert.deepEqual(nb.issued, []); assert.deepEqual(nb.missing.sort(), ['name', 'photo'], 'profil rasmi va ism majburiy');
setFullName(db, pb, 'Jasur Abdullayev'); savePhoto(db, pb, JPG, media);
assert.ok(claimAll(db, pb, media, T + 12_000).some((c) => c.type === 'participation'), 'rasm yuklangach sertifikat beriladi');

// To'liq imtihon: 4 bo'lim ham server natijasi bo'lishi shart
const start = T + 20_000;
fails(() => composeFull(db, pa, start, lt.id, rt.id, start + 1000), 409, 'bo‘limlar yo‘q — to‘liq natija yo‘q');
const full = fullExam(a.token, pa, start, 7, 7.5);
assert.deepEqual(Object.keys(full.skills).sort(), ['listening', 'reading', 'speaking', 'writing']);
assert.equal(composeFull(db, pa, start, lt.id, rt.id, start + 2000).id, full.id, 'bir imtihon — bitta natija');
const fi = issueFor(db, pa, full.id, media, start + 3000);
assert.deepEqual(fi.issued.map((c) => c.type).sort(), ['achievement', 'participation'], 'yuqori natija — ikkala sertifikat');
assert.deepEqual(issueFor(db, pa, full.id, media, start + 4000).issued, [], 'takror sertifikat yaratilmaydi');
const ach = myCertificates(db, pa).find((c) => c.type === 'achievement')!;
assert.equal(ach.data.name, 'Aziza Karimova');
assert.ok(existsSync(join(media, ach.data.photo)) && ach.data.photo.startsWith('cert-'), 'profil rasmi nusxasi sertifikatda');
assert.deepEqual(Object.keys(ach.data.skills).sort(), ['listening', 'reading', 'speaking', 'writing'], '4 ko‘nikma balli');
assert.ok(typeof ach.data.overall === 'number' && ach.data.cefr, 'Overall va CEFR');
assert.ok(ach.data.examName.startsWith('Sellzen Full Mock Exam · IELTS format'));
assert.equal(ach.verifyUrl, `https://sellzen.uz/certificate/${ach.id}`);
assert.equal(ach.validUntil, ach.issuedAt + VALID_MS, 'amal qilish muddati — 1 yil');
assert.ok(!/not official|unofficial|estimated|taxminiy|rasmiy emas/i.test(JSON.stringify(myCertificates(db, pa))), 'salbiy/ishonchsiz iboralar yo‘q');

// Past natija: faqat participation (minimal ball talab qilinmaydi); javob berilmagan Reading — sertifikat yo'q
const low = fullExam(a.token, pa, T + 40_000, 4, 4, Object.fromEntries(rt.questions.map((q) => [q.id, 'zzz'])), 'low');
assert.deepEqual(issueFor(db, pa, low.id, media, T + 41_000).issued.map((c) => c.type), ['participation']);
const part = fullExam(a.token, pa, T + 60_000, 7, 7, half(rt.questions), 'part');
assert.deepEqual(issueFor(db, pa, part.id, media, T + 61_000).issued, [], 'test to‘liq yakunlanmagan — sertifikat yo‘q');

// Begona natija, alohida AI mashqi
fails(() => issueFor(db, pb, full.id, media), 404, 'boshqa o‘quvchining natijasi bilan sertifikat olinmaydi');
const ai = recordResult(db, pa, { module: 'ai', kind: 'writing', testId: 'ai-writing', title: 'Writing', attemptKey: 'ai:writing:x1', band: 9 }, T);
assert.deepEqual(issueFor(db, pa, ai.result.id, media).issued, [], 'alohida AI mashqi uchun sertifikat yo‘q');
fails(() => composeFull(db, pb, start, lt.id, rt.id, start + 1000), 409, 'boshqa o‘quvchi birovning bo‘limlarini yig‘a olmaydi');

// Ommaviy tekshirish: shaxsiy ma'lumotsiz; muddat; noto'g'ri ID — 404
const pub = publicCertificate(db, ach.id.toLowerCase(), ach.issuedAt + 1000);
assert.equal(pub.status, 'valid'); assert.ok(!('player_id' in pub) && !JSON.stringify(pub).includes('Certchi'), 'laqab/ID oshkor qilinmaydi');
assert.equal(publicCertificate(db, ach.id, ach.issuedAt + VALID_MS + 1000).status, 'expired', '1 yildan keyin muddati tugagan');
fails(() => publicCertificate(db, 'SZ-0000-0000-0000'), 404, 'taxmin qilingan ID topilmaydi');
fails(() => publicCertificate(db, "' OR 1=1 --"), 404, 'yaroqsiz ID');

// Bekor qilish (admin) — audit logda, tekshirish sahifasida holat
fails(() => revokeCertificate(db, pb, ach.id, ''), 400, 'sabab majburiy');
assert.equal(revokeCertificate(db, pb, ach.id, 'Test qoidasi buzilgan', start + 9000).status, 'revoked');
assert.equal(publicCertificate(db, ach.id, start + 10_000).status, 'revoked');
fails(() => revokeCertificate(db, pb, ach.id, 'yana bir bor'), 409, 'ikki marta bekor qilinmaydi');
assert.ok((auditLog(db) as { action: string }[]).some((x) => x.action === 'cert.revoke'), 'audit logga yozildi');
assert.ok(searchCertificates(db, 'Aziza').length >= 2, 'admin qidiruvi');

// Admin mezonlari: faqat to'liq imtihon moduli; chegara o'zgaradi va audit qilinadi
assert.deepEqual(rules(db).map((r) => r.module), ['ielts-full']);
setRule(db, pb, { module: 'ielts-full', minBand: 9 });
const top = fullExam(a.token, pa, T + 80_000, 7, 7, all(rt.questions), 'top');
assert.deepEqual(issueFor(db, pa, top.id, media, T + 81_000).issued.map((c) => c.type), ['participation'], 'yangi mezon qo‘llanadi');
fails(() => setRule(db, pb, { module: 'nope' as never }), 400, 'noma’lum modul');
setSettings(db, pb, { signerName: 'Sellzen Board' }); assert.equal(settings(db).signerName, 'Sellzen Board');

// Migratsiya qayta ishga tushganda xato yo'q
const { ensureCertTables } = await import('./certificates');
ensureCertTables(db); ensureCertTables(db);
rmSync(media, { recursive: true, force: true });
console.log('certificates.test: OK');
