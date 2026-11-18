// i18n-ignore-file: sertifikat matni ataylab inglizcha (xalqaro format), interfeys tiliga qarab o‘zgarmaydi.
// Sellzen sertifikatini Canvas'da chizadi: A4 landscape (2339×1654 px ≈ 200 dpi). Ko'rish, PNG va PDF — bir xil rasm.
// Dizayn: to'q ko'k + teal, Sellzen belgisi va o'z muhri; boshqa tashkilot blankasi, logotipi yoki muhri ishlatilmaydi.
import qrcode from 'qrcode-generator';
import { jpegToPdf } from './pdf';

export type CertType = 'participation' | 'achievement';
export interface CertData {
  name: string; photo: string; examName: string; module: string; kind: string; testDate: string;
  skills: { listening?: number; reading?: number; writing?: number; speaking?: number }; overall: number | null; cefr: string | null;
  correct: number | null; total: number | null; percent: number | null; signerName: string; signerTitle: string;
}
export interface CertView { id: string; type: CertType; status: 'valid' | 'revoked'; issuedAt: number; revokedAt: number | null; data: CertData; verifyUrl: string; photoUrl: string }

export const W = 2339, H = 1654;
const NAVY = '#0B1F3A', NAVY2 = '#16325C', TEAL = '#14B8A6', TEAL_D = '#0F766E', MINT = '#99F6E4', PAPER = '#FBFCFD', INK = '#0B1F3A', MUTED = '#51627A';
const DISPLAY = '"Outfit Variable", Outfit, "Segoe UI", Arial, sans-serif';
const BODY = '"Inter Variable", Inter, "Segoe UI", Arial, sans-serif';
export const TITLE: Record<CertType, string> = { participation: 'SELLZEN — CERTIFICATE OF PARTICIPATION', achievement: 'SELLZEN — CERTIFICATE OF ACHIEVEMENT' };
const SKILLS: [keyof CertData['skills'], string][] = [['listening', 'Listening'], ['reading', 'Reading'], ['writing', 'Writing'], ['speaking', 'Speaking']];
const fmtDate = (iso: string) => { const d = new Date(`${iso}T12:00:00Z`); return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }); };

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}
function mark(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
  g.save(); g.translate(x, y); g.scale(s / 100, s / 100);
  g.fillStyle = NAVY; g.beginPath(); g.roundRect(2, 2, 96, 96, 26); g.fill();
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = '#2DD4BF'; g.lineWidth = 10.5; g.stroke(new Path2D('M67 27C63.5 21.5 57 18.5 50 18.5C40 18.5 33 24 33 31.5C33 40 41 42.5 50 44.5C59.5 46.5 67.5 49.5 67.5 58C67.5 65.5 60 70.5 50.5 70.5C42.5 70.5 36 67 33 61'));
  g.strokeStyle = MINT; g.lineWidth = 4.5; g.stroke(new Path2D('M18 76.5C28 72.5 40 72.5 50 79C60 72.5 72 72.5 82 76.5')); g.stroke(new Path2D('M50 79V84'));
  g.restore();
}
function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = '';
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function fitText(g: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, maxW: number): number {
  let px = start; g.font = font(px); while (g.measureText(text).width > maxW && px > 30) { px -= 4; g.font = font(px); } return px;
}
/** Sellzen muhri: teal halqa, belgi va aylana bo'ylab yozuv. */
function seal(g: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  g.save();
  g.fillStyle = '#ECFDF9'; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = TEAL_D; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, r - 6, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, r - 42, 0, Math.PI * 2); g.stroke();
  const txt = 'SELLZEN · VERIFIED CERTIFICATE · SELLZEN.UZ · '; g.fillStyle = TEAL_D; g.font = `700 ${Math.round(r * 0.17)}px ${DISPLAY}`;
  const step = (Math.PI * 2) / txt.length;
  for (let i = 0; i < txt.length; i++) { g.save(); g.translate(cx, cy); g.rotate(i * step); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt[i]!, 0, -(r - 23)); g.restore(); }
  const ms = r * 0.7; mark(g, cx - ms / 2, cy - ms / 2, ms);
  g.restore();
}
function qr(g: CanvasRenderingContext2D, url: string, x: number, y: number, size: number) {
  const q = qrcode(0, 'M'); q.addData(url); q.make();
  const n = q.getModuleCount(); const cell = Math.floor(size / (n + 2)); const off = Math.floor((size - cell * n) / 2);
  g.fillStyle = '#fff'; g.fillRect(x, y, size, size);
  g.fillStyle = NAVY;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect(x + off + c * cell, y + off + r * cell, cell, cell);
}

