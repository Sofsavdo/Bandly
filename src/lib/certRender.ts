// i18n-ignore-file: sertifikat matni ataylab inglizcha (xalqaro format), interfeys tiliga qarab o'zgarmaydi.
// Sellzen sertifikati — "Mock Test Report Form" uslubida, A4 portrait (1654×2339 px ≈ 200 dpi). Ko'rish, PNG va PDF — bir xil rasm.
// Faqat haqiqiy ma'lumot: ism, rasm, ID, test nomi, sanalar, server natijalari. Boshqa tashkilot blankasi/logosi/muhri ishlatilmaydi.
import qrcode from 'qrcode-generator';
import { jpegToPdf } from './pdf';

export type CertType = 'participation' | 'achievement';
export interface CertData {
  name: string; photo: string; examName: string; module: string; kind: string; testDate: string;
  skills: { listening?: number; reading?: number; writing?: number; speaking?: number }; overall: number | null; cefr: string | null;
  correct: number | null; total: number | null; percent: number | null; signerName: string; signerTitle: string;
}
export interface CertView { id: string; type: CertType; status: 'valid' | 'revoked'; issuedAt: number; revokedAt: number | null; data: CertData; verifyUrl: string; photoUrl: string }

export const W = 1654, H = 2339;
const NAVY = '#16233D', NAVY2 = '#22324F', INK = '#16233D', MUTED = '#4B5870', GOLD = '#B89B5E', GOLD_L = '#D9C79B', PAPER = '#F7F5EF', LINE = '#C9CED8', RULE = '#7C879B';
const DISPLAY = '"Outfit Variable", Outfit, "Segoe UI", Arial, sans-serif';
const BODY = '"Inter Variable", Inter, "Segoe UI", Arial, sans-serif';
export const TITLE: Record<CertType, string> = { participation: 'SELLZEN — CERTIFICATE OF PARTICIPATION', achievement: 'SELLZEN — CERTIFICATE OF ACHIEVEMENT' };
const SKILLS: [keyof CertData['skills'], string][] = [['listening', 'Listening'], ['reading', 'Reading'], ['writing', 'Writing'], ['speaking', 'Speaking']];
const HEX_S = 'M86 38V30.5L50 9.5L14 30.5V46.5L86 53.5V69.5L50 90.5L14 69.5V62';
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
const fmtIso = (iso: string) => { const d = new Date(`${iso}T12:00:00Z`); return Number.isNaN(d.getTime()) ? iso : fmt(d); };

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}
/** Olti burchakli "S" belgisi, po'lat gradient (light — to'q fon ustida). */
function hexMark(g: CanvasRenderingContext2D, x: number, y: number, s: number, light: boolean) {
  g.save(); g.translate(x, y); g.scale(s / 100, s / 100);
  const gr = g.createLinearGradient(0, 0, 100, 100);
  const st = light ? ['#8FA3C0', '#E4ECF6', '#A9BAD2', '#7486A3'] : ['#3A4A66', '#9DB0C9', '#5B6E8C', '#26344E'];
  gr.addColorStop(0, st[0]!); gr.addColorStop(0.45, st[1]!); gr.addColorStop(0.6, st[2]!); gr.addColorStop(1, st[3]!);
  g.strokeStyle = gr; g.lineWidth = 13; g.lineJoin = 'round'; g.lineCap = 'butt'; g.stroke(new Path2D(HEX_S));
  g.restore();
}
function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = '';
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function fit(g: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, maxW: number): number {
  let px = start; g.font = font(px); while (g.measureText(text).width > maxW && px > 24) { px -= 2; g.font = font(px); } return px;
}
/** Nozik gilosh fon naqshi (o'zimizning himoya chiziqlari). */
function guilloche(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, alpha: number) {
  g.save(); g.globalAlpha = alpha; g.strokeStyle = NAVY2; g.lineWidth = 1.2;
  for (let k = 0; k < 36; k++) { g.beginPath(); for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.02) { const rr = r * (0.55 + 0.45 * Math.cos(6 * t + k * 0.17)); const x = cx + rr * Math.cos(t + k * 0.05), y = cy + rr * Math.sin(t + k * 0.05); t === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  g.restore();
}
function seal(g: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  g.save();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = NAVY; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, r - 6, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, r - 44, 0, Math.PI * 2); g.stroke();
  g.fillStyle = NAVY; g.beginPath();
  for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2; const rr = i % 2 ? r - 52 : r - 60; const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.closePath(); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, r - 66, 0, Math.PI * 2); g.fill();
  const ring = (txt: string, mid: number, span: number, rad: number, bottom: boolean) => {
    g.font = `800 ${Math.round(r * 0.13)}px ${DISPLAY}`; g.fillStyle = NAVY; g.textAlign = 'center'; g.textBaseline = 'middle';
    const n = txt.length;
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n - 0.5; const a = bottom ? mid - f * span : mid + f * span;
      g.save(); g.translate(cx + rad * Math.cos(a), cy + rad * Math.sin(a)); g.rotate(bottom ? a - Math.PI / 2 : a + Math.PI / 2); g.fillText(txt[i]!, 0, 0); g.restore();
    }
  };
  ring('SELLZEN.UZ ASSESSMENT BOARD', -Math.PI / 2, Math.PI * 1.05, r - 25, false);
  ring('VERIFIED MOCK RESULT', Math.PI / 2, Math.PI * 0.72, r - 25, true);
  const ms = (r - 70) * 1.25; hexMark(g, cx - ms / 2, cy - ms / 2, ms, false);
  g.restore();
}
function qr(g: CanvasRenderingContext2D, url: string, x: number, y: number, size: number) {
  const q = qrcode(0, 'M'); q.addData(url); q.make();
  const n = q.getModuleCount(); const cell = Math.floor(size / (n + 2)); const off = Math.floor((size - cell * n) / 2);
  g.fillStyle = '#fff'; g.fillRect(x, y, size, size); g.fillStyle = '#111827';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect(x + off + c * cell, y + off + r * cell, cell, cell);
}
const box = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r = 14) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
const panel = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => { g.fillStyle = '#fff'; box(g, x, y, w, h, 14); g.fill(); g.strokeStyle = RULE; g.lineWidth = 2.5; g.stroke(); };

