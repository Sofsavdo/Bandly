// Ikki qurilma progressini birlashtirish: "kim ko'p XP to'plagan bo'lsa, o'shaniki" o'rniga har bir yozuv alohida birlashtiriladi,
// shunda bir qurilmada o'tilgan dars ikkinchi qurilmadagi eski holat sabab yo'qolmaydi. Qoidalar monoton: o'tilgan dars
// o'tilmagan bo'lib qolmaydi, eng yaxshi natija kamaymaydi, natijalar va xatolar ro'yxati id bo'yicha birlashadi.
// Bu fayl hech narsani import qilmaydi (cloudBoot.ts uni sahifa yuklanishidan oldin ishlatadi).
type Snap = Record<string, string>;
type Obj = Record<string, unknown>;

const parse = (s: string | undefined): unknown => { try { return s === undefined ? undefined : JSON.parse(s); } catch { return undefined; } };
const isObj = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x);
const num = (x: unknown): number => (typeof x === 'number' && Number.isFinite(x) ? x : 0);
const minSet = (a: unknown, b: unknown): number | null => {
  const xs = [a, b].filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  return xs.length ? Math.min(...xs) : null;
};
/** Ikkala tomondagi kalitlar bo'yicha birlashtirish (bir tomonda bo'lsa — o'sha). */
function byKey<T>(a: Obj, b: Obj, f: (x: T, y: T) => T): Obj {
  const out: Obj = { ...b, ...a };
  for (const k of Object.keys(a)) if (k in b) out[k] = f(a[k] as T, b[k] as T);
  return out;
}
/** id (yoki boshqa kalit) bo'yicha ro'yxatlarni birlashtirish; ikkala tomonda bo'lsa pick tanlaydi. */
function unionBy<T extends Obj>(a: unknown, b: unknown, key: (x: T) => string, pick: (x: T, y: T) => T = (x) => x): T[] {
  const m = new Map<string, T>();
  for (const x of [...(Array.isArray(b) ? b : []), ...(Array.isArray(a) ? a : [])] as T[]) {
    if (!isObj(x)) continue;
    const k = key(x); const prev = m.get(k);
    m.set(k, prev ? pick(x, prev) : x);
  }
  return [...m.values()];
}

// Dars/boss natijasi: urinishlar va eng yaxshi natija — maksimum, o'tilgan sana — eng birinchisi.
const record = (x: Obj, y: Obj): Obj => ({ ...y, ...x, attempts: Math.max(num(x.attempts), num(y.attempts)), best: Math.max(num(x.best), num(y.best)), passedAt: minSet(x.passedAt, y.passedAt) });
// SRS kartasi: ko'proq ko'rilgani (teng bo'lsa keyingi takrorlash vaqti kechrog'i) — oxirgi holat.
const card = (x: Obj, y: Obj): Obj => (num(x.seen) !== num(y.seen) ? (num(x.seen) > num(y.seen) ? x : y) : num(x.due) >= num(y.due) ? x : y);
const mastery = (x: Obj, y: Obj): Obj => (num(x.lastSeen) >= num(y.lastSeen) ? x : y);

function mergeProfile(a: Obj, b: Obj): Obj {
  // Oddiy maydonlar (sozlamalar, seriya) — XP ko'p bo'lgan tomondan; to'planadigan maydonlar alohida birlashtiriladi.
  const [hi, lo] = num(a.xp) >= num(b.xp) ? [a, b] : [b, a];
  const out: Obj = { ...lo, ...hi };
  out.xp = Math.max(num(a.xp), num(b.xp));
  out.longestStreak = Math.max(num(a.longestStreak), num(b.longestStreak));
  out.gamesPlayed = Math.max(num(a.gamesPlayed), num(b.gamesPlayed));
  out.bossWins = Math.max(num(a.bossWins), num(b.bossWins));
  out.achievements = [...new Set([...(Array.isArray(lo.achievements) ? lo.achievements : []), ...(Array.isArray(hi.achievements) ? hi.achievements : [])])];
  if (isObj(a.srs) || isObj(b.srs)) out.srs = byKey<Obj>(isObj(a.srs) ? a.srs : {}, isObj(b.srs) ? b.srs : {}, card);
  if (isObj(a.activity) || isObj(b.activity)) out.activity = byKey<number>(isObj(a.activity) ? a.activity : {}, isObj(b.activity) ? b.activity : {}, (x, y) => Math.max(num(x), num(y)));
  if (Array.isArray(a.checkpoints) || Array.isArray(b.checkpoints)) out.checkpoints = unionBy<Obj>(a.checkpoints, b.checkpoints, (x) => String(x.at)).sort((x, y) => String(x.at).localeCompare(String(y.at)));
  // Daraja: eng oxirgi daraja testi natijasi
  const pa = String(a.placementAt ?? ''), pb = String(b.placementAt ?? '');
  const lvl = pa >= pb ? a : b;
  if (lvl.placementAt) { out.level = lvl.level; out.placementAt = lvl.placementAt; out.baselineBand = lvl.baselineBand ?? out.baselineBand; }
  return out;
}

