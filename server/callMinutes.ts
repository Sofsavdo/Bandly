// AI ustoz bilan ovozli suhbat daqiqalari (tariflarda: "60 daqiqa / oy"). Hisobga o'quvchining gapi (nutqni tanish soniyalari)
// va ustozning neyron ovozi (taxminan 15 belgi = 1 soniya) kiradi. Obunachi uchun oylik daqiqa tugaguncha ustoz ovozi
// kunlik 5 ta javob chegarasiga bog'lanmaydi; tugagach (yoki obuna bo'lmasa) — umumiy kunlik chegara amal qiladi.
import type { DatabaseSync } from 'node:sqlite';
import { tzDay } from './day';
import { SALE_PLANS } from '../src/config';
import { settingValue } from './settings';

/** Tariflarda e'lon qilingan oylik daqiqa (SALE_PLANS.voiceMin — barcha tariflarda bir xil; farq qilsa eng kichigi). Sotilgan va berilgan bitta manbadan. */
export const PLAN_VOICE_MINUTES = Math.min(...SALE_PLANS.map((p) => p.voiceMin));
/** COACH_CALL_MONTH_MINUTES — faqat vaqtinchalik qo'lda o'zgartirish uchun (masalan xarajat nazorati); standart — tarifdagi qiymat. */
/** Obunachining oylik ovozli suhbat soniyalari: admin panel (COACH_CALL_MONTH_MINUTES) > Railway > tarifdagi qiymat. Har chaqiruvda o'qiladi. */
export const callMonthSeconds = (): number => settingValue('COACH_CALL_MONTH_MINUTES') * 60;
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
