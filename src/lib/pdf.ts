// i18n-ignore-file: PDF tuzilmasi matnlari tarjima qilinmaydi.
// Bitta JPEG rasmdan A4 PDF yasaydi (rasm nisbatiga qarab portrait 595×842 yoki landscape 842×595 pt) — tashqi kutubxonasiz (test: pdf.test.ts).
// Sertifikat Canvas'da chiziladi, so'ng shu rasm PDF sahifasini to'liq egallaydi.
export const A4_LANDSCAPE = { w: 842, h: 595 } as const;
export const A4_PORTRAIT = { w: 595, h: 842 } as const;

export function jpegToPdf(jpeg: Uint8Array, widthPx: number, heightPx: number, title = 'Sellzen certificate'): Uint8Array {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = []; const offsets: number[] = []; let len = 0;
  const push = (x: string | Uint8Array) => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (n: number, body: string | Uint8Array[]) => {
    offsets[n] = len; push(`${n} 0 obj\n`);
    if (typeof body === 'string') push(body); else body.forEach(push);
    push('\nendobj\n');
  };
  const { w, h } = heightPx > widthPx ? A4_PORTRAIT : A4_LANDSCAPE;
  const safeTitle = title.replace(/[()\\]/g, '').slice(0, 120);
  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  obj(4, [enc.encode(`<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`), jpeg, enc.encode('\nendstream')]);
  const content = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  obj(6, `<< /Title (${safeTitle}) /Producer (Sellzen) >>`);
  const xref = len;
  push(`xref\n0 7\n0000000000 65535 f \n${offsets.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`);
  push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const out = new Uint8Array(len); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
