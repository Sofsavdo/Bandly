// Bosib-gapirish (push-to-talk) mantig'i — sof funksiyalar, brauzersiz sinovdan o'tadi.
// Mobil: avatar/tugmani bosib turib gapiriladi, qo'yib yuborilganda ustoz javob beradi. Desktop: Probel (Space) tugmasi shunday ishlaydi.
// Faqat bosib-gapirish: bosib turilganda tinglaydi, qo'yib yuborilganda to'xtaydi va ustoz javob beradi. Qisqa tegish (TAP_MS dan kam) — tasodifiy:
// hech narsa yuborilmaydi. Egasi (2026-11-25): avvalgi "qisqa tegish — qulf" rejimi chalkashtirardi (qo'l olingandan keyin ham tinglab turardi).
export const TAP_MS = 300;
/** Bir navbat eng ko'pi bilan shuncha (server ham 60 soniyadan keyin o'zi tugatadi). */
export const MAX_TALK_MS = 60_000;
/** Qo'yib yuborilgandan keyin ham shuncha ms yozib turiladi: oxirgi so'z kesilib qolmasin (mikrofon kechikishi). */
export const TAIL_MS = 250;
/** Navbat sifatida yuborish uchun kamida shuncha ovozli vaqt kerak; undan kam bo'lsa — "eshitilmadi" (bo'sh navbat yuborilmaydi). */
export const MIN_VOICED_MS = 200;
/** "Ovozli kadr" chegarasi (RMS) — faqat Gemini ovozni o'zi eshitadigan rejimda: butunlay jim (o'chirilgan/bloklangan) mikrofonni ajratadi, shuning uchun juda past.
 *  Server tanishida (asr) chegara umuman ishlatilmaydi. */
export const QUIET_RMS = 0.004;

export type PttMode = 'idle' | 'hold';
export interface PttState { mode: PttMode; downAt: number }
export type PttInput = { type: 'down' | 'up'; at: number } | { type: 'cancel' };
/** start — tinglash boshlandi; stop — tugadi, javob kutiladi; tap — juda qisqa (tasodifiy) tegish: tinglash bekor, hech narsa yuborilmaydi */
export type PttAction = 'start' | 'stop' | 'tap' | null;
export const PTT_IDLE: PttState = { mode: 'idle', downAt: 0 };

/** Bosish/qo'yib yuborish hodisalaridan "yozishni boshla / tugat" qarorini chiqaradi. */
export function pttStep(s: PttState, e: PttInput): [PttState, PttAction] {
  if (e.type === 'cancel') return s.mode === 'idle' ? [s, null] : [PTT_IDLE, 'stop'];
  if (e.type === 'down') return s.mode === 'idle' ? [{ mode: 'hold', downAt: e.at }, 'start'] : [s, null]; // takroriy "down" (klaviatura auto-repeat)
  if (s.mode === 'hold') return [PTT_IDLE, e.at - s.downAt < TAP_MS ? 'tap' : 'stop'];
  return [s, null];
}

/** Mikrofon bu kadrda ovozli (shovqin darajasidan baland)mi — navbatda haqiqiy gap bor-yo'qligini bilish uchun. */
export function tallyVoiced(prevMs: number, rms: number, threshold: number, frameMs: number): number {
  return rms > threshold ? prevMs + frameMs : prevMs;
}
