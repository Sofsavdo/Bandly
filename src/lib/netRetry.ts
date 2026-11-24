// Deploy paytidagi qisqa uzilish (Railway konteynerni almashtirganda 3–15 soniya 502/503/ulanish xatosi) foydalanuvchiga xato bo'lib ko'rinmasin:
// faqat o'qiydigan (GET/HEAD) /api so'rovlari tarmoq xatosi yoki 502/503/504 da bir necha marta qayta uriniladi. POST/PUT (yozuv) qayta yuborilmaydi.
export const RETRY_DELAYS_MS = [700, 1600, 3200];
const RETRY_STATUS = new Set([502, 503, 504]);

export function shouldRetry(method: string, url: string, origin: string): boolean {
  if (method !== 'GET' && method !== 'HEAD') return false;
  try { const u = new URL(url, origin); return u.origin === origin && u.pathname.startsWith('/api/'); } catch { return false; }
}

export function installNetRetry(g: { fetch: typeof fetch; location: { origin: string } } = window, sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms))): void {
  const orig = g.fetch.bind(g) as typeof fetch;
  g.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!shouldRetry(method, url, g.location.origin)) return orig(input, init);
    for (let i = 0; ; i++) {
      try {
        const res = await orig(input, init);
        if (!RETRY_STATUS.has(res.status) || i >= RETRY_DELAYS_MS.length) return res;
      } catch (e) {
        if (i >= RETRY_DELAYS_MS.length || init?.signal?.aborted) throw e;
      }
      await sleep(RETRY_DELAYS_MS[i]!);
    }
  }) as typeof fetch;
}
