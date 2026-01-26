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

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
  CREATE INDEX IF NOT EXISTS idx_purchases_book ON purchases(book_id);
  CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(paypal_order_id);
  CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
`);

export default db;
