// Plan follow-through and automatic load adjustment (ADAPTIVE_LEARNING_SPEC "Plan adjustment").
// Rules (documented, deterministic):
//  - the first plan shown on a local day is recorded (node ids);
//  - a planned node counts as done when it received at least one answer that day (mastery record's lastDay === that day);
//  - review window: the last 7 days before today that have a recorded plan; needs at least 3 such days;
//  - completion < 60 % → today's budget is lowered one step (e.g. 30 → 20 min, never below 10); the learner sees why and can keep their setting;
//  - completion ≥ 90 % on ≥ 5 days → the card suggests raising the daily time (never raised automatically).
import type { MasteryRecord } from './adaptive/mastery';
import { MINUTES } from './planPrefs';

const KEY = 'bandly.planlog.v1';
export type PlanLog = Record<string, string[]>; // dayKey → planned node ids

export function loadLog(): PlanLog {
  try { const d = JSON.parse(localStorage.getItem(KEY) ?? '{}') as PlanLog; return d && typeof d === 'object' ? d : {}; } catch { return {}; }
}
/** Records the day's plan once (first time it is shown); keeps the last 30 days. */
export function recordPlanned(day: string, nodeIds: string[]): void {
  const log = loadLog();
  if (log[day] || !nodeIds.length) return;
  log[day] = nodeIds;
  const keep = Object.keys(log).sort().slice(-30);
  try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(keep.map((k) => [k, log[k]!])))); } catch { /* storage unavailable */ }
}

export interface Review { days: number; planned: number; done: number; rate: number | null }
export function review(log: PlanLog, mastery: Record<string, MasteryRecord>, today: string, answeredOn: (nodeId: string, day: string) => boolean = (id, d) => mastery[id]?.lastDay === d): Review {
  const days = Object.keys(log).filter((d) => d < today).sort().slice(-7);
  let planned = 0, done = 0;
  for (const d of days) { const ids = log[d]!; planned += ids.length; done += ids.filter((id) => answeredOn(id, d)).length; }
  return { days: days.length, planned, done, rate: days.length >= 3 && planned > 0 ? done / planned : null };
}

export interface Load { minutes: number; lowered: boolean; suggestMore: boolean }
export function adjustMinutes(chosen: number, r: Review): Load {
  if (r.rate !== null && r.rate < 0.6) {
    const steps = MINUTES as readonly number[];
    const i = Math.max(0, steps.indexOf(chosen) - 1);
    const lowered = steps[i]! < chosen;
    return { minutes: steps[i]!, lowered, suggestMore: false };
  }
  return { minutes: chosen, lowered: false, suggestMore: r.rate !== null && r.rate >= 0.9 && r.days >= 5 && chosen < 60 };
}
