// Builds the learner's daily plan from: placement level, mastery & error history, plan settings (goal, minutes), skill-check results and exam date.
// Pure: all inputs are passed in, so the Home card and the tests run the same code.
import { ALL_NODES } from '../content/curriculum/inventory';
import { ALL_LESSONS } from '../content/lessons';
import { planDay, type PlanTask } from './adaptive/recommend';
import type { Saved } from './adaptive/store';
import { goalTags, type PlanPrefs } from './planPrefs';

const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const levelOf = (l: string): number => ORDER.indexOf(l);
const isSkill = (s: string): boolean => s === 'reading' || s === 'listening';

/** Reading/Listening is "weak" when the skill-check estimate is below the General English level. */
export function weakSkills(level: string, skills: { reading?: { level: string }; listening?: { level: string } }): ('reading' | 'listening')[] {
  const u = levelOf(level);
  return (['reading', 'listening'] as const).filter((k) => skills[k] && levelOf(skills[k]!.level) < u);
}

export function buildDailyPlan(input: { level: string; saved: Saved; prefs: PlanPrefs; skills: { reading?: { level: string }; listening?: { level: string } }; examDate?: number; now: number }): { tasks: PlanTask[]; weak: ('reading' | 'listening')[] } {
  const u = levelOf(input.level);
  // levels with structured General English lessons: lessons replace the loose legacy grammar topics (answers there still count)
  const lessonLevels = new Set(ALL_LESSONS.map((x) => x.unit.level as string));
  const window = ALL_NODES.filter((n) => (isSkill(n.skill) || Math.abs(levelOf(n.level) - u) <= 1) && !(n.id.startsWith('ge.grammar.') && lessonLevels.has(n.level)));
  // below-level nodes count as known (placement evidence) and are planned only when real answers show weakness
  const assumed = ALL_NODES.filter((n) => !isSkill(n.skill) && levelOf(n.level) < u).map((n) => n.id);
  const candidates = window.filter((n) => !assumed.includes(n.id) || !!input.saved.mastery[n.id]);
  const weak = weakSkills(input.level, input.skills);
  // rank everything once (planner rules: due revisions first, prerequisites, new-node cap), then fill the minute budget with a mix:
  // exam question-type practice may take at most half of the tasks, so General English is never crowded out.
  const ranked = planDay(candidates, { mastery: input.saved.mastery, recentErrors: input.saved.errors, goalTags: goalTags(input.prefs.goal, weak), examDate: input.examDate, now: input.now, assumed }, { minutes: 100_000 });
  const tasks: PlanTask[] = [];
  let used = 0, skillCount = 0;
  for (const t of ranked) {
    if (used + t.minutes > input.prefs.minutes) continue;
    const skill = /^ge\.(reading|listening)\./.test(t.nodeId);
    if (skill && skillCount + 1 > Math.ceil((tasks.length + 1) / 2)) continue;
    tasks.push(t); used += t.minutes; if (skill) skillCount++;
  }
  return { tasks, weak };
}
