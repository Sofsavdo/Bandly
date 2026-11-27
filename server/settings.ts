// Admin paneldan boshqariladigan limitlar va narxlar. Ustunlik: admin saqlagan qiymat > Railway o'zgaruvchisi > koddagi standart.
// Saqlangan qiymat process.env ga yoziladi: limitni o'qiydigan kod (freeQuota, entitle, live, referral, pricing...) har chaqiruvda
// env'dan o'qiydi, shuning uchun o'zgarish serverni qayta ishga tushirmasdan darhol kuchga kiradi.
import type { DatabaseSync } from 'node:sqlite';
import { ApiError } from './db';

export type SettingGroup = 'free' | 'plans' | 'coach' | 'referral' | 'prices' | 'safety' | 'bot' | 'creator';
export interface SettingDef { key: string; group: SettingGroup; label: string; hint?: string; def: number; min: number; max: number; unit?: string }

/** Ro'yxat tartibi admin panelda ko'rinish tartibi. Yorliqlar o'zbekcha (admin panel ilova tilida tarjima qiladi). */
export const SETTINGS: SettingDef[] = [
  // Bepul tarif
  { key: 'FREE_LESSONS_PER_DAY', group: 'free', label: 'Kuniga bepul yangi darslar (har bir kurs)', def: 1, min: 0, max: 50 },
  { key: 'FREE_FIRST_DAY_LESSONS', group: 'free', label: 'Birinchi kuni bepul darslar (har bir kurs)', def: 3, min: 0, max: 50 },
  { key: 'FREE_WRITING_PER_WEEK', group: 'free', label: 'Haftasiga bepul AI Writing baholash', def: 1, min: 0, max: 50 },
  { key: 'FREE_SPEAKING_PER_WEEK', group: 'free', label: 'Haftasiga bepul AI Speaking baholash', def: 1, min: 0, max: 50 },
  { key: 'LIVE_FREE_WEEKLY_MINUTES', group: 'free', label: 'Bepul ovozli suhbat (Sellzen), haftasiga', hint: 'Har dushanba yangilanadi (Toshkent vaqti)', def: 5, min: 0, max: 600, unit: 'min' },
  { key: 'COACH_FREE_DAILY_ANSWERS', group: 'free', label: 'Kuniga bepul ovozli javoblar (matnli suhbatda)', def: 5, min: 0, max: 500 },
  // Obuna tariflari
  { key: 'COACH_CALL_MONTH_MINUTES', group: 'plans', label: 'General English: ovozli suhbat, oyiga', def: 60, min: 0, max: 3000, unit: 'min' },
  { key: 'PLAN_EXAM_VOICE_MINUTES', group: 'plans', label: 'Exam Preparation: ovozli suhbat, oyiga', def: 90, min: 0, max: 3000, unit: 'min' },
  { key: 'PLAN_ALL_VOICE_MINUTES', group: 'plans', label: 'All Access: ovozli suhbat, oyiga', def: 120, min: 0, max: 3000, unit: 'min' },
  { key: 'PLAN_GENERAL_WRITING', group: 'plans', label: 'General English: AI Writing baholash, oyiga', def: 0, min: 0, max: 500 },
  { key: 'PLAN_GENERAL_SPEAKING', group: 'plans', label: 'General English: AI Speaking baholash, oyiga', def: 0, min: 0, max: 500 },
  { key: 'PLAN_EXAM_WRITING', group: 'plans', label: 'Exam Preparation: AI Writing baholash, oyiga', def: 10, min: 0, max: 500 },
  { key: 'PLAN_EXAM_SPEAKING', group: 'plans', label: 'Exam Preparation: AI Speaking baholash, oyiga', def: 10, min: 0, max: 500 },
  { key: 'PLAN_ALL_WRITING', group: 'plans', label: 'All Access: AI Writing baholash, oyiga', def: 20, min: 0, max: 500 },
  { key: 'PLAN_ALL_SPEAKING', group: 'plans', label: 'All Access: AI Speaking baholash, oyiga', def: 20, min: 0, max: 500 },
  { key: 'PREMIUM_DAILY_MINUTES', group: 'plans', label: 'Premium: ovozli suhbat, kuniga', hint: 'Har kuni yangilanadi (oylik daqiqadan alohida)', def: 30, min: 0, max: 600, unit: 'min' },
  { key: 'PLAN_PREMIUM_WRITING', group: 'plans', label: 'Premium: AI Writing baholash, oyiga', def: 60, min: 0, max: 1000 },
  { key: 'PLAN_PREMIUM_SPEAKING', group: 'plans', label: 'Premium: AI Speaking baholash, oyiga', def: 60, min: 0, max: 1000 },
  // Sellzen (hamma uchun)
  { key: 'AI_COACH_DAILY_LIMIT', group: 'coach', label: 'Kuniga Sellzen matnli xabarlari (bitta o‘quvchi)', def: 30, min: 0, max: 2000 },
  { key: 'LIVE_MAX_SESSION_MINUTES', group: 'coach', label: 'Bitta ovozli qo‘ng‘iroqning eng uzun davomi', def: 10, min: 1, max: 60, unit: 'min' },
  { key: 'LESSON_FEEDBACK_DAILY', group: 'coach', label: 'Dars ichidagi yozma topshiriqqa Sellzen fikri: kuniga bitta o‘quvchiga', hint: '0 — o‘chiq. Har fikr bitta qisqa AI so‘rovi', def: 5, min: 0, max: 100 },
  // Taklif (referal)
  { key: 'BOT_REQUIRE_SUBSCRIBE', group: 'bot', label: 'Botda kanalga majburiy obuna', def: 0, min: 0, max: 1 },
  { key: 'BOT_REQUIRE_PHONE', group: 'bot', label: 'Botda telefon raqamini so‘rash', def: 0, min: 0, max: 1 },
  { key: 'REF_XP', group: 'referral', label: 'Taklif bonusi: ikkala tomonga XP', def: 100, min: 0, max: 150 },
  { key: 'REF_PLAN_DAYS', group: 'referral', label: 'Taklif bonusi: ikkala tomonga All Access kunlari', hint: '0 — o‘chiq', def: 0, min: 0, max: 30, unit: 'day' },
  { key: 'REF_PLAN_MONTHLY_CAP', group: 'referral', label: 'Taklif qilgan bir kishiga 30 kunda ko‘pi bilan bonus', def: 3, min: 0, max: 100 },
  // Creator (hamkor) dasturi: mukofot qoidalari (summa, foiz, byudjet) "Hamkorlar → Mukofot" bo'limida; bu yerda — umumiy qoida
  { key: 'CREATOR_CREDIT_FIRST', group: 'creator', label: 'Creator krediti: qaysi havola hisobga olinadi', hint: 'Faqat yangi hisob-kitoblarga ta’sir qiladi', def: 0, min: 0, max: 1 },
  // Narxlar (so'm / oy; 3 va 12 oylik narx shundan hisoblanadi)
  { key: 'PLAN_PRICE_GENERAL', group: 'prices', label: 'General English narxi, oyiga', def: 69_000, min: 1000, max: 10_000_000, unit: 'uzs' },
  { key: 'PLAN_PRICE_EXAM', group: 'prices', label: 'Exam Preparation narxi, oyiga', def: 99_000, min: 1000, max: 10_000_000, unit: 'uzs' },
  { key: 'PLAN_PRICE_ALL', group: 'prices', label: 'All Access narxi, oyiga', def: 129_000, min: 1000, max: 10_000_000, unit: 'uzs' },
  { key: 'PLAN_PRICE_PREMIUM', group: 'prices', label: 'Premium narxi, oyiga', def: 499_000, min: 1000, max: 10_000_000, unit: 'uzs' },
  // Xarajat himoyasi
  { key: 'AI_GLOBAL_DAILY_CALLS', group: 'safety', label: 'Platforma bo‘yicha kuniga AI so‘rovlari', hint: '0 — AI o‘chiq', def: 0, min: 0, max: 1_000_000 },
  { key: 'AI_DAILY_LIMIT', group: 'safety', label: 'Bitta o‘quvchiga kuniga AI so‘rovlari (jami)', def: 120, min: 0, max: 10_000 },
  { key: 'API_RATE_PER_MIN', group: 'safety', label: 'Bitta IP’dan daqiqasiga so‘rovlar soni', hint: 'Botlardan himoya. Maktab yoki ofis Wi-Fi’sida (bitta IP’dan ko‘p kishi) oshiring', def: 120, min: 30, max: 5000 },
  { key: 'LIVE_FREE_GLOBAL_DAILY_MINUTES', group: 'safety', label: 'Platforma bo‘yicha kuniga bepul ovozli suhbat', hint: '0 — cheklovsiz', def: 0, min: 0, max: 100_000, unit: 'min' },
];
const BY_KEY = new Map(SETTINGS.map((s) => [s.key, s]));

