import assert from 'node:assert/strict';
import { jpegToPdf } from './pdf';

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 0xff, 0xd9]);
const pdf = jpegToPdf(jpeg, 2339, 1654, 'SZ-TEST (x)');
const s = new TextDecoder('latin1').decode(pdf);
assert.ok(s.startsWith('%PDF-1.4'), 'PDF sarlavhasi');
assert.ok(s.includes('/MediaBox [0 0 842 595]'), 'A4 landscape (842×595 pt)');
assert.ok(s.includes('/Width 2339 /Height 1654') && s.includes('/Filter /DCTDecode'), 'JPEG rasm');
assert.ok(s.trimEnd().endsWith('%%EOF'));
// xref ofsetlari to'g'ri: har bir obyekt aynan ko'rsatilgan joyda boshlanadi
const xrefAt = Number(s.slice(s.lastIndexOf('startxref') + 9).trim().split('\n')[0]);
assert.ok(s.slice(xrefAt).startsWith('xref'), 'startxref xref jadvaliga ishora qiladi');
const offs = s.slice(xrefAt).split('\n').slice(3, 9).map((l) => Number(l.slice(0, 10)));
offs.forEach((o, i) => assert.ok(s.slice(o).startsWith(`${i + 1} 0 obj`), `obyekt ${i + 1} ofseti`));
assert.ok(!s.includes('(SZ-TEST (x))'), 'sarlavhadagi qavslar tozalanadi');
const port = new TextDecoder('latin1').decode(jpegToPdf(jpeg, 1654, 2339));
assert.ok(port.includes('/MediaBox [0 0 595 842]'), 'A4 portrait (595×842 pt)');
console.log('pdf.test: OK');
