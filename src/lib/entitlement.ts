// Obuna huquqi — bitta qoida (barcha sahifalar shuni ishlatadi). Server obunasi (planUntil) bo'lsa, muddat tugashi bilan yopiladi,
// keyingi server yangilanishini kutmasdan. planUntil yo'q bo'lsa — bu faqat demo rejimdagi qurilma belgisi.
import type { TrackId } from './types';

export interface PlanState { plan: Record<TrackId, boolean>; planUntil: Partial<Record<TrackId, number | null>> }

export function hasTrack(p: PlanState, t: TrackId, now = Date.now()): boolean {
  const until = p.planUntil?.[t];
  return typeof until === 'number' ? until > now : !!p.plan[t];
}
export const hasAnyTrack = (p: PlanState, now = Date.now()): boolean => (['exam', 'grammar', 'mocks'] as const).some((t) => hasTrack(p, t, now));