export async function renderCertificate(c: CertView, origin = typeof location !== 'undefined' ? location.origin : ''): Promise<HTMLCanvasElement> {
  try { await Promise.all([document.fonts.load(`600 60px ${DISPLAY}`), document.fonts.load(`500 30px ${BODY}`)]); } catch { /* standart shrift */ }
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!;
  const d = c.data; const ach = c.type === 'achievement';
  // Qog'oz va ramka
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  g.fillStyle = NAVY; g.fillRect(0, 0, W, 26); g.fillRect(0, H - 26, W, 26);
  g.strokeStyle = NAVY; g.lineWidth = 10; g.strokeRect(60, 60, W - 120, H - 120);
  g.strokeStyle = TEAL; g.lineWidth = 3; g.strokeRect(84, 84, W - 168, H - 168);
  // Burchak naqshlari
  g.strokeStyle = TEAL_D; g.lineWidth = 4;
  for (const [x, y, sx, sy] of [[84, 84, 1, 1], [W - 84, 84, -1, 1], [84, H - 84, 1, -1], [W - 84, H - 84, -1, -1]] as const) {
    g.beginPath(); g.moveTo(x + sx * 20, y + sy * 110); g.lineTo(x + sx * 20, y + sy * 20); g.lineTo(x + sx * 110, y + sy * 20); g.stroke();
    g.beginPath(); g.arc(x + sx * 20, y + sy * 20, 8, 0, Math.PI * 2); g.fillStyle = TEAL_D; g.fill();
  }
  // Nozik fon chiziqlari (gilosh uslubida)
  g.save(); g.globalAlpha = 0.05; g.strokeStyle = NAVY2; g.lineWidth = 2;
  for (let i = 0; i < 22; i++) { g.beginPath(); for (let x = 120; x <= W - 120; x += 12) { const y = H / 2 + Math.sin((x / W) * Math.PI * 6 + i * 0.35) * (90 + i * 22); x === 120 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  g.restore();
  // Sarlavha qismi: logotip va ID
  mark(g, 170, 150, 110);
  g.fillStyle = INK; g.font = `650 64px ${DISPLAY}`; g.textBaseline = 'middle'; g.fillText('Sell', 300, 206);
  const sw = g.measureText('Sell').width; g.fillStyle = TEAL_D; g.fillText('zen', 300 + sw, 206);
  g.textAlign = 'right'; g.fillStyle = MUTED; g.font = `500 30px ${BODY}`; g.fillText('Certificate ID', W - 170, 180);
  g.fillStyle = INK; g.font = `700 40px ${DISPLAY}`; g.fillText(c.id, W - 170, 228); g.textAlign = 'left';
  // Nom
  const titlePx = fitText(g, TITLE[c.type], (px) => `700 ${px}px ${DISPLAY}`, 84, W - 520);
  g.fillStyle = NAVY; g.textAlign = 'center'; g.font = `700 ${titlePx}px ${DISPLAY}`; g.fillText(TITLE[c.type], W / 2, 400);
  g.fillStyle = TEAL; g.fillRect(W / 2 - 140, 470, 280, 6);
  // Asosiy qism: chapda matn, o'ngda rasm
  const colL = 240, colW = 1420, cx = colL + colW / 2;
  g.fillStyle = MUTED; g.font = `500 38px ${BODY}`; g.fillText('This certificate is proudly presented to', cx, 560);
  const namePx = fitText(g, d.name, (px) => `650 ${px}px ${DISPLAY}`, 118, colW);
  g.fillStyle = INK; g.font = `650 ${namePx}px ${DISPLAY}`; g.fillText(d.name, cx, 680);
  g.strokeStyle = '#CBD5E1'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 560, 750); g.lineTo(cx + 560, 750); g.stroke();
  g.fillStyle = MUTED; g.font = `500 36px ${BODY}`;
  g.fillText(ach ? 'for achieving the following results in' : 'for successfully completing', cx, 822);
  g.fillStyle = INK; g.font = `600 44px ${DISPLAY}`;
  const examLines = wrap(g, d.examName, colW).slice(0, 2);
  examLines.forEach((l, i) => g.fillText(l, cx, 892 + i * 58));
  let y = 892 + examLines.length * 58 + 50;
  // Natijalar
  const boxes: [string, string][] = [];
  if (ach || d.kind === 'full') {
    for (const [k, label] of SKILLS) if (typeof d.skills[k] === 'number') boxes.push([label, d.skills[k]!.toFixed(1)]);
    if (typeof d.overall === 'number' && d.kind === 'full') boxes.push(['Overall', d.overall.toFixed(1)]); // bitta bo'limli testda Overall = o'sha bo'lim
    if (d.module === 'cefr' && typeof d.percent === 'number') boxes.push(['Score', `${d.percent}%`]);
    if (d.cefr) boxes.push(['CEFR level', d.cefr]);
  }
  if (boxes.length) {
    const bw = 230, gap = 26, total = boxes.length * bw + (boxes.length - 1) * gap; let x = cx - total / 2;
    for (const [label, val] of boxes) {
      const hi = label === 'Overall' || label === 'CEFR level';
      g.fillStyle = hi ? NAVY : '#F1F5F9'; g.beginPath(); g.roundRect(x, y, bw, 170, 22); g.fill();
      g.fillStyle = hi ? MINT : MUTED; g.font = `600 30px ${BODY}`; g.fillText(label, x + bw / 2, y + 48);
      g.fillStyle = hi ? '#fff' : INK; g.font = `700 70px ${DISPLAY}`; g.fillText(val, x + bw / 2, y + 118);
      x += bw + gap;
    }
    y += 210;
  }
  // Rasm
  const px = 1760, py = 560, ps = 360;
  g.save(); g.fillStyle = '#fff'; g.beginPath(); g.roundRect(px - 14, py - 14, ps + 28, ps + 28, 40); g.fill();
  g.strokeStyle = TEAL; g.lineWidth = 8; g.beginPath(); g.roundRect(px - 14, py - 14, ps + 28, ps + 28, 40); g.stroke();
  const img = await loadImage(`${origin}${c.photoUrl}`);
  g.beginPath(); g.roundRect(px, py, ps, ps, 30); g.clip();
  if (img) { const s = Math.max(ps / img.width, ps / img.height); const iw = img.width * s, ih = img.height * s; g.drawImage(img, px + (ps - iw) / 2, py + (ps - ih) / 2, iw, ih); }
  else { g.fillStyle = '#E2E8F0'; g.fillRect(px, py, ps, ps); }
  g.restore();
  // Pastki qism: sana, imzo, muhr, QR
  const by = H - 380;
  g.textAlign = 'left'; g.fillStyle = MUTED; g.font = `500 30px ${BODY}`; g.fillText('Date of exam', 240, by);
  g.fillStyle = INK; g.font = `600 40px ${DISPLAY}`; g.fillText(fmtDate(d.testDate), 240, by + 54);
  g.fillStyle = MUTED; g.font = `500 30px ${BODY}`; g.fillText('Date of issue', 240, by + 120);
  g.fillStyle = INK; g.font = `600 40px ${DISPLAY}`; g.fillText(new Date(c.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), 240, by + 174);
  g.textAlign = 'center';
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(820, by + 96); g.lineTo(1260, by + 96); g.stroke();
  g.fillStyle = INK; g.font = `600 36px ${DISPLAY}`; g.fillText(d.signerName, 1040, by + 146);
  g.fillStyle = MUTED; g.font = `500 28px ${BODY}`; g.fillText(d.signerTitle, 1040, by + 190);
  seal(g, 1500, by + 96, 128);
  qr(g, c.verifyUrl, W - 200 - 230, by - 40, 230);
  g.textAlign = 'right'; g.fillStyle = MUTED; g.font = `500 26px ${BODY}`;
  g.fillText('Scan to verify', W - 200, by + 226);
  g.fillStyle = TEAL_D; g.font = `600 26px ${BODY}`; g.fillText(c.verifyUrl.replace(/^https?:\/\//, ''), W - 200, by + 262);
  if (c.status === 'revoked') { g.save(); g.translate(W / 2, H / 2); g.rotate(-0.35); g.globalAlpha = 0.18; g.fillStyle = '#B91C1C'; g.font = `800 260px ${DISPLAY}`; g.textAlign = 'center'; g.fillText('REVOKED', 0, 0); g.restore(); }
  return cv;
}

const toBlob = (cv: HTMLCanvasElement, type: string, q?: number) => new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('canvas'))), type, q));
function save(blob: Blob, name: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
export async function downloadPng(c: CertView): Promise<void> { save(await toBlob(await renderCertificate(c), 'image/png'), `sellzen-${c.id}.png`); }
export async function downloadPdf(c: CertView): Promise<void> {
  const cv = await renderCertificate(c);
  const jpeg = new Uint8Array(await (await toBlob(cv, 'image/jpeg', 0.92)).arrayBuffer());
  save(new Blob([jpegToPdf(jpeg, W, H, `${TITLE[c.type]} ${c.id}`)], { type: 'application/pdf' }), `sellzen-${c.id}.pdf`);
}
export async function previewUrl(c: CertView): Promise<string> { return URL.createObjectURL(await toBlob(await renderCertificate(c), 'image/png')); }
