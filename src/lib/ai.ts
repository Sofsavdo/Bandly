import { getAccount } from './account';
import type { Reaction } from '../content/roasts';
import { L } from '../i18n';

export interface Evaluation {
  bands: Record<string, number | null>;
  overall: number;
  strengths: string[];
  improve: string[];
  corrections: { said: string; better: string; why?: string; criterion?: 'task' | 'coherence' | 'lexical' | 'grammar' | 'fluency' }[];
  /** Bandni eng ko'p tushirayotgan mezon va +0.5 uchun aniq qadam */
  focus?: string;
}

let statusP: Promise<boolean> | null = null;
/** Server AI yoqilganmi (kalit sozlanganmi). Natija keshlanadi. */
export function aiEnabled(): Promise<boolean> {
  statusP ??= fetch('/api/ai/status').then((r) => r.json()).then((j: { enabled?: boolean }) => !!j.enabled).catch(() => false);
  return statusP;
}

async function post<T>(path: string, body: Record<string, unknown>, timeoutMs: number): Promise<T> {
  const a = getAccount();
  if (!a) throw new Error(L('AI uchun avval hisobingizga kiring'));
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: a.token, ...body }), signal: ctl.signal });
    const j = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) throw new Error(j.error ?? L('Xato {0}', [res.status]));
    return j;
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error(L('AI javob bermadi'));
    throw e;
  } finally { clearTimeout(t); }
}

/** Suhbat paytida: xato bo'lsa null qaytaradi, shunda skriptdagi savol ishlatiladi. */
export async function aiFollowup(question: string, answer: string, level = 0): Promise<{ question: string | null; reaction: Reaction | null }> {
  try { return await post<{ question: string | null; reaction: Reaction | null }>('/api/ai/followup', { question, answer, level }, 7000); } catch { return { question: null, reaction: null }; }
}
export const aiEvaluateSpeaking = (turns: { q: string; text: string }[]): Promise<Evaluation> => post('/api/ai/speaking', { turns }, 30_000);
export const aiEvaluateWriting = (task: 1 | 2, prompt: string, text: string): Promise<Evaluation> => post('/api/ai/writing', { task, prompt, text }, 30_000);

export interface LessonFeedback { feedback: string; better: string; level: string | null; left: number }
/** Dars ichidagi yozma topshiriq uchun Sellzen fikri: bitta qisqa so'rov (server kunlik chegarasi bilan). Xatoda xabar bilan tashlaydi. */
export const aiLessonFeedback = (target: string, text: string, level?: string | null): Promise<LessonFeedback> => post('/api/ai/lesson', { target, text, level: level ?? undefined }, 20_000);
