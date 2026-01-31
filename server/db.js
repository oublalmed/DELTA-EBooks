import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'delta_ebooks.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS books (
    id            TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    subtitle      TEXT,
    author        TEXT NOT NULL,
    description   TEXT,
    price         REAL NOT NULL DEFAULT 9.99,
    currency      TEXT NOT NULL DEFAULT 'USD',
    cover_image   TEXT,
    accent_color  TEXT,
    total_chapters INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id            INTEGER NOT NULL,
    book_id       TEXT NOT NULL,
    title         TEXT NOT NULL,
    subtitle      TEXT,
    summary       TEXT,
    content       TEXT NOT NULL,
    reflection_prompt TEXT,
    image         TEXT,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (book_id, id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    book_id         TEXT NOT NULL,
    paypal_order_id TEXT,
    stripe_payment_intent_id TEXT,
    amount          REAL NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'USD',
    status          TEXT NOT NULL DEFAULT 'completed',
    purchased_at    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE(user_id, book_id)
  );

  CREATE TABLE IF NOT EXISTS payment_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER,
    book_id         TEXT,
    paypal_order_id TEXT,
    event_type      TEXT NOT NULL,
    amount          REAL,
    currency        TEXT,
    status          TEXT NOT NULL,
    raw_data        TEXT,
    ip_address      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS download_tokens (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    book_id     TEXT NOT NULL,
    token       TEXT UNIQUE NOT NULL,
    expires_at  TEXT NOT NULL,
    used        INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS download_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    book_id     TEXT NOT NULL,
    ip_address  TEXT,
    downloaded_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    user_id     INTEGER NOT NULL,
    book_id     TEXT NOT NULL,
    chapter_id  INTEGER NOT NULL,
    completed   INTEGER NOT NULL DEFAULT 0,
    reflection  TEXT,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, book_id, chapter_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS email_subscribers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT UNIQUE NOT NULL,
    source      TEXT DEFAULT 'website',
    subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS expression_entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    text        TEXT NOT NULL,
    category    TEXT NOT NULL,
    mood        TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS journey_entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    date        TEXT NOT NULL,
    emotion     TEXT NOT NULL,
    milestone   TEXT,
    challenge   TEXT,
    reflection  TEXT,
    rating      INTEGER NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- ══════════════════════════════════════════════════════════════════
  -- NEW: Enhanced Journal Entries (Expressive Journal & Personal Calendar)
  -- ══════════════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS journal_entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    date        TEXT NOT NULL,
    title       TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'general',
    content     TEXT NOT NULL,
    mood        TEXT,
    mood_rating INTEGER DEFAULT 3,
    tags        TEXT,
    image_url   TEXT,
    is_public   INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Journal entry likes (for public entries)
  CREATE TABLE IF NOT EXISTS journal_likes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id    INTEGER NOT NULL,
    user_id     INTEGER NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(entry_id, user_id),
    FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Journal entry comments (for public entries)
  CREATE TABLE IF NOT EXISTS journal_comments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id    INTEGER NOT NULL,
    user_id     INTEGER NOT NULL,
    content     TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- ══════════════════════════════════════════════════════════════════
  -- NEW: Ad-Based Premium Access System
  -- ══════════════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS premium_access (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    access_type     TEXT NOT NULL DEFAULT 'ad_reward',
    granted_at      TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT NOT NULL,
    duration_days   INTEGER NOT NULL DEFAULT 7,
    ad_network      TEXT DEFAULT 'admob',
    ad_unit_id      TEXT,
    reward_amount   INTEGER DEFAULT 1,
    device_id       TEXT,
    platform        TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Premium access logs (for analytics and fraud prevention)
  CREATE TABLE IF NOT EXISTS premium_access_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    action          TEXT NOT NULL,
    access_type     TEXT,
    duration_days   INTEGER,
    ip_address      TEXT,
    device_info     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- ══════════════════════════════════════════════════════════════════
  -- NEW: User trial tracking
  -- ══════════════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS user_trials (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL UNIQUE,
    trial_started   TEXT NOT NULL DEFAULT (datetime('now')),
    trial_ends      TEXT NOT NULL,
    trial_used      INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- ══════════════════════════════════════════════════════════════════
  -- NEW: Journal/Calendar Access Tracking (Free week + ad unlock)
  -- ══════════════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS journal_access (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL UNIQUE,
    free_trial_started TEXT NOT NULL DEFAULT (datetime('now')),
    free_trial_ends TEXT NOT NULL,
    access_until    TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- ══════════════════════════════════════════════════════════════════
  -- NEW: Chapter Unlock Tracking (Chapters 6+ require ads)
  -- ══════════════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS chapter_unlocks (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    book_id         TEXT NOT NULL,
    chapter_id      INTEGER NOT NULL,
    unlocked_at     TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, book_id, chapter_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  );

  -- ══════════════════════════════════════════════════════════════════
  -- NEW: PDF Download Progress (5 ads required per book)
  -- ══════════════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS pdf_download_progress (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    book_id         TEXT NOT NULL,
    ads_watched     INTEGER NOT NULL DEFAULT 0,
    ads_required    INTEGER NOT NULL DEFAULT 5,
    is_unlocked     INTEGER NOT NULL DEFAULT 0,
    unlocked_at     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
  CREATE INDEX IF NOT EXISTS idx_purchases_book ON purchases(book_id);
  CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(paypal_order_id);
  CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
  
  -- Journal indexes
  CREATE INDEX IF NOT EXISTS idx_journal_entries_user ON journal_entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
  CREATE INDEX IF NOT EXISTS idx_journal_entries_public ON journal_entries(is_public);
  CREATE INDEX IF NOT EXISTS idx_journal_likes_entry ON journal_likes(entry_id);
  CREATE INDEX IF NOT EXISTS idx_journal_comments_entry ON journal_comments(entry_id);
  
  -- Premium access indexes
  CREATE INDEX IF NOT EXISTS idx_premium_access_user ON premium_access(user_id);
  CREATE INDEX IF NOT EXISTS idx_premium_access_expires ON premium_access(expires_at);
  
  -- Chapter unlock indexes
  CREATE INDEX IF NOT EXISTS idx_chapter_unlocks_user ON chapter_unlocks(user_id);
  CREATE INDEX IF NOT EXISTS idx_chapter_unlocks_book ON chapter_unlocks(book_id, chapter_id);
  
  -- Journal access indexes
  CREATE INDEX IF NOT EXISTS idx_journal_access_user ON journal_access(user_id);
  
  -- PDF download progress indexes
  CREATE INDEX IF NOT EXISTS idx_pdf_download_user ON pdf_download_progress(user_id);
  CREATE INDEX IF NOT EXISTS idx_pdf_download_book ON pdf_download_progress(book_id);
`);

// ── Extend users table with premium fields if not exists ──
try {
  db.exec(`ALTER TABLE users ADD COLUMN premium_until TEXT`);
} catch (e) {
  // Column already exists, ignore
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN trial_used INTEGER DEFAULT 0`);
} catch (e) {
  // Column already exists, ignore
}

// ══════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD TABLES
// ══════════════════════════════════════════════════════════════════

// Add role column to users (admin/client)
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'client'`);
} catch (e) { /* Column exists */ }

try {
  db.exec(`ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`);
} catch (e) { /* Column exists */ }

try {
  db.exec(`ALTER TABLE users ADD COLUMN last_active_at TEXT`);
} catch (e) { /* Column exists */ }

// ── Ads Management ──
db.exec(`
  CREATE TABLE IF NOT EXISTS ads (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL DEFAULT 'banner',
    placement       TEXT NOT NULL DEFAULT 'reading',
    content_url     TEXT,
    image_url       TEXT,
    link_url        TEXT,
    cta_text        TEXT DEFAULT 'Learn More',
    status          TEXT NOT NULL DEFAULT 'active',
    priority        INTEGER NOT NULL DEFAULT 0,
    start_date      TEXT,
    end_date        TEXT,
    target_books    TEXT,
    impressions     INTEGER NOT NULL DEFAULT 0,
    clicks          INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ad_impressions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_id           INTEGER NOT NULL,
    user_id         INTEGER,
    book_id         TEXT,
    chapter_id      INTEGER,
    placement       TEXT,
    device_type     TEXT,
    ip_address      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ad_clicks (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_id           INTEGER NOT NULL,
    user_id         INTEGER,
    book_id         TEXT,
    ip_address      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
  CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad ON ad_impressions(ad_id);
  CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad ON ad_clicks(ad_id);
`);

// ── Internal/Private Ebooks (Admin Only) ──
db.exec(`
  CREATE TABLE IF NOT EXISTS internal_ebooks (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    subtitle        TEXT,
    description     TEXT,
    content         TEXT,
    category        TEXT NOT NULL DEFAULT 'draft',
    status          TEXT NOT NULL DEFAULT 'draft',
    linked_book_id  TEXT,
    cover_image     TEXT,
    notes           TEXT,
    tags            TEXT,
    version         INTEGER NOT NULL DEFAULT 1,
    ai_generated    INTEGER NOT NULL DEFAULT 0,
    ai_model        TEXT,
    ai_prompt       TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (linked_book_id) REFERENCES books(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS internal_ebook_chapters (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ebook_id        INTEGER NOT NULL,
    chapter_number  INTEGER NOT NULL,
    title           TEXT NOT NULL,
    content         TEXT,
    notes           TEXT,
    status          TEXT NOT NULL DEFAULT 'draft',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ebook_id) REFERENCES internal_ebooks(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_internal_ebooks_category ON internal_ebooks(category);
  CREATE INDEX IF NOT EXISTS idx_internal_ebooks_linked ON internal_ebooks(linked_book_id);
`);

// ── Client Messages & Ideas ──
db.exec(`
  CREATE TABLE IF NOT EXISTS client_messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    type            TEXT NOT NULL DEFAULT 'general',
    subject         TEXT NOT NULL,
    message         TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'unread',
    admin_reply     TEXT,
    replied_at      TEXT,
    priority        TEXT NOT NULL DEFAULT 'normal',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS book_ideas (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    category        TEXT,
    theme           TEXT,
    target_audience TEXT,
    additional_notes TEXT,
    status          TEXT NOT NULL DEFAULT 'pending',
    admin_notes     TEXT,
    priority        INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_user ON client_messages(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_status ON client_messages(status);
  CREATE INDEX IF NOT EXISTS idx_messages_type ON client_messages(type);
  CREATE INDEX IF NOT EXISTS idx_ideas_user ON book_ideas(user_id);
  CREATE INDEX IF NOT EXISTS idx_ideas_status ON book_ideas(status);
`);

// ── User Activity Tracking ──
db.exec(`
  CREATE TABLE IF NOT EXISTS user_activity (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    activity_type   TEXT NOT NULL,
    book_id         TEXT,
    chapter_id      INTEGER,
    duration_seconds INTEGER,
    metadata        TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reading_sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    book_id         TEXT NOT NULL,
    chapter_id      INTEGER,
    started_at      TEXT NOT NULL DEFAULT (datetime('now')),
    ended_at        TEXT,
    duration_seconds INTEGER,
    pages_read      INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity(user_id);
  CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity(activity_type);
  CREATE INDEX IF NOT EXISTS idx_activity_date ON user_activity(created_at);
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON reading_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_book ON reading_sessions(book_id);
`);

// ── AI Generation History ──
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_generations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    type            TEXT NOT NULL DEFAULT 'ebook',
    prompt          TEXT NOT NULL,
    model           TEXT NOT NULL DEFAULT 'gemini',
    result          TEXT,
    status          TEXT NOT NULL DEFAULT 'pending',
    tokens_used     INTEGER,
    internal_ebook_id INTEGER,
    error_message   TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at    TEXT,
    FOREIGN KEY (internal_ebook_id) REFERENCES internal_ebooks(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_ai_gen_status ON ai_generations(status);
  CREATE INDEX IF NOT EXISTS idx_ai_gen_type ON ai_generations(type);
`);

// ── Platform Analytics ──
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_analytics (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    date            TEXT NOT NULL UNIQUE,
    total_users     INTEGER NOT NULL DEFAULT 0,
    new_users       INTEGER NOT NULL DEFAULT 0,
    active_users    INTEGER NOT NULL DEFAULT 0,
    total_sessions  INTEGER NOT NULL DEFAULT 0,
    total_reads     INTEGER NOT NULL DEFAULT 0,
    ad_impressions  INTEGER NOT NULL DEFAULT 0,
    ad_clicks       INTEGER NOT NULL DEFAULT 0,
    messages_received INTEGER NOT NULL DEFAULT 0,
    ideas_submitted INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_analytics_date ON daily_analytics(date);
`);

// ── Safe column migrations ──
const safeAddColumn = (sql) => {
  try {
    db.exec(sql);
  } catch {
    // Column likely already exists
  }
};

safeAddColumn(`ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;`);
safeAddColumn(`ALTER TABLE users ADD COLUMN email_verification_token TEXT;`);
safeAddColumn(`ALTER TABLE users ADD COLUMN email_verification_expires TEXT;`);
safeAddColumn(`ALTER TABLE users ADD COLUMN password_reset_token TEXT;`);
safeAddColumn(`ALTER TABLE users ADD COLUMN password_reset_expires TEXT;`);
safeAddColumn(`ALTER TABLE users ADD COLUMN google_id TEXT;`);
safeAddColumn(`ALTER TABLE users ADD COLUMN refresh_token TEXT;`);
safeAddColumn(`ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en';`);

export default db;
