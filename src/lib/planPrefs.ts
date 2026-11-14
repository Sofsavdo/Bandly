// Learner's plan settings (goal, daily minutes). Device-local until accounts exist.
// Weekly lesson target (documented): minutes per day × 5 study days ÷ 12 minutes per average lesson, rounded down, at least 1.
export type Goal = 'general' | 'ielts' | 'cefr' | 'sat';
export const GOALS: { id: Goal; labelUz: string }[] = [
  { id: 'general', labelUz: 'Umumiy ingliz tili' }, { id: 'ielts', labelUz: 'IELTS' }, { id: 'cefr', labelUz: 'CEFR (Multilevel)' }, { id: 'sat', labelUz: 'SAT' },
];
export const MINUTES = [10, 20, 30, 45, 60] as const;
export interface PlanPrefs { goal: Goal; minutes: number }
const KEY = 'bandly.planprefs.v1';
export const DEFAULT_PREFS: PlanPrefs = { goal: 'general', minutes: 20 };

export function loadPrefs(): PlanPrefs {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<PlanPrefs> | null;
    const goal = GOALS.some((g) => g.id === d?.goal) ? (d!.goal as Goal) : DEFAULT_PREFS.goal;
    const minutes = (MINUTES as readonly number[]).includes(Number(d?.minutes)) ? Number(d!.minutes) : DEFAULT_PREFS.minutes;
    return { goal, minutes };
  } catch { return { ...DEFAULT_PREFS }; }
}
export function savePrefs(p: PlanPrefs): void { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ } }

/** Tags the planner treats as "matches your goal". Exam goals favour the reading/listening skill nodes (tagged 'ielts' / 'cefr'). */
export function goalTags(goal: Goal, weakSkills: ('reading' | 'listening')[] = []): string[] {
  const base = goal === 'general' ? ['general'] : goal === 'sat' ? ['sat', 'general'] : [goal];
  return [...base, ...weakSkills.map((s) => `weak-${s}`)];
}
export const weeklyLessonTarget = (minutes: number): number => Math.max(1, Math.floor((minutes * 5) / 12));

/** Monday 00:00 (local) of the week containing `now`. */
export function weekStart(now = Date.now()): number {
  const d = new Date(now); const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - day); return d.getTime();
}