const MERGERS: Record<string, (a: unknown, b: unknown) => unknown> = {
  'bandly.profile.v1': (a, b) => (isObj(a) && isObj(b) ? mergeProfile(a, b) : a ?? b),
  'bandly.lessons.v1': (a, b) => byKey<Obj>(isObj(a) ? a : {}, isObj(b) ? b : {}, record),
  'bandly.boss.v1': (a, b) => byKey<Obj>(isObj(a) ? a : {}, isObj(b) ? b : {}, record),
  'bandly.lessonxp.v1': (a, b) => byKey<string>(isObj(a) ? a : {}, isObj(b) ? b : {}, (x, y) => (String(x) >= String(y) ? x : y)),
  'bandly.results.v1': (a, b) => unionBy<Obj>(a, b, (x) => String(x.id)).sort((x, y) => String(y.date).localeCompare(String(x.date))).slice(0, 200),
  'bandly.fullhist.v1': (a, b) => unionBy<Obj>(a, b, (x) => String(x.at)).sort((x, y) => num(x.at) - num(y.at)),
  // Xato: kim ko'proq ishlagan (streak/due kechroq) — o'sha holat
  'bandly.mistakes.v1': (a, b) => unionBy<Obj>(a, b, (x) => String(x.id), (x, y) => (num(x.due) >= num(y.due) ? x : y)),
  'bandly.mastery.v1': (a, b) => {
    if (!isObj(a) || !isObj(b)) return a ?? b;
    const errs = [...(Array.isArray(b.errors) ? b.errors : []), ...(Array.isArray(a.errors) ? a.errors : [])].slice(-30);
    return { ...b, ...a, mastery: byKey<Obj>(isObj(a.mastery) ? a.mastery : {}, isObj(b.mastery) ? b.mastery : {}, mastery), errors: errs };
  },
  'bandly.free.v1': (a, b) => {
    if (!isObj(a) || !isObj(b)) return a ?? b;
    return { ...b, ...a, unlocked: { ...(isObj(b.unlocked) ? b.unlocked : {}), ...(isObj(a.unlocked) ? a.unlocked : {}) }, firstDay: [a.firstDay, b.firstDay].filter(Boolean).sort()[0] ?? null };
  },
};

/**
 * Qurilmadagi (local) va hisobdagi (remote) progressni birlashtiradi. Ma'lum kalitlar yozuv darajasida birlashadi;
 * noma'lum kalitlar (sozlamalar, ko'rinish) — XP ko'p bo'lgan tomondan, bir tomonda bo'lsa — o'sha.
 */
export function mergeSnapshot(local: Snap, remote: Snap): Snap {
  const xp = (s: Snap) => { const p = parse(s['bandly.profile.v1']); return isObj(p) ? num(p.xp) : 0; };
  const localWins = xp(local) >= xp(remote);
  const out: Snap = {};
  for (const k of new Set([...Object.keys(remote), ...Object.keys(local)])) {
    const a = local[k], b = remote[k];
    if (a === undefined || b === undefined || a === b) { out[k] = (a ?? b)!; continue; }
    const f = MERGERS[k];
    const pa = parse(a), pb = parse(b);
    if (f && pa !== undefined && pb !== undefined) { out[k] = JSON.stringify(f(pa, pb)); continue; }
    out[k] = localWins ? a : b;
  }
  return out;
}
