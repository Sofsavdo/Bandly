import { BRAND } from '../brand';

/** Matnni berilgan kenglikka (belgilar soni) qatorlarga bo'ladi. */
export function wrapLines(text: string, maxChars: number): string[] {
  const out: string[] = []; let line = '';
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if ((line + ' ' + w).trim().length > maxChars && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim();
  }
  if (line) out.push(line);
  return out;
}

/** Ulashish uchun kvadrat rasm (PNG): maslahat yoki so'z. Faqat brauzerda. */
export async function renderCard(opts: { title: string; body: string; foot: string; sub?: string }): Promise<Blob | null> {
  const S = 1080;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const g = c.getContext('2d'); if (!g) return null;
  const bg = g.createLinearGradient(0, 0, S, S); bg.addColorStop(0, '#12162b'); bg.addColorStop(1, '#2a1230');
  g.fillStyle = bg; g.fillRect(0, 0, S, S);
  const glow = g.createRadialGradient(S * 0.85, S * 0.1, 10, S * 0.85, S * 0.1, S * 0.7); glow.addColorStop(0, 'rgba(255,75,58,.55)'); glow.addColorStop(1, 'rgba(255,75,58,0)');
  g.fillStyle = glow; g.fillRect(0, 0, S, S);
  g.fillStyle = '#ffb02e'; g.font = '800 120px Georgia, serif'; g.fillText('“', 80, 190);
  g.fillStyle = '#ff7a6b'; g.font = '700 34px system-ui, sans-serif'; g.fillText(opts.title.toUpperCase(), 80, 290);
  g.fillStyle = '#ffffff'; g.font = '700 66px system-ui, sans-serif';
  const lines = wrapLines(opts.body, 24); lines.slice(0, 7).forEach((l, i) => g.fillText(l, 80, 390 + i * 84));
  if (opts.sub) { g.fillStyle = '#c9cde6'; g.font = '500 38px system-ui, sans-serif'; wrapLines(opts.sub, 44).slice(0, 3).forEach((l, i) => g.fillText(l, 80, 390 + Math.min(lines.length, 7) * 84 + 30 + i * 52)); }
  g.fillStyle = '#ffb02e'; g.fillRect(80, 930, 110, 6);
  g.fillStyle = '#fff'; g.font = 'italic 600 38px system-ui, sans-serif'; g.fillText(opts.foot, 80, 990);
  g.textAlign = 'right'; g.fillStyle = '#0F766E'; g.font = '700 44px Outfit Variable, system-ui, sans-serif'; g.fillText(BRAND.name, S - 80, 990);
  return new Promise((r) => c.toBlob((b) => r(b), 'image/png'));
}

/** Natija havolasi: kirgan o'quvchida taklif kodi bilan (do'st shu havoladan ro'yxatdan o'tsa taklif qilganga yoziladi). */
export function resultLink(path: string, ref?: string | null, base: string = BRAND.url): string {
  return `${base.replace(/\/$/, '')}/${ref ? `?ref=${encodeURIComponent(ref)}` : ''}#${path.startsWith('/') ? path : `/${path}`}`;
}

export interface StoryOpts {
  eyebrow: string;          // "Mening ingliz tili darajam"
  big: string;              // "B1"
  title: string;            // "O'rta"
  sub?: string;             // "IELTS ~4.0–5.0"
  steps?: { labels: string[]; active: number }; // CEFR shkalasi, active — joriy indeks
  cta: string;              // "Sen ham 3 daqiqada tekshir"
  link: string;             // ko'rinadigan manzil (qisqa)
}

/** Story formatidagi (1080×1920, Instagram/Telegram) natija rasmi. Faqat brauzerda. */
export async function renderStory(o: StoryOpts): Promise<Blob | null> {
  const W = 1080, H = 1920;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); if (!g) return null;
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#0B1F3A'); bg.addColorStop(1, '#123f4a');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W * 0.8, H * 0.18, 20, W * 0.8, H * 0.18, W * 0.9); glow.addColorStop(0, 'rgba(45,212,191,.35)'); glow.addColorStop(1, 'rgba(45,212,191,0)');
  g.fillStyle = glow; g.fillRect(0, 0, W, H);
  g.textAlign = 'center';
  g.fillStyle = '#5eead4'; g.font = '700 46px Outfit Variable, system-ui, sans-serif'; g.fillText(BRAND.name.toUpperCase(), W / 2, 170);
  g.fillStyle = '#cbd5e1'; g.font = '600 52px Inter Variable, system-ui, sans-serif'; g.fillText(o.eyebrow, W / 2, 470);
  g.fillStyle = '#ffffff'; g.font = '800 340px Outfit Variable, system-ui, sans-serif'; g.fillText(o.big, W / 2, 820);
  g.fillStyle = '#ffffff'; g.font = '700 72px Inter Variable, system-ui, sans-serif'; g.fillText(o.title, W / 2, 950);
  if (o.sub) { g.fillStyle = '#fbbf24'; g.font = '700 56px Inter Variable, system-ui, sans-serif'; g.fillText(o.sub, W / 2, 1040); }
  if (o.steps) {
    const n = o.steps.labels.length, gap = 18, bw = Math.min(150, (W - 160 - gap * (n - 1)) / n), x0 = (W - (bw * n + gap * (n - 1))) / 2;
    o.steps.labels.forEach((l, i) => {
      const x = x0 + i * (bw + gap), on = i === o.steps!.active, done = i < o.steps!.active;
      g.fillStyle = on ? '#2dd4bf' : done ? 'rgba(45,212,191,.35)' : 'rgba(255,255,255,.12)';
      g.beginPath(); g.roundRect(x, 1150, bw, 110, 28); g.fill();
      g.fillStyle = on ? '#0B1F3A' : '#e2e8f0'; g.font = '800 48px Outfit Variable, system-ui, sans-serif'; g.fillText(l, x + bw / 2, 1222);
    });
  }
  g.fillStyle = '#ffffff'; g.font = '700 64px Inter Variable, system-ui, sans-serif';
  wrapLines(o.cta, 26).slice(0, 2).forEach((l, i) => g.fillText(l, W / 2, 1480 + i * 84));
  g.fillStyle = '#2dd4bf'; g.beginPath(); g.roundRect(W / 2 - 330, 1660, 660, 120, 60); g.fill();
  g.fillStyle = '#0B1F3A'; g.font = '800 52px Outfit Variable, system-ui, sans-serif'; g.fillText(o.link, W / 2, 1738);
  return new Promise((r) => c.toBlob((b) => r(b), 'image/png'));
}

/** Ulashish (mobil) yoki yuklab olish. */
export async function shareCard(blob: Blob, name: string, text: string): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], `${name}.png`, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) { try { await nav.share({ files: [file], text }); return 'shared'; } catch { /* bekor qilindi */ } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${name}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'downloaded';
}