/** Server ishga tushgandagi Railway qiymatlari (admin qiymatini o'chirsa, shu qaytadi). */
const ENV0: Record<string, string | undefined> = {};
let snap = false;
const snapshot = (env: NodeJS.ProcessEnv) => { if (snap) return; snap = true; for (const s of SETTINGS) ENV0[s.key] = env[s.key]; };

export function ensureSettings(db: DatabaseSync, env: NodeJS.ProcessEnv = process.env): void {
  db.exec('CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value REAL NOT NULL, updated_at INTEGER NOT NULL, updated_by INTEGER)');
  // Migratsiya (2026-11-27): LIVE_FREE_DAILY_MINUTES → LIVE_FREE_WEEKLY_MINUTES. Eski qiymat 0 (bepul ovoz o'chirilgan) bo'lsa — o'chiqligicha qoladi;
  // boshqa qiymatlar ko'chirilmaydi (egasi tasdiqlagan yangi standart: haftasiga 5 daqiqa).
  if (env.LIVE_FREE_WEEKLY_MINUTES === undefined && env.LIVE_FREE_DAILY_MINUTES !== undefined && Number(env.LIVE_FREE_DAILY_MINUTES) === 0) env.LIVE_FREE_WEEKLY_MINUTES = '0';
  const oldDaily = db.prepare("SELECT value, updated_at, updated_by FROM app_settings WHERE key = 'LIVE_FREE_DAILY_MINUTES'").get() as { value: number; updated_at: number; updated_by: number | null } | undefined;
  if (oldDaily) {
    if (oldDaily.value === 0) db.prepare("INSERT OR IGNORE INTO app_settings (key, value, updated_at, updated_by) VALUES ('LIVE_FREE_WEEKLY_MINUTES', 0, ?, ?)").run(oldDaily.updated_at, oldDaily.updated_by);
    db.prepare("DELETE FROM app_settings WHERE key = 'LIVE_FREE_DAILY_MINUTES'").run(); // bir marta: keyin admin haftalik qiymatni bemalol o'zgartiradi
  }
  snapshot(env);
  for (const r of db.prepare('SELECT key, value FROM app_settings').all() as { key: string; value: number }[]) if (BY_KEY.has(r.key)) env[r.key] = String(r.value);
}

