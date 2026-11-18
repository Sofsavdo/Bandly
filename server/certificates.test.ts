import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readingTests } from '../src/content/readingTests';
import { listeningTests } from '../src/content/listeningTests';
import { ApiError, byToken, createDb, join as joinPlayer } from './db';
import { gradeRequest } from './mockGrade';
import {
  CERT_ID_RE, auditLog, claimAll, composeFull, imageKind, issueFor, myCertificates, newCertId, publicCertificate, recordResult,
  revokeCertificate, rules, savePhoto, searchCertificates, setFullName, setRule, setSettings, settings,
} from './certificates';

const media = mkdtempSync(join(tmpdir(), 'sellzen-cert-'));
const db = createDb();
const T = Date.UTC(2026, 10, 18, 8);
const a = joinPlayer(db, 'Certchi', T), b = joinPlayer(db, 'Boshqa', T);
const pa = byToken(db, a.token).id, pb = byToken(db, b.token).id;
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1]), Buffer.alloc(200, 7)]);
const fails = (f: () => unknown, status: number, m: string) => assert.throws(f, (e: ApiError) => e.status === status, m);

const t = readingTests.find((x) => x.exam !== 'cefr' && (x.level === 'B2' || x.level === 'C1'))!;
const right = Object.fromEntries(t.questions.map((q) => [q.id, q.type === 'fill' ? q.answers[0]! : q.answer]));
const half = Object.fromEntries(t.questions.slice(0, Math.ceil(t.questions.length / 2)).map((q) => [q.id, q.type === 'fill' ? q.answers[0]! : q.answer]));

// ID: format, yagona, taxmin qilib bo'lmaydigan (60 bit)
const ids = new Set(Array.from({ length: 5000 }, newCertId));
assert.equal(ids.size, 5000, 'ID takrorlanmaydi');
assert.ok([...ids].every((x) => CERT_ID_RE.test(x)), 'ID formati SZ-XXXX-XXXX-XXXX');

// Rasm va ismsiz — sertifikat berilmaydi, natija saqlanadi
const g1 = gradeRequest(db, a.token, { kind: 'reading', testId: t.id, answers: right, attemptId: 'att-cert-0001' }, [], T, media);
assert.ok(g1.resultId, 'natija serverda saqlandi');
assert.deepEqual(g1.certificates, []); assert.deepEqual(g1.certMissing.sort(), ['name', 'photo'], 'rasm va ism yo‘qligi aytiladi');

// Rasm tekshiruvi: tur mazmundan, hajm cheklovi
fails(() => savePhoto(db, pa, Buffer.from('<svg onload=alert(1)>'), media), 415, 'SVG/HTML rasm sifatida qabul qilinmaydi');
fails(() => savePhoto(db, pa, Buffer.concat([JPG, Buffer.alloc(2 * 1024 * 1024)]), media), 413, '2 MB dan katta rasm rad etiladi');
assert.equal(imageKind(JPG), 'jpg');
fails(() => setFullName(db, pa, 'A'), 400, 'qisqa ism rad etiladi');
fails(() => setFullName(db, pa, '<script>x</script> y'), 400, 'belgilar bilan ism rad etiladi');
setFullName(db, pa, 'Aziza Karimova');
savePhoto(db, pa, JPG, media);

// Rasm yuklangandan keyin: oldingi natija uchun sertifikat olish
const claimed = claimAll(db, pa, media, T + 1000);
assert.ok(claimed.some((c) => c.type === 'participation'), 'participation berildi');
assert.ok(claimed.some((c) => c.type === 'achievement'), 'yuqori natija — achievement ham');
assert.deepEqual(claimAll(db, pa, media, T + 2000), [], 'takror sertifikat yaratilmaydi');
// Bir xil urinish qayta yuborilsa — yangi natija ham, sertifikat ham yo'q
const again = gradeRequest(db, a.token, { kind: 'reading', testId: t.id, answers: right, attemptId: 'att-cert-0001' }, [], T + 3000, media);
assert.equal(again.resultId, g1.resultId); assert.deepEqual(again.certificates, []);

// Past natija: faqat participation; to'liq javob bermagan test: hech narsa
const low = gradeRequest(db, a.token, { kind: 'reading', testId: t.id, answers: Object.fromEntries(t.questions.map((q) => [q.id, 'zzz'])), attemptId: 'att-cert-0002' }, [], T + 4000, media);
assert.deepEqual(low.certificates.map((c) => c.type), ['participation'], 'minimal ball talab qilinmaydi, achievement yo‘q');
const part = gradeRequest(db, a.token, { kind: 'reading', testId: t.id, answers: half, attemptId: 'att-cert-0003' }, [], T + 5000, media);
assert.deepEqual(part.certificates, [], 'test to‘liq yakunlanmagan — sertifikat yo‘q');

// Sertifikat ma'lumoti: ism, rasm nusxasi, imtihon nomi, natija (faqat shu ko'nikma)
const mine = myCertificates(db, pa);
const ach = mine.find((c) => c.type === 'achievement')!;
assert.equal(ach.data.name, 'Aziza Karimova');
assert.ok(existsSync(join(media, ach.data.photo)) && ach.data.photo.startsWith('cert-'), 'rasm nusxasi saqlangan');
assert.ok(ach.data.examName.startsWith('Sellzen Mock Test · IELTS format'), 'imtihon nomi Sellzen nomidan');
assert.deepEqual(Object.keys(ach.data.skills), ['reading'], 'faqat mavjud ko‘nikma ko‘rsatiladi');
assert.ok(ach.data.cefr && ach.verifyUrl === `https://sellzen.uz/certificate/${ach.id}`);
const banned = /not official|unofficial|estimated|taxminiy|rasmiy emas/i;
assert.ok(!banned.test(JSON.stringify(mine)), 'salbiy/ishonchsiz iboralar yo‘q');

