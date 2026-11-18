// Band o'lchovi (mijoz): to'liq imtihon natijalari va rasmiy IELTS natijalari serverga yoziladi,
// shunda o'sish (boshlang'ichdan) haqiqiy ma'lumotdan hisoblanadi. Hisobsiz o'quvchida — faqat qurilmadagi tarix.
import { getAccount } from './account';
import { loadMocks, type MockEntry } from './history';
import { L } from '../i18n';

export interface BandRecord {
  id: number; at: number; source: 'mock' | 'official';
  listening: number | null; reading: number | null; writing: number | null; speaking: number | null;
  overall: number; testDate: string | null;
}
export interface BandSummary { baseline: BandRecord | null; latest: BandRecord | null; gain: number | null; nextMockAt: number | null; official: BandRecord | null }
export interface BandData { records: BandRecord[]; summary: BandSummary }

async function call(method: string, path: string, body?: unknown): Promise<BandData> {
  const a = getAccount();
  if (!a) throw new Error(L('Hisobga kiring'));
  const res = await fetch(path, { method, headers: { 'content-type': 'application/json', 'x-token': a.token }, body: body ? JSON.stringify(body) : undefined });
  const j = (await res.json().catch(() => ({}))) as BandData & { error?: string };
  if (!res.ok) throw new Error(j.error ?? L('Saqlab bo‘lmadi'));
  return j;
}

export const fetchBands = (): Promise<BandData> => call('GET', '/api/bands');
export const addOfficial = (b: { listening: number; reading: number; writing: number; speaking: number; testDate: string }): Promise<BandData> =>
  call('POST', '/api/bands', { ...b, source: 'official' });
export const removeBand = (id: number): Promise<BandData> => call('DELETE', `/api/bands/${id}`);

/** To'liq imtihon natijasini serverga yozadi (bir imtihon — bitta yozuv, kalit bilan; qayta yuborilsa yangilanadi). */
export function syncMock(m: MockEntry): void {
  if (!getAccount()) return;
  void call('POST', '/api/bands', { source: 'mock', key: `mock-${m.at}`, at: m.at, listening: m.listening ?? null, reading: m.reading ?? null, writing: m.writing ?? null, speaking: m.speaking ?? null }).catch(() => undefined);
}
/** Kirishdan oldin qurilmada topshirilgan imtihonlarni serverga ko'chiradi (bir marta, kalit takrorni oldini oladi). */
export function syncLocalMocks(server: BandRecord[]): void {
  const have = new Set(server.filter((r) => r.source === 'mock').map((r) => r.at));
  for (const m of loadMocks()) if (!have.has(m.at)) syncMock(m);
}

export const BAND_STEPS = Array.from({ length: 19 }, (_, i) => i / 2); // 0 … 9
