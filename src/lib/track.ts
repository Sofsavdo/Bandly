// Anonim o'sish hodisasi (server/events.ts): faqat nom yuboriladi — token, laqab yoki shaxsiy ma'lumot yo'q.
// Xato bo'lsa jim o'tadi: o'lchov hech qachon foydalanuvchi oqimini buzmasligi kerak.
export type TrackEvent = 'placement_start' | 'placement_done' | 'share_placement_tg' | 'share_placement_img' | 'duel_guest_view' | 'duel_share' | 'share_mock';
export function track(name: TrackEvent): void {
  try {
    const body = JSON.stringify({ name });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon?.('/api/event', new Blob([body], { type: 'application/json' }))) return;
    void fetch('/api/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
  } catch { /* o'lchov ixtiyoriy */ }
}