const valid = (d: SettingDef, v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= d.min && v <= d.max;
/** Hozir amaldagi qiymat (admin > env > standart). */
export function settingValue(key: string, env: NodeJS.ProcessEnv = process.env): number {
  const d = BY_KEY.get(key);
  if (!d) throw new Error(`setting ${key}`);
  const n = Number(env[key]);
  return env[key] !== undefined && env[key] !== '' && Number.isFinite(n) ? Math.min(d.max, Math.max(d.min, Math.floor(n))) : d.def;
}

export interface SettingView extends SettingDef { value: number; source: 'admin' | 'env' | 'default'; updatedAt: number | null }
export function listSettings(db: DatabaseSync, env: NodeJS.ProcessEnv = process.env): SettingView[] {
  const saved = new Map((db.prepare('SELECT key, updated_at FROM app_settings').all() as { key: string; updated_at: number }[]).map((r) => [r.key, r.updated_at]));
  return SETTINGS.map((d) => ({ ...d, value: settingValue(d.key, env), source: saved.has(d.key) ? 'admin' : ENV0[d.key] !== undefined && ENV0[d.key] !== '' ? 'env' : 'default', updatedAt: saved.get(d.key) ?? null }));
}

/** Bir nechta qiymatni saqlash. null — admin qiymatini o'chirish (Railway yoki standart qiymat qaytadi). Hammasi tekshiriladi, keyin yoziladi. */
export function updateSettings(db: DatabaseSync, patch: Record<string, unknown>, actorId: number | null, now = Date.now(), env: NodeJS.ProcessEnv = process.env): SettingView[] {
  const entries = Object.entries(patch ?? {});
  if (!entries.length || entries.length > SETTINGS.length) throw new ApiError(400, 'Noto‘g‘ri so‘rov');
  for (const [k, v] of entries) {
    const d = BY_KEY.get(k);
    if (!d) throw new ApiError(400, `Noma’lum sozlama: ${k}`);
    if (v !== null && !valid(d, v)) throw new ApiError(400, `${d.label}: ${d.min}–${d.max} oralig‘idagi butun son kerak`);
  }
  const before: Record<string, number> = {};
  for (const [k] of entries) before[k] = settingValue(k, env);
  for (const [k, v] of entries) {
    if (v === null) { db.prepare('DELETE FROM app_settings WHERE key = ?').run(k); if (ENV0[k] === undefined) delete env[k]; else env[k] = ENV0[k]; }
    else { db.prepare('INSERT INTO app_settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by').run(k, v as number, now, actorId ?? null); env[k] = String(v); }
  }
  try {
    db.exec('CREATE TABLE IF NOT EXISTS admin_audit (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, actor_id INTEGER, action TEXT NOT NULL, target TEXT, detail TEXT)');
    const detail = Object.fromEntries(entries.map(([k, v]) => [k, { from: before[k], to: v === null ? settingValue(k, env) : v }]));
    db.prepare('INSERT INTO admin_audit (ts, actor_id, action, target, detail) VALUES (?, ?, ?, ?, ?)').run(now, actorId ?? null, 'settings.update', entries.map(([k]) => k).join(','), JSON.stringify(detail));
  } catch { /* audit — ixtiyoriy */ }
  return listSettings(db, env);
}

/** Mijozga (tariflar sahifasi, ogohlantirishlar): faqat foydalanuvchiga e'lon qilinadigan raqamlar. */
export function publicLimits(env: NodeJS.ProcessEnv = process.env) {
  const v = (k: string) => settingValue(k, env);
  return {
    free: { lessonsPerDay: v('FREE_LESSONS_PER_DAY'), firstDayLessons: v('FREE_FIRST_DAY_LESSONS'), writingPerWeek: v('FREE_WRITING_PER_WEEK'), speakingPerWeek: v('FREE_SPEAKING_PER_WEEK'), liveMinutesPerWeek: v('LIVE_FREE_WEEKLY_MINUTES') },
    plans: {
      general: { voiceMin: v('COACH_CALL_MONTH_MINUTES'), writing: v('PLAN_GENERAL_WRITING'), speaking: v('PLAN_GENERAL_SPEAKING') },
      exam: { voiceMin: v('PLAN_EXAM_VOICE_MINUTES'), writing: v('PLAN_EXAM_WRITING'), speaking: v('PLAN_EXAM_SPEAKING') },
      all: { voiceMin: v('PLAN_ALL_VOICE_MINUTES'), writing: v('PLAN_ALL_WRITING'), speaking: v('PLAN_ALL_SPEAKING') },
      premium: { voiceMin: v('PREMIUM_DAILY_MINUTES') * 30, voiceDaily: v('PREMIUM_DAILY_MINUTES'), writing: v('PLAN_PREMIUM_WRITING'), speaking: v('PLAN_PREMIUM_SPEAKING') },
    },
    referral: { xp: v('REF_XP'), planDays: v('REF_PLAN_DAYS') },
    coach: { textPerDay: v('AI_COACH_DAILY_LIMIT') },
  };
}
export type PublicLimits = ReturnType<typeof publicLimits>;