// Soxta natija: mijoz ball yubora olmaydi — sertifikat faqat server natijasidan; begona natija
fails(() => issueFor(db, pb, g1.resultId!, media), 404, 'boshqa o‘quvchining natijasi bilan sertifikat olinmaydi');
const ai = recordResult(db, pa, { module: 'ai', kind: 'writing', testId: 'ai-writing', title: 'Writing', attemptKey: 'ai:writing:x1', band: 9 }, T);
assert.deepEqual(issueFor(db, pa, ai.result.id, media).issued, [], 'alohida AI mashqi uchun sertifikat yo‘q');

// Ommaviy tekshirish: shaxsiy ma'lumotsiz; noto'g'ri/taxminiy ID — 404
const pub = publicCertificate(db, ach.id.toLowerCase());
assert.equal(pub.status, 'valid'); assert.ok(!('player_id' in pub) && !JSON.stringify(pub).includes('Certchi'), 'laqab/ID oshkor qilinmaydi');
fails(() => publicCertificate(db, 'SZ-0000-0000-0000'), 404, 'taxmin qilingan ID topilmaydi');
fails(() => publicCertificate(db, "' OR 1=1 --"), 404, 'yaroqsiz ID');

// Bekor qilish (admin) — audit logda, tekshirish sahifasida holat
fails(() => revokeCertificate(db, pb, ach.id, ''), 400, 'sabab majburiy');
const rv = revokeCertificate(db, pb, ach.id, 'Test qoidasi buzilgan', T + 9000);
assert.equal(rv.status, 'revoked'); assert.equal(publicCertificate(db, ach.id).status, 'revoked');
fails(() => revokeCertificate(db, pb, ach.id, 'yana bir bor'), 409, 'ikki marta bekor qilinmaydi');
assert.ok((auditLog(db) as { action: string }[]).some((x) => x.action === 'cert.revoke'), 'audit logga yozildi');
assert.ok(searchCertificates(db, 'Aziza').length >= 2, 'admin qidiruvi');

// Admin mezonlari: achievement chegarasi o'zgaradi va audit qilinadi
setRule(db, pb, { module: 'ielts-skill', minBand: 9 });
assert.equal(rules(db).find((r) => r.module === 'ielts-skill')!.minBand, 9);
const hi = gradeRequest(db, a.token, { kind: 'reading', testId: t.id, answers: right, attemptId: 'att-cert-0004' }, [], T + 10_000, media);
assert.equal(hi.certificates.some((c) => c.type === 'achievement'), (hi.correct === hi.total && (t.level === 'C1')), 'yangi mezon qo‘llanadi');
fails(() => setRule(db, pb, { module: 'nope' as never }), 400, 'noma’lum modul');
setSettings(db, pb, { signerName: 'Sellzen Board' }); assert.equal(settings(db).signerName, 'Sellzen Board');

// To'liq imtihon: 4 bo'lim ham server natijasi bo'lishi shart
const lt = listeningTests.find((x) => x.exam !== 'cefr')!;
const start = T + 20_000;
fails(() => composeFull(db, pa, start, lt.id, t.id, start + 1000), 409, 'bo‘limlar yo‘q — to‘liq natija yo‘q');
const lr = Object.fromEntries(lt.questions.map((q) => [q.id, q.type === 'fill' ? q.answers[0]! : q.answer]));
gradeRequest(db, a.token, { kind: 'listening', testId: lt.id, answers: lr, attemptId: 'att-full-l1' }, [], start + 100, media);
gradeRequest(db, a.token, { kind: 'reading', testId: t.id, answers: right, attemptId: 'att-full-r1' }, [], start + 200, media);
recordResult(db, pa, { module: 'ai', kind: 'writing', testId: 'ai-writing', title: 'Writing', attemptKey: 'ai:writing:full1', band: 6.5 }, start + 300);
fails(() => composeFull(db, pa, start, lt.id, t.id, start + 1000), 409, 'Speaking yo‘q');
recordResult(db, pa, { module: 'ai', kind: 'speaking', testId: 'ai-speaking', title: 'Speaking', attemptKey: 'ai:speaking:full1', band: 6 }, start + 400);
const full = composeFull(db, pa, start, lt.id, t.id, start + 1000);
assert.deepEqual(Object.keys(full.skills).sort(), ['listening', 'reading', 'speaking', 'writing']);
assert.equal(composeFull(db, pa, start, lt.id, t.id, start + 2000).id, full.id, 'bir imtihon — bitta natija');
const fi = issueFor(db, pa, full.id, media, start + 3000);
assert.ok(fi.issued.some((c) => c.type === 'participation'));
const fc = myCertificates(db, pa).find((c) => c.data.kind === 'full')!;
assert.ok(fc.data.overall !== null && fc.data.skills.writing === 6.5 && fc.data.cefr, '4 ko‘nikma va CEFR darajasi');
fails(() => composeFull(db, pb, start, lt.id, t.id, start + 1000), 409, 'boshqa o‘quvchi birovning bo‘limlarini yig‘a olmaydi');

// Migratsiya qayta ishga tushganda xato yo'q
const { ensureCertTables } = await import('./certificates');
ensureCertTables(db); ensureCertTables(db);
rmSync(media, { recursive: true, force: true });
console.log('certificates.test: OK');
