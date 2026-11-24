// Bosib-gapirish (push-to-talk) mantig'i — sof funksiyalar, brauzersiz sinovdan o'tadi.
// Mobil: avatar/tugmani bosib turib gapiriladi, qo'yib yuborilganda ustoz javob beradi. Desktop: Probel (Space) tugmasi shunday ishlaydi.
// Qisqa tegish (TAP_MS dan kam) — "qulf": yozuv davom etadi, keyingi tegish yozuvni tugatadi (bosib tura olmaydiganlar va tasodifiy qisqa bosish uchun).
export const TAP_MS = 300;
/** Bir navbat eng ko'pi bilan shuncha (server ham 60 soniyadan keyin o'zi tugatadi). */
export const MAX_TALK_MS = 60_000;
/** Qo'yib yuborilgandan keyin ham shuncha ms yozib turiladi: oxirgi so'z kesilib qolmasin (mikrofon kechikishi). */
export const TAIL_MS = 250;
/** Navbat sifatida yuborish uchun kamida shuncha ovozli vaqt kerak; undan kam bo'lsa — "eshitilmadi" (bo'sh navbat yuborilmaydi). */
export const MIN_VOICED_MS = 200;
/** "Ovozli kadr" chegarasi (RMS): ataylab bosilgan navbatda faqat butunlay jim (o'chirilgan/bloklangan) mikrofonni ajratish uchun — shuning uchun past. */
export const VOICED_RMS = 0.012;

export type PttMode = 'idle' | 'hold' | 'latched';
export interface PttState { mode: PttMode; downAt: number }
export type PttInput = { type: 'down' | 'up'; at: number } | { type: 'cancel' };
export type PttAction = 'start' | 'stop' | null;
export const PTT_IDLE: PttState = { mode: 'idle', downAt: 0 };

/** Bosish/qo'yib yuborish hodisalaridan "yozishni boshla / tugat" qarorini chiqaradi. */
export function pttStep(s: PttState, e: PttInput): [PttState, PttAction] {
  if (e.type === 'cancel') return s.mode === 'idle' ? [s, null] : [PTT_IDLE, 'stop'];
  if (e.type === 'down') {
    if (s.mode === 'idle') return [{ mode: 'hold', downAt: e.at }, 'start'];
    if (s.mode === 'latched') return [PTT_IDLE, 'stop']; // qulflangan yozuvni tegib tugatish
    return [s, null]; // bosib turilgan paytda takroriy "down" (klaviatura auto-repeat)
  }
  if (s.mode === 'hold') return e.at - s.downAt < TAP_MS ? [{ mode: 'latched', downAt: s.downAt }, null] : [PTT_IDLE, 'stop'];
  return [s, null];
}

/** Mikrofon bu kadrda ovozli (shovqin darajasidan baland)mi — navbatda haqiqiy gap bor-yo'qligini bilish uchun. */
export function tallyVoiced(prevMs: number, rms: number, threshold: number, frameMs: number): number {
  return rms > threshold ? prevMs + frameMs : prevMs;
}
