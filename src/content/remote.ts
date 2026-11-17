// Metodist kabinetida e'lon qilingan darslarni yuklaydi (GET /api/content). Ilova ochilishida, render'dan oldin:
// avval qurilmadagi keshdan darhol, so'ng serverdan yangisi (2,5 s kutiladi). Server javob bermasa — ilova ichidagi darslar.
import { applyUnits } from './lessons';
import { refreshLessonNodes } from './curriculum/inventory';
import type { Unit } from './lessons/types';

const KEY = 'bandly.content.v1';
const valid = (u: unknown): u is Unit[] => Array.isArray(u) && u.length > 0 && u.every((x) => x && typeof x === 'object' && Array.isArray((x as Unit).lessons));
const apply = (units: Unit[]) => { applyUnits(units); refreshLessonNodes(); };

export async function loadRemoteContent(): Promise<void> {
  let cached: { version: number; units: Unit[] } | null = null;
  try { cached = JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { /* */ }
  if (cached && valid(cached.units)) apply(cached.units);
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch(`/api/content${cached ? `?v=${cached.version}` : ''}`, { signal: ctl.signal });
    clearTimeout(t);
    if (!r.ok) return;
    const j = (await r.json()) as { version: number; units: Unit[] | null };
    if (j.units && valid(j.units)) { apply(j.units); try { localStorage.setItem(KEY, JSON.stringify(j)); } catch { /* */ } }
  } catch { /* oflayn yoki sekin tarmoq: kesh yoki ichki darslar bilan davom etadi */ }
}
