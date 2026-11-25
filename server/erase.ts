import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { ApiError, roleOf, tx } from './db';

// Foydalanuvchining o'z hisobini o'chirishi (Maxfiylik siyosati, «Huquqlaringiz»).
// Shaxsiy ma'lumotlar (progress, natijalar, xotira, hodisalar, telefon, sessiyalar) o'chiriladi;
// to'lov va obuna yozuvlari hisob-kitob uchun saqlanadi, lekin hisob anonimlashtiriladi (ism, telefon, Telegram identifikatori yo'q).
const KEEP = new Set(['players', 'payments', 'subscriptions']);
/** Anonimlashtirishda bo'shatiladigan ustunlar (jadvalda bo'lsa). */
const CLEAR = ['phone', 'pass_hash', 'google_sub', 'tg_id', 'full_name', 'photo', 'photo_url', 'ref_code', 'referred_by', 'lang', 'role'];

export function erasePlayer(db: DatabaseSync, playerId: number): { tables: Record<string, number> } {
  const p = db.prepare('SELECT id, tg_id FROM players WHERE id = ?').get(playerId) as { id: number; tg_id: number | null } | undefined;
  if (!p) throw new ApiError(404, 'Hisob topilmadi');
  if (roleOf(db, playerId)) throw new ApiError(403, 'Xodim hisobini o‘chirib bo‘lmaydi — administrator bilan bog‘laning');
  const cols = (t: string): string[] => (db.prepare(`PRAGMA table_info("${t}")`).all() as { name: string }[]).map((c) => c.name);
  const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]).map((r) => r.name);
  const removed: Record<string, number> = {};
  tx(db, () => {
    for (const t of tables) {
      if (KEEP.has(t)) continue;
      const c = cols(t);
      let n = 0;
      if (c.includes('player_id')) n += Number(db.prepare(`DELETE FROM "${t}" WHERE player_id = ?`).run(playerId).changes);
      else if (p.tg_id !== null && c.includes('tg_id')) n += Number(db.prepare(`DELETE FROM "${t}" WHERE tg_id = ?`).run(p.tg_id).changes);
      if (n) removed[t] = n;
    }
    const pc = cols('players');
    if (pc.includes('referred_by')) db.prepare('UPDATE players SET referred_by = NULL WHERE referred_by = ?').run(playerId);
    const sets = ['nickname = ?', 'token = ?', 'xp = 0', 'streak = 0', 'updated_at = ?', ...CLEAR.filter((x) => pc.includes(x)).map((x) => `${x} = NULL`)];
    if (pc.includes('remind')) sets.push('remind = 0');
    db.prepare(`UPDATE players SET ${sets.join(', ')} WHERE id = ?`).run(`deleted-${playerId}`, `deleted:${randomBytes(12).toString('hex')}`, Date.now(), playerId);
  });
  return { tables: removed };
}
