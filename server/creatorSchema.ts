// Creator Growth dasturi jadvallari. FAQAT yangi jadvallar va indekslar (CREATE ... IF NOT EXISTS): players, payments, xp_events va boshqa mavjud jadvallar o'zgarmaydi.
// Eski referral (players.ref_code / referred_by / ref_rewarded) o'z holicha qoladi va "haqiqat manbai" bo'lib qoladi; bu jadvallar uning ustiga qo'shimcha.
// Maxfiylik: IP saqlanmaydi; `fp` — tuz bilan xeshlangan (IP + brauzer) qisqa barmoq izi, faqat taxminiy noyoblik va firibgarlikni aniqlash uchun,
// 90 kundan keyin tozalanadi. Mehmonning shaxsiy ma'lumoti yo'q: faqat anonim click identifikatori.
import type { DatabaseSync } from 'node:sqlite';
import { ensureEventsTable } from './events';
import { ensureUserEventsTable } from './userEvents';

// Ustunlar: creator_links.code — ref_code alifbosida 8 belgi (eski ?ref= va Telegram ref_ oqimlari bilan mos); creator_clicks.bot: 0 inson, 1 bot/ko'rib chiqish, 2 ichki trafik;
// creator_clicks.dup: 10 soniya ichida takror; uniq: link + barmoq izi + kun bo'yicha birinchi inson klik; landed_ts: bridge sahifasi JS bajarilgani;
// creator_attrib.player_id: faqat hisob YARATILGANDA yoziladi va keyin o'zgarmaydi; source: 'link' | 'ref'; creator_campaigns: standart draft, reward_enabled=0;
// creator_posts.claimed_views — creator yozgan, TASDIQLANMAGAN; verified_* faqat admin.
// creator_reward_rules: mukofot QOIDALARI (kind: paid_pct | activated_flat | first_paid_flat | verified_views_per_1k); standart enabled=0, yoqish — egasi tasdig'i + byudjet/chegara bilan.
// creator_ledger: pul kichik birlikda (UZS: tiyin), event_key UNIQUE (idempotentlik), rule_id — qaysi qoida, parent_id — teskari yozuvning asosiy yozuvi;
// kind: commission | cpa_activated | cpa_first_paid | views | bonus | adjustment | reversal; status: pending | approved | rejected | paid.
export function ensureCreatorTables(db: DatabaseSync): void {
  ensureEventsTable(db); // app_meta (xesh tuzi) — barmoq izi uchun
  ensureUserEventsTable(db); // voronka plan_open qadami uchun o'qiladi
  db.exec(`
    CREATE TABLE IF NOT EXISTS creator_links (
      code TEXT PRIMARY KEY,
      creator_id INTEGER NOT NULL REFERENCES players(id),
      kind TEXT NOT NULL,
      label TEXT NOT NULL,
      campaign_id INTEGER,
      post_ref TEXT,
      lang TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS creator_links_creator ON creator_links (creator_id, created_at);
    CREATE TABLE IF NOT EXISTS creator_clicks (
      id TEXT PRIMARY KEY,
      link_code TEXT NOT NULL,
      creator_id INTEGER NOT NULL,
      ts INTEGER NOT NULL,
      day TEXT NOT NULL,
      fp TEXT,
      bot INTEGER NOT NULL DEFAULT 0,
      dup INTEGER NOT NULL DEFAULT 0,
      uniq INTEGER NOT NULL DEFAULT 0,
      landed_ts INTEGER
    );
    CREATE INDEX IF NOT EXISTS creator_clicks_link ON creator_clicks (link_code, ts);
    CREATE INDEX IF NOT EXISTS creator_clicks_creator ON creator_clicks (creator_id, ts);
    CREATE INDEX IF NOT EXISTS creator_clicks_fp ON creator_clicks (fp, ts);
    CREATE TABLE IF NOT EXISTS creator_click_events (
      click_id TEXT NOT NULL, name TEXT NOT NULL, ts INTEGER NOT NULL,
      PRIMARY KEY (click_id, name)
    );
    CREATE TABLE IF NOT EXISTS creator_attrib (
      player_id INTEGER PRIMARY KEY REFERENCES players(id),
      first_creator INTEGER, first_link TEXT, first_click TEXT, first_ts INTEGER,
      last_creator INTEGER, last_link TEXT, last_click TEXT, last_ts INTEGER,
      source TEXT NOT NULL,
      fp TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS creator_attrib_first ON creator_attrib (first_creator);
    CREATE INDEX IF NOT EXISTS creator_attrib_last ON creator_attrib (last_creator);
    CREATE INDEX IF NOT EXISTS creator_attrib_fp ON creator_attrib (fp, created_at);
    CREATE TABLE IF NOT EXISTS creator_profiles (
      player_id INTEGER PRIMARY KEY REFERENCES players(id),
      status TEXT NOT NULL DEFAULT 'approved',
      locale TEXT, country TEXT, platforms TEXT, social TEXT, note TEXT,
      rank_opt_in INTEGER NOT NULL DEFAULT 0,
      fp_hint TEXT,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS creator_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, brief TEXT NOT NULL DEFAULT '', rules TEXT NOT NULL DEFAULT '',
      requires_video INTEGER NOT NULL DEFAULT 0,
      starts_at INTEGER, ends_at INTEGER,
      status TEXT NOT NULL DEFAULT 'draft',
      created_by INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS creator_reward_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      campaign_id INTEGER,
      kind TEXT NOT NULL,
      pct REAL,
      amount_minor INTEGER,
      currency TEXT NOT NULL DEFAULT 'UZS',
      hold_days INTEGER NOT NULL DEFAULT 7,
      window_days INTEGER NOT NULL DEFAULT 180,
      cap_per_creator_minor INTEGER, budget_minor INTEGER, cap_per_item_minor INTEGER,
      starts_at INTEGER, ends_at INTEGER,
      enabled INTEGER NOT NULL DEFAULT 0, approved_by INTEGER, approved_at INTEGER,
      created_by INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS creator_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER NOT NULL REFERENCES players(id),
      campaign_id INTEGER, link_code TEXT,
      platform TEXT NOT NULL, url TEXT, url_norm TEXT,
      lang TEXT, posted_on TEXT, caption TEXT,
      claimed_views INTEGER,
      verified_views INTEGER, verified_by INTEGER, verify_method TEXT,
      evidence TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      admin_note TEXT, reviewed_by INTEGER, reviewed_at INTEGER,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS creator_posts_creator ON creator_posts (creator_id, created_at);
    CREATE INDEX IF NOT EXISTS creator_posts_status ON creator_posts (status, updated_at);
    CREATE INDEX IF NOT EXISTS creator_posts_url ON creator_posts (url_norm);
    CREATE TABLE IF NOT EXISTS creator_post_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL REFERENCES creator_posts(id),
      ts INTEGER NOT NULL, actor_id INTEGER, from_status TEXT, to_status TEXT NOT NULL, note TEXT
    );
    CREATE TABLE IF NOT EXISTS creator_flags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER NOT NULL, link_code TEXT, kind TEXT NOT NULL,
      detail TEXT, dedupe_key TEXT NOT NULL UNIQUE, ts INTEGER NOT NULL, resolved INTEGER NOT NULL DEFAULT 0, resolved_by INTEGER, resolved_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS creator_refunds (
      payment_id TEXT PRIMARY KEY REFERENCES payments(id),
      amount_minor INTEGER NOT NULL, currency TEXT NOT NULL, at INTEGER NOT NULL, recorded_by INTEGER, note TEXT
    );
    CREATE TABLE IF NOT EXISTS creator_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER NOT NULL REFERENCES players(id),
      campaign_id INTEGER, rule_id INTEGER, parent_id INTEGER,
      kind TEXT NOT NULL,
      event_key TEXT NOT NULL UNIQUE,
      payment_id TEXT,
      amount_minor INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      basis TEXT, note TEXT,
      created_at INTEGER NOT NULL, decided_by INTEGER, decided_at INTEGER, paid_ref TEXT
    );
    CREATE INDEX IF NOT EXISTS creator_ledger_creator ON creator_ledger (creator_id, created_at);
    CREATE INDEX IF NOT EXISTS creator_ledger_status ON creator_ledger (status, created_at);
    CREATE TABLE IF NOT EXISTS creator_ledger_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT, ledger_id INTEGER NOT NULL REFERENCES creator_ledger(id),
      ts INTEGER NOT NULL, actor_id INTEGER, from_status TEXT, to_status TEXT NOT NULL, note TEXT
    );
  `);
}
