// Ikki qurilma bitta hisobda parallel ishlaydi: server (haqiqiy putProgress/getProgress) bilan to'qnashuvda ish yo'qolmasligi.
import assert from 'node:assert/strict';
import { ApiError, createDb, getProgress, join, putProgress } from '../../server/db';

class Mem { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, String(v)); } removeItem(k: string) { this.m.delete(k); } clear() { this.m.clear(); } key(i: number) { return [...this.m.keys()][i] ?? null; } get length() { return this.m.size; } }
const db = createDb();
const acc = join(db, 'Ikkiqurilma');
let offline = false;
const g = globalThis as unknown as Record<string, unknown>;
g.fetch = async (_url: string, init: { method?: string; body?: string } = {}) => {
  if (offline) throw new TypeError('Failed to fetch');
  try {
    const out = init.method === 'PUT' ? (() => { const b = JSON.parse(init.body!); return putProgress(db, acc.token, b.data, Number(b.rev)); })() : getProgress(db, acc.token);
    return { ok: true, status: 200, json: async () => out };
  } catch (e) { return { ok: false, status: (e as ApiError).status ?? 500, json: async () => ({ error: (e as Error).message }) }; }
};
g.location = { reload() {}, hash: '#/', pathname: '/', search: '' };
g.document = { addEventListener() {}, visibilityState: 'visible' };
g.window = { addEventListener() {} };

/** Bitta "qurilma": o'z localStorage/sessionStorage'i va cloud modulining o'z nusxasi. */
async function device(name: string) {
  const ls = new Mem(), ss = new Mem();
  // Object.keys(localStorage) ishlashi uchun kalitlarni xususiyat sifatida ko'rsatadigan proxy
  const proxy = (m: Mem) => new Proxy(m, { ownKeys: (t) => [...t.m.keys()], getOwnPropertyDescriptor: (t, k) => (t.m.has(String(k)) ? { enumerable: true, configurable: true, value: t.m.get(String(k)) } : undefined) });
  const use = () => { g.localStorage = proxy(ls); g.sessionStorage = proxy(ss); };
  use();
  ls.setItem('bandly.account.v1', JSON.stringify({ token: acc.token, nickname: 'Ikkiqurilma' }));
  const mod = await import(`./cloud.ts?${name}`) as typeof import('./cloud');
  const boot = async () => { use(); await import(`./cloudBoot.ts?${name}-${Math.random()}`); }; // sahifa yangilanishi
  return { ls, use, mod, boot, lessons: () => JSON.parse(ls.getItem('bandly.lessons.v1') ?? '{}') as Record<string, unknown> };
}

const A = await device('A');
A.ls.setItem('bandly.lessons.v1', JSON.stringify({ l1: { attempts: 1, best: 1, passedAt: 100 } }));
A.ls.setItem('bandly.profile.v1', JSON.stringify({ v: 1, xp: 40 }));
await A.mod.pushProgress();
assert.deepEqual(Object.keys(getProgress(db, acc.token).data!), ['bandly.lessons.v1', 'bandly.profile.v1']);

// B qurilma eski holatda (rev 0) — boshqa darsni o'tadi, XP ko'proq
const B = await device('B');
B.ls.setItem('bandly.lessons.v1', JSON.stringify({ l2: { attempts: 1, best: 1, passedAt: 200 } }));
B.ls.setItem('bandly.profile.v1', JSON.stringify({ v: 1, xp: 90 }));
await B.mod.pushProgress(); // 409 → birlashtiriladi
const remote = JSON.parse(getProgress(db, acc.token).data!['bandly.lessons.v1']!);
assert.ok(remote.l1 && remote.l2, 'B ning eski snapshot\'i A dagi darsni o\'chirmadi');
// B sahifasi yangilanganda birlashgan holat qurilmaga ham yoziladi
await B.boot();
assert.ok(B.lessons().l1 && B.lessons().l2, 'B qurilmada ham ikkala dars');

// A yana ishlaydi (uning rev'i eskirgan): uchinchi dars qo'shiladi, B'niki saqlanadi
A.use();
A.ls.setItem('bandly.lessons.v1', JSON.stringify({ l1: { attempts: 2, best: 1, passedAt: 100 }, l3: { attempts: 1, best: 0.9, passedAt: 300 } }));
await A.mod.pushProgress();
const r3 = JSON.parse(getProgress(db, acc.token).data!['bandly.lessons.v1']!);
assert.deepEqual(Object.keys(r3).sort(), ['l1', 'l2', 'l3']);
assert.equal(JSON.parse(getProgress(db, acc.token).data!['bandly.profile.v1']!).xp, 90, 'XP kamaymaydi');

// Internet uzildi: o'zgarish qurilmada qoladi va qaytganda yuboriladi
offline = true;
A.ls.setItem('bandly.lessons.v1', JSON.stringify({ ...r3, l4: { attempts: 1, best: 1, passedAt: 400 } }));
await A.mod.pushProgress();
offline = false;
await A.mod.pushProgress();
assert.ok(JSON.parse(getProgress(db, acc.token).data!['bandly.lessons.v1']!).l4, 'oflayn ish internet qaytganda saqlandi');
console.log('cloud.test: OK');