export async function renderCertificate(c: CertView, origin = typeof location !== 'undefined' ? location.origin : ''): Promise<HTMLCanvasElement> {
  try { await Promise.all([document.fonts.load(`800 60px ${DISPLAY}`), document.fonts.load(`500 30px ${BODY}`), document.fonts.load(`700 30px ${BODY}`)]); } catch { /* standart shrift */ }
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!; const d = c.data; const ach = c.type === 'achievement';
  const L = 110, R = W - 110, CW = R - L;
  // Qog'oz, ramka, gilosh
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  g.strokeStyle = LINE; g.lineWidth = 3; g.strokeRect(40, 40, W - 80, H - 80);
  g.save(); g.setLineDash([2, 6]); g.strokeStyle = '#B9BFCC'; g.lineWidth = 2; g.strokeRect(58, 58, W - 116, H - 116); g.restore();
  guilloche(g, W / 2, 1240, 430, 0.07);
  // Sarlavha lentasi
  const hy = 90, hh = 300;
  g.fillStyle = GOLD; box(g, L - 14, hy - 14, CW + 28, hh + 28, 22); g.fill();
  const hg = g.createLinearGradient(L, hy, R, hy + hh); hg.addColorStop(0, NAVY); hg.addColorStop(1, NAVY2);
  g.fillStyle = hg; box(g, L, hy, CW, hh, 14); g.fill();
  g.save(); box(g, L, hy, CW, hh, 14); g.clip(); g.strokeStyle = GOLD_L; g.lineWidth = 6; g.globalAlpha = 0.8;
  g.beginPath(); g.moveTo(L + CW * 0.5, hy + hh + 10); g.bezierCurveTo(L + CW * 0.56, hy + hh * 0.4, L + CW * 0.62, hy + 30, L + CW * 0.78, hy - 10); g.stroke(); g.restore();
  hexMark(g, L + 46, hy + 80, 140, true);
  g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#fff';
  const brandPx = fit(g, 'SELLZEN.UZ', (p) => `800 ${p}px ${DISPLAY}`, 88, CW * 0.5 - 220); g.font = `800 ${brandPx}px ${DISPLAY}`; g.fillText('SELLZEN.UZ', L + 212, hy + 152);
  g.textAlign = 'right'; g.fillStyle = '#fff'; g.font = `800 62px ${DISPLAY}`; g.fillText('MOCK TEST', R - 200, hy + 118);
  g.fillStyle = '#D5DCE8'; g.font = `600 50px ${DISPLAY}`; g.fillText('REPORT FORM', R - 200, hy + 186);
  const bx = R - 100, byc = hy + 150; g.strokeStyle = '#D5DCE8'; g.lineWidth = 5; g.beginPath(); g.arc(bx, byc, 72, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.arc(bx, byc, 60, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#fff'; box(g, bx - 84, byc - 22, 168, 44, 10); g.fill();
  const badge = d.module === 'cefr' ? 'CEFR' : d.kind === 'full' ? 'FULL MOCK' : 'IELTS FMT';
  g.fillStyle = NAVY; g.textAlign = 'center'; g.font = `800 ${fit(g, badge, (p) => `800 ${p}px ${DISPLAY}`, 30, 150)}px ${DISPLAY}`; g.fillText(badge, bx, byc + 1);
  // Sertifikat nomi
  let y = hy + hh + 96;
  const tp = fit(g, TITLE[c.type], (px) => `800 ${px}px ${DISPLAY}`, 56, CW); g.fillStyle = INK; g.font = `800 ${tp}px ${DISPLAY}`; g.textAlign = 'center'; g.fillText(TITLE[c.type], W / 2, y);
  y += 52; g.fillStyle = GOLD; g.fillRect(W / 2 - 120, y, 240, 5);
  // Nomzod ma'lumotlari
  y += 84; g.textAlign = 'left'; g.fillStyle = INK; g.font = `800 44px ${DISPLAY}`; g.fillText('CANDIDATE DETAILS', L, y);
  y += 36;
  const tw = CW - 420 - 36, rowH = 100, kx = 290;
  const rows: [string, string][] = [['Candidate Name', d.name.toUpperCase()], ['Certificate ID', c.id], ['Test', d.examName], ['Test Date', fmtIso(d.testDate)], ['Issue Date', fmt(new Date(c.issuedAt))]];
  panel(g, L, y, tw, rowH * rows.length);
  rows.forEach(([k, v], i) => {
    const ry = y + i * rowH;
    if (i) { g.strokeStyle = RULE; g.lineWidth = 1.5; g.beginPath(); g.moveTo(L, ry); g.lineTo(L + tw, ry); g.stroke(); }
    g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = MUTED; g.font = `500 32px ${BODY}`; g.fillText(k, L + 24, ry + rowH / 2);
    g.fillStyle = INK; const maxV = tw - kx - 36;
    const px = fit(g, v, (p) => `700 ${p}px ${BODY}`, 34, maxV);
    if (px < 28) { g.font = `700 26px ${BODY}`; const ls = wrap(g, v, maxV).slice(0, 2); ls.forEach((l, j) => g.fillText(l, L + kx + 18, ry + rowH / 2 + (j - (ls.length - 1) / 2) * 32)); }
    else { g.font = `700 ${px}px ${BODY}`; g.fillText(v, L + kx + 18, ry + rowH / 2); }
  });
  g.strokeStyle = RULE; g.lineWidth = 1.5; g.beginPath(); g.moveTo(L + kx, y); g.lineTo(L + kx, y + rowH * rows.length); g.stroke();
  const px0 = R - 420, ph = rowH * rows.length;
  panel(g, px0, y, 420, ph);
  const img = await loadImage(`${origin}${c.photoUrl}`);
  g.save(); box(g, px0 + 18, y + 18, 384, ph - 36, 8); g.clip();
  if (img) { const s = Math.max(384 / img.width, (ph - 36) / img.height); const iw = img.width * s, ih = img.height * s; g.drawImage(img, px0 + 18 + (384 - iw) / 2, y + 18 + (ph - 36 - ih) / 2, iw, ih); }
  else { g.fillStyle = '#D8DDE6'; g.fillRect(px0 + 18, y + 18, 384, ph - 36); }
  g.restore();
  y += ph + 96;
  // Natijalar
  g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = INK; g.font = `800 44px ${DISPLAY}`; g.fillText(ach ? 'TEST RESULTS' : 'TEST COMPLETION', L, y);
  y += 36;
  const skills = SKILLS.filter(([k]) => typeof d.skills[k] === 'number');
  if (ach && skills.length > 1) { // bitta bo'limli testda natija pastdagi katta blokda (takrorlanmaydi)
    const cw = CW / skills.length; panel(g, L, y, CW, 230);
    g.strokeStyle = RULE; g.lineWidth = 1.5; g.beginPath(); g.moveTo(L, y + 84); g.lineTo(R, y + 84); g.stroke();
    skills.forEach(([k, label], i) => {
      const x = L + i * cw; if (i) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 230); g.stroke(); }
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; g.font = `500 38px ${BODY}`; g.fillText(label, x + cw / 2, y + 44);
      g.font = `800 92px ${DISPLAY}`; g.fillText(d.skills[k]!.toFixed(1), x + cw / 2, y + 160);
    });
    y += 230 + 56;
  } else if (ach && d.module === 'cefr') {
    panel(g, L, y, CW, 150);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; g.font = `600 40px ${BODY}`; g.fillText(`Correct answers: ${d.correct ?? 0} / ${d.total ?? 0}`, W / 2, y + 75);
    y += 150 + 56;
  }
  // Asosiy natija bloki (to'q ko'k, oltin ramka)
  const by = y, bh = 250;
  g.fillStyle = GOLD; box(g, L - 10, by - 10, CW + 20, bh + 20, 22); g.fill();
  const bg = g.createLinearGradient(L, by, R, by + bh); bg.addColorStop(0, NAVY); bg.addColorStop(1, NAVY2); g.fillStyle = bg; box(g, L, by, CW, bh, 16); g.fill();
  g.textBaseline = 'middle'; g.fillStyle = '#fff';
  if (ach) {
    const main = d.kind === 'full' ? ['OVERALL', 'BAND SCORE'] : d.module === 'cefr' ? ['TEST', 'SCORE'] : [(skills[0]?.[1] ?? 'SKILL').toUpperCase(), 'BAND SCORE'];
    const val = d.module === 'cefr' ? `${d.percent ?? 0}%` : typeof d.overall === 'number' ? d.overall.toFixed(1) : '—';
    g.textAlign = 'left'; g.font = `800 62px ${DISPLAY}`; g.fillText(main[0]!, L + 60, by + 92); g.fillText(main[1]!, L + 60, by + 164);
    g.textAlign = 'center'; g.font = `800 ${d.module === 'cefr' ? 120 : 150}px ${DISPLAY}`; g.fillText(val, L + CW * 0.585, by + bh / 2 + 6);
    g.strokeStyle = GOLD_L; g.lineWidth = 2; g.beginPath(); g.moveTo(L + CW * 0.75, by + 40); g.lineTo(L + CW * 0.75, by + bh - 40); g.stroke();
    g.fillStyle = '#D5DCE8'; g.font = `500 40px ${BODY}`; g.fillText('CEFR Level', L + CW * 0.875, by + 76);
    g.fillStyle = '#fff'; g.font = `800 112px ${DISPLAY}`; g.fillText(d.cefr ?? '—', L + CW * 0.875, by + 162);
  } else {
    g.textAlign = 'left'; g.font = `800 60px ${DISPLAY}`; g.fillText('STATUS', L + 60, by + 92);
    g.fillStyle = '#D5DCE8'; g.font = `500 30px ${BODY}`; g.fillText('All sections submitted and scored by Sellzen', L + 60, by + 166);
    g.textAlign = 'right'; g.fillStyle = '#fff'; g.font = `800 80px ${DISPLAY}`; g.fillText('COMPLETED', R - 60, by + bh / 2 + 4);
  }
  // Pastki blok: QR, tekshirish raqami, muhr, imzo — sahifa pastiga mahkamlangan
  const fh = 400; y = H - 110 - fh;
  panel(g, L, y, CW, fh);
  const qs = Math.min(290, fh - 110); qr(g, c.verifyUrl, L + 40, y + 34, qs);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = INK; g.font = `800 30px ${DISPLAY}`; g.fillText('SCAN TO VERIFY', L + 40 + qs / 2, y + 34 + qs + 50);
  g.strokeStyle = RULE; g.lineWidth = 1.5; g.beginPath(); g.moveTo(L + qs + 80, y + 30); g.lineTo(L + qs + 80, y + fh - 30); g.stroke();
  const vx = L + qs + 110; g.textAlign = 'left'; g.fillStyle = MUTED; g.font = `500 30px ${BODY}`; g.fillText('Certificate', vx, y + 120); g.fillText('Verification Number', vx, y + 160);
  g.fillStyle = INK; g.font = `800 ${fit(g, c.id, (p) => `800 ${p}px ${BODY}`, 30, L + CW * 0.66 - 175 - vx)}px ${BODY}`; g.fillText(c.id, vx, y + 228);
  seal(g, L + CW * 0.66, y + fh / 2, Math.min(155, fh / 2 - 22));
  const sx = R - 190; g.textAlign = 'center';
  g.fillStyle = MUTED; g.font = `500 28px ${BODY}`; g.fillText('Authorized Signature', sx, y + 92);
  g.fillStyle = INK; const sp = fit(g, d.signerName, (p) => `italic 600 ${p}px ${DISPLAY}`, 40, 320); g.font = `italic 600 ${sp}px ${DISPLAY}`; g.fillText(d.signerName, sx, y + 182);
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(sx - 165, y + 206); g.lineTo(sx + 165, y + 206); g.stroke();
  g.fillStyle = INK; const tt = fit(g, d.signerTitle, (p) => `600 ${p}px ${BODY}`, 26, 330); g.font = `600 ${tt}px ${BODY}`; g.fillText(d.signerTitle, sx, y + 248);
  if (c.status === 'revoked') { g.save(); g.translate(W / 2, H / 2); g.rotate(-0.5); g.globalAlpha = 0.18; g.fillStyle = '#B91C1C'; g.font = `800 220px ${DISPLAY}`; g.textAlign = 'center'; g.fillText('REVOKED', 0, 0); g.restore(); }
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
