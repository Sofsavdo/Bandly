// Anonim o'sish hodisasi (server/events.ts): nom + tasodifiy anonim identifikator (bandly.vid) yuboriladi —
// token, laqab, telefon yoki boshqa shaxsiy ma'lumot yo'q. Identifikator faqat shu brauzerda, hisob bilan bog'lanmaydi.
// Xato bo'lsa jim o'tadi: o'lchov hech qachon foydalanuvchi oqimini buzmasligi kerak.
export type TrackEvent = 'landing_view' | 'signup_start' | 'pricing_view' | 'checkout_start' | 'placement_start' | 'placement_done' | 'share_placement_tg' | 'share_placement_img' | 'duel_guest_view' | 'duel_share' | 'share_mock';

const VID_KEY = 'bandly.vid';
/** Brauzer uchun tasodifiy anonim identifikator (yo'q bo'lsa yaratiladi). localStorage ishlamasa — sessiya davomida xotirada. */
let memVid: string | null = null;
export function visitorId(): string {
  try {
    const v = localStorage.getItem(VID_KEY);
    if (v && /^[A-Za-z0-9_-]{16,64}$/.test(v)) return v;
  } catch { /* ruxsat yo'q */ }
  const fresh = memVid ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).slice(2) + Date.now().toString(36));
  memVid = fresh;
  try { localStorage.setItem(VID_KEY, fresh); } catch { /* xotirada qoladi */ }
  return fresh;
}

export function track(name: TrackEvent): void {
  try {
    const body = JSON.stringify({ name, vid: visitorId() });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon?.('/api/event', new Blob([body], { type: 'application/json' }))) return;
    void fetch('/api/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
  } catch { /* o'lchov ixtiyoriy */ }
}
