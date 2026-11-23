// Oxirgi server javobini qurilmada eslab qolish: sahifa ochilganda blok DARHOL (keshdan) chiziladi,
// keyin server javobi bilan yangilanadi — blok kechikib paydo bo'lib, sahifa "titramaydi".
// Kalitlar `sz.cache.*` (bandly.* emas — sinxronlanmaydi, faqat ko'rinish uchun). Hisob almashsa token bo'yicha ajratiladi.
import { useEffect, useState } from 'react';

const k = (key: string, scope = '') => `sz.cache.${key}${scope ? `.${scope.slice(-10)}` : ''}`;
export function readCache<T>(key: string, scope = ''): T | null {
  try { const raw = localStorage.getItem(k(key, scope)); return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
}
export function writeCache(key: string, scope: string, v: unknown): void { try { localStorage.setItem(k(key, scope), JSON.stringify(v)); } catch { /* joy yo'q */ } }

/** Keshdan darhol + serverdan yangilash. load null qaytarsa — kesh saqlanadi (vaqtinchalik tarmoq xatosi bloklarni yo'qotmaydi). */
export function useCached<T>(key: string, scope: string, load: (() => Promise<T | null>) | null): [T | null, (v: T | null) => void] {
  const [v, setV] = useState<T | null>(() => (load ? readCache<T>(key, scope) : null));
  useEffect(() => {
    if (!load) return;
    let alive = true;
    void load().then((x) => { if (!alive || x === null) return; setV(x); writeCache(key, scope, x); }).catch(() => undefined);
    return () => { alive = false; };
  }, [key, scope]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (x: T | null) => { setV(x); if (x !== null) writeCache(key, scope, x); };
  return [v, set];
}
