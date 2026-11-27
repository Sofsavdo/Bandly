// Sellzen bilan ovozli suhbat daqiqalari (tariflarda: "60 daqiqa / oy"). Hisobga o'quvchining gapi (nutqni tanish soniyalari)
// va ustozning neyron ovozi (taxminan 15 belgi = 1 soniya) kiradi. Obunachi uchun oylik daqiqa tugaguncha ustoz ovozi
// kunlik 5 ta javob chegarasiga bog'lanmaydi; tugagach (yoki obuna bo'lmasa) — umumiy kunlik chegara amal qiladi.
import type { DatabaseSync } from 'node:sqlite';
import { tzDay } from './day';
import { SALE_PLANS } from '../src/config';
import { settingValue } from './settings';

/** Tariflardagi eng kichik oylik daqiqa (General; tariflar bo'yicha: planMonthSeconds). Sotilgan va berilgan bitta manbadan. */
export const PLAN_VOICE_MINUTES = Math.min(...SALE_PLANS.filter((p) => !p.voiceDaily).map((p) => p.voiceMin));
/** COACH_CALL_MONTH_MINUTES — faqat vaqtinchalik qo'lda o'zgartirish uchun (masalan xarajat nazorati); standart — tarifdagi qiymat. */
/** General English oylik ovozli suhbat soniyalari (COACH_CALL_MONTH_MINUTES). Boshqa tariflar uchun — planMonthSeconds. */
export const callMonthSeconds = (): number => settingValue('COACH_CALL_MONTH_MINUTES') * 60;
/** Tarif bo'yicha oylik ovozli suhbat soniyalari (egasi, 2026-11-27): General 60, Exam 90, All Access 120 daqiqa — admin panelda o'zgaradi. */
export const planMonthSeconds = (plan: string | null): number => (plan === 'exam' ? settingValue('PLAN_EXAM_VOICE_MINUTES') : plan === 'all' ? settingValue('PLAN_ALL_VOICE_MINUTES') : settingValue('COACH_CALL_MONTH_MINUTES')) * 60;
export const CHARS_PER_SECOND = 15;
export const ttsSeconds = (chars: number): number => Math.max(1, chars / CHARS_PER_SECOND);
const month = (now: number): string => tzDay(now).slice(0, 7);

export function ensureCallTable(db: DatabaseSync): void {
  db.exec('CREATE TABLE IF NOT EXISTS call_usage (month TEXT NOT NULL, player_id INTEGER NOT NULL, seconds REAL NOT NULL DEFAULT 0, PRIMARY KEY (month, player_id))');
}
export function callUsed(db: DatabaseSync, playerId: number, now = Date.now()): number {
  return (db.prepare('SELECT seconds FROM call_usage WHERE month = ? AND player_id = ?').get(month(now), playerId) as { seconds: number } | undefined)?.seconds ?? 0;
}
export function addCall(db: DatabaseSync, playerId: number, seconds: number, now = Date.now()): void {
  if (!(seconds > 0)) return;
  db.prepare('INSERT INTO call_usage (month, player_id, seconds) VALUES (?, ?, ?) ON CONFLICT(month, player_id) DO UPDATE SET seconds = seconds + excluded.seconds').run(month(now), playerId, seconds);
}
/** Obunachining shu oyda qolgan soniyalari (obuna bo'lmasa 0). */
export function callLeft(db: DatabaseSync, playerId: number, subscribed: boolean, now = Date.now(), total = callMonthSeconds()): number {
  return subscribed ? Math.max(0, total - callUsed(db, playerId, now)) : 0;
}

/** Premium: kunlik ovozli suhbat soniyalari (admin: PREMIUM_DAILY_MINUTES). */
export const premiumDailySeconds = (): number => settingValue('PREMIUM_DAILY_MINUTES') * 60;
/** Bugun ishlatilgan ovozli suhbat soniyalari (live_usage — jonli qo'ng'iroqlar). */
export function voiceUsedToday(db: DatabaseSync, playerId: number, now = Date.now()): number {
  try {
    const all = (db.prepare('SELECT seconds FROM live_usage WHERE day = ? AND player_id = ?').get(tzDay(now), playerId) as { seconds: number } | undefined)?.seconds ?? 0;
    let free = 0; try { free = (db.prepare('SELECT seconds FROM live_free_usage WHERE day = ? AND player_id = ?').get(tzDay(now), playerId) as { seconds: number } | undefined)?.seconds ?? 0; } catch { /* jadval yo'q */ }
    return Math.max(0, all - free); // obunasiz paytdagi bepul qo'ng'iroqlar Premium kunlik daqiqasini yemaydi
  } catch { return 0; }
}
/** Ovozli suhbatning qolgan soniyalari tarif bo'yicha: Premium — bugungi kunlik qoldiq; boshqa tariflar — oylik qoldiq; obunasiz — 0. */
export function voiceLeft(db: DatabaseSync, playerId: number, plan: string | null, now = Date.now()): number {
  if (!plan) return 0;
  if (plan === 'premium') return Math.max(0, premiumDailySeconds() - voiceUsedToday(db, playerId, now));
  return callLeft(db, playerId, true, now, planMonthSeconds(plan));
}
