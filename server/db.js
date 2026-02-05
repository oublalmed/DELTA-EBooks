import mysql from 'mysql2/promise';

// ── MySQL Connection Pool ──────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'delta_ebooks',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // Return dates as strings (matches existing app behavior)
});

// ── Helper wrapper (mirrors better-sqlite3 API but async) ──────
const db = {
  /**
   * Get a single row. Returns the row object or null.
   */
  async get(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows[0] || null;
  },

  /**
   * Get all matching rows. Returns an array.
   */
  async all(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  /**
   * Run an INSERT/UPDATE/DELETE. Returns { insertId, affectedRows }.
   */
  async run(sql, params = []) {
    const [result] = await pool.execute(sql, params);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
  },

  /**
   * Execute raw SQL (for schema creation). Splits on semicolons.
   */
  async exec(sql) {
    const connection = await pool.getConnection();
    try {
      const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
      for (const stmt of statements) {
        await connection.query(stmt);
      }
    } finally {
      connection.release();
    }
  },

  /**
   * Expose the pool for advanced usage (transactions, etc.)
   */
  pool,
};

// ── Schema Initialization ──────────────────────────────────────
async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    // Enable foreign keys
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // ── Core Tables ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL DEFAULT '',
        name          VARCHAR(255) NOT NULL DEFAULT '',
        role          VARCHAR(50) NOT NULL DEFAULT 'client',
        status        VARCHAR(50) NOT NULL DEFAULT 'active',
        last_active_at DATETIME NULL,
        premium_until DATETIME NULL,
        trial_used    TINYINT(1) DEFAULT 0,
        email_verified TINYINT(1) NOT NULL DEFAULT 0,
        email_verification_token VARCHAR(255) NULL,
        email_verification_expires DATETIME NULL,
        password_reset_token VARCHAR(255) NULL,
        password_reset_expires DATETIME NULL,
        google_id     VARCHAR(255) NULL,
        refresh_token TEXT NULL,
        language      VARCHAR(10) DEFAULT 'en',
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS books (
        id            VARCHAR(100) PRIMARY KEY,
        title         VARCHAR(500) NOT NULL,
        subtitle      TEXT,
        author        VARCHAR(255) NOT NULL,
        description   TEXT,
        price         DOUBLE NOT NULL DEFAULT 9.99,
        currency      VARCHAR(10) NOT NULL DEFAULT 'USD',
        cover_image   TEXT,
        accent_color  VARCHAR(50),
        total_chapters INT NOT NULL DEFAULT 0,
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS chapters (
        id            INT NOT NULL,
        book_id       VARCHAR(100) NOT NULL,
        title         VARCHAR(500) NOT NULL,
        subtitle      TEXT,
        summary       TEXT,
        content       LONGTEXT NOT NULL,
        reflection_prompt TEXT,
        image         TEXT,
        sort_order    INT NOT NULL DEFAULT 0,
        PRIMARY KEY (book_id, id),
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL,
        book_id         VARCHAR(100) NOT NULL,
        paypal_order_id VARCHAR(255),
        stripe_payment_intent_id VARCHAR(255),
        amount          DOUBLE NOT NULL,
        currency        VARCHAR(10) NOT NULL DEFAULT 'USD',
        status          VARCHAR(50) NOT NULL DEFAULT 'completed',
        purchased_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        UNIQUE KEY uq_user_book (user_id, book_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_logs (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT,
        book_id         VARCHAR(100),
        paypal_order_id VARCHAR(255),
        event_type      VARCHAR(100) NOT NULL,
        amount          DOUBLE,
        currency        VARCHAR(10),
        status          VARCHAR(50) NOT NULL,
        raw_data        TEXT,
        ip_address      VARCHAR(50),
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS download_tokens (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        book_id     VARCHAR(100) NOT NULL,
        token       VARCHAR(255) UNIQUE NOT NULL,
        expires_at  DATETIME NOT NULL,
        used        TINYINT(1) NOT NULL DEFAULT 0,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS download_history (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        book_id     VARCHAR(100) NOT NULL,
        ip_address  VARCHAR(50),
        downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id     INT NOT NULL,
        book_id     VARCHAR(100) NOT NULL,
        chapter_id  INT NOT NULL,
        completed   TINYINT(1) NOT NULL DEFAULT 0,
        reflection  TEXT,
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, book_id, chapter_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_subscribers (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        email       VARCHAR(255) UNIQUE NOT NULL,
        source      VARCHAR(50) DEFAULT 'website',
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS expression_entries (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        text        TEXT NOT NULL,
        category    VARCHAR(100) NOT NULL,
        mood        VARCHAR(50),
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS journey_entries (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        date        VARCHAR(20) NOT NULL,
        emotion     VARCHAR(100) NOT NULL,
        milestone   TEXT,
        challenge   TEXT,
        reflection  TEXT,
        rating      INT NOT NULL,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_date (user_id, date),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── Enhanced Journal Entries ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        book_id     VARCHAR(100),
        date        VARCHAR(20) NOT NULL,
        title       VARCHAR(500) NOT NULL,
        category    VARCHAR(50) NOT NULL DEFAULT 'general',
        content     TEXT NOT NULL,
        mood        VARCHAR(50),
        mood_rating INT DEFAULT 3,
        tags        TEXT,
        image_url   TEXT,
        is_public   TINYINT(1) NOT NULL DEFAULT 0,
        likes_count INT NOT NULL DEFAULT 0,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS journal_likes (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        entry_id    INT NOT NULL,
        user_id     INT NOT NULL,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_entry_user (entry_id, user_id),
        FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS journal_comments (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        entry_id    INT NOT NULL,
        user_id     INT NOT NULL,
        content     TEXT NOT NULL,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── Premium Access System ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS premium_access (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL,
        access_type     VARCHAR(50) NOT NULL DEFAULT 'ad_reward',
        granted_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at      DATETIME NOT NULL,
        duration_days   INT NOT NULL DEFAULT 7,
        ad_network      VARCHAR(50) DEFAULT 'admob',
        ad_unit_id      VARCHAR(255),
        reward_amount   INT DEFAULT 1,
        device_id       VARCHAR(255),
        platform        VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS premium_access_logs (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL,
        action          VARCHAR(100) NOT NULL,
        access_type     VARCHAR(50),
        duration_days   INT,
        ip_address      VARCHAR(50),
        device_info     TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_trials (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL UNIQUE,
        trial_started   DATETIME DEFAULT CURRENT_TIMESTAMP,
        trial_ends      DATETIME NOT NULL,
        trial_used      TINYINT(1) NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS journal_access (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL UNIQUE,
        free_trial_started DATETIME DEFAULT CURRENT_TIMESTAMP,
        free_trial_ends DATETIME NOT NULL,
        access_until    DATETIME,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS chapter_unlocks (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL,
        book_id         VARCHAR(100) NOT NULL,
        chapter_id      INT NOT NULL,
        unlocked_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_book_chapter (user_id, book_id, chapter_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS pdf_download_progress (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL,
        book_id         VARCHAR(100) NOT NULL,
        ads_watched     INT NOT NULL DEFAULT 0,
        ads_required    INT NOT NULL DEFAULT 5,
        is_unlocked     TINYINT(1) NOT NULL DEFAULT 0,
        unlocked_at     DATETIME,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_book_pdf (user_id, book_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── Admin / Ads Tables ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        name            VARCHAR(255) NOT NULL,
        type            VARCHAR(50) NOT NULL DEFAULT 'banner',
        placement       VARCHAR(50) NOT NULL DEFAULT 'reading',
        content_url     TEXT,
        image_url       TEXT,
        link_url        TEXT,
        cta_text        VARCHAR(100) DEFAULT 'Learn More',
        status          VARCHAR(50) NOT NULL DEFAULT 'active',
        priority        INT NOT NULL DEFAULT 0,
        start_date      DATETIME,
        end_date        DATETIME,
        target_books    TEXT,
        impressions     INT NOT NULL DEFAULT 0,
        clicks          INT NOT NULL DEFAULT 0,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ad_impressions (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        ad_id           INT NOT NULL,
        user_id         INT,
        book_id         VARCHAR(100),
        chapter_id      INT,
        placement       VARCHAR(50),
        device_type     VARCHAR(50),
        ip_address      VARCHAR(50),
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ad_clicks (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        ad_id           INT NOT NULL,
        user_id         INT,
        book_id         VARCHAR(100),
        ip_address      VARCHAR(50),
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── Internal Ebooks ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS internal_ebooks (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        title           VARCHAR(500) NOT NULL,
        subtitle        TEXT,
        description     TEXT,
        content         LONGTEXT,
        category        VARCHAR(50) NOT NULL DEFAULT 'draft',
        status          VARCHAR(50) NOT NULL DEFAULT 'draft',
        linked_book_id  VARCHAR(100),
        cover_image     TEXT,
        notes           TEXT,
        tags            TEXT,
        version         INT NOT NULL DEFAULT 1,
        ai_generated    TINYINT(1) NOT NULL DEFAULT 0,
        ai_model        VARCHAR(100),
        ai_prompt       TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (linked_book_id) REFERENCES books(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS internal_ebook_chapters (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        ebook_id        INT NOT NULL,
        chapter_number  INT NOT NULL,
        title           VARCHAR(500) NOT NULL,
        content         LONGTEXT,
        notes           TEXT,
        status          VARCHAR(50) NOT NULL DEFAULT 'draft',
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ebook_id) REFERENCES internal_ebooks(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── Client Messages & Ideas ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS client_messages (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL,
        type            VARCHAR(50) NOT NULL DEFAULT 'general',
        subject         VARCHAR(500) NOT NULL,
        message         TEXT NOT NULL,
        status          VARCHAR(50) NOT NULL DEFAULT 'unread',
        admin_reply     TEXT,
        replied_at      DATETIME,
        priority        VARCHAR(50) NOT NULL DEFAULT 'normal',
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS book_ideas (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL,
        title           VARCHAR(500) NOT NULL,
        description     TEXT NOT NULL,
        category        VARCHAR(100),
        theme           VARCHAR(255),
        target_audience VARCHAR(255),
        additional_notes TEXT,
        status          VARCHAR(50) NOT NULL DEFAULT 'pending',
        admin_notes     TEXT,
        priority        INT NOT NULL DEFAULT 0,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── Activity Tracking ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL,
        activity_type   VARCHAR(100) NOT NULL,
        book_id         VARCHAR(100),
        chapter_id      INT,
        duration_seconds INT,
        metadata        TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reading_sessions (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL,
        book_id         VARCHAR(100) NOT NULL,
        chapter_id      INT,
        started_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at        DATETIME,
        duration_seconds INT,
        pages_read      INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── AI Generations ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ai_generations (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        type            VARCHAR(50) NOT NULL DEFAULT 'ebook',
        prompt          TEXT NOT NULL,
        model           VARCHAR(100) NOT NULL DEFAULT 'gemini',
        result          LONGTEXT,
        status          VARCHAR(50) NOT NULL DEFAULT 'pending',
        tokens_used     INT,
        internal_ebook_id INT,
        error_message   TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at    DATETIME,
        FOREIGN KEY (internal_ebook_id) REFERENCES internal_ebooks(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── Analytics ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS daily_analytics (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        date            VARCHAR(20) NOT NULL UNIQUE,
        total_users     INT NOT NULL DEFAULT 0,
        new_users       INT NOT NULL DEFAULT 0,
        active_users    INT NOT NULL DEFAULT 0,
        total_sessions  INT NOT NULL DEFAULT 0,
        total_reads     INT NOT NULL DEFAULT 0,
        ad_impressions  INT NOT NULL DEFAULT 0,
        ad_clicks       INT NOT NULL DEFAULT 0,
        messages_received INT NOT NULL DEFAULT 0,
        ideas_submitted INT NOT NULL DEFAULT 0,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── Indexes ──
    const indexes = [
      'CREATE INDEX idx_purchases_user ON purchases(user_id)',
      'CREATE INDEX idx_purchases_book ON purchases(book_id)',
      'CREATE INDEX idx_payment_logs_order ON payment_logs(paypal_order_id)',
      'CREATE INDEX idx_download_tokens_token ON download_tokens(token)',
      'CREATE INDEX idx_user_progress_user ON user_progress(user_id)',
      'CREATE INDEX idx_journal_entries_user ON journal_entries(user_id)',
      'CREATE INDEX idx_journal_entries_date ON journal_entries(date)',
      'CREATE INDEX idx_journal_entries_public ON journal_entries(is_public)',
      'CREATE INDEX idx_journal_entries_book ON journal_entries(book_id)',
      'CREATE INDEX idx_journal_likes_entry ON journal_likes(entry_id)',
      'CREATE INDEX idx_journal_comments_entry ON journal_comments(entry_id)',
      'CREATE INDEX idx_premium_access_user ON premium_access(user_id)',
      'CREATE INDEX idx_premium_access_expires ON premium_access(expires_at)',
      'CREATE INDEX idx_chapter_unlocks_user ON chapter_unlocks(user_id)',
      'CREATE INDEX idx_chapter_unlocks_book ON chapter_unlocks(book_id, chapter_id)',
      'CREATE INDEX idx_journal_access_user ON journal_access(user_id)',
      'CREATE INDEX idx_pdf_download_user ON pdf_download_progress(user_id)',
      'CREATE INDEX idx_pdf_download_book ON pdf_download_progress(book_id)',
      'CREATE INDEX idx_ads_status ON ads(status)',
      'CREATE INDEX idx_ad_impressions_ad ON ad_impressions(ad_id)',
      'CREATE INDEX idx_ad_clicks_ad ON ad_clicks(ad_id)',
      'CREATE INDEX idx_internal_ebooks_category ON internal_ebooks(category)',
      'CREATE INDEX idx_internal_ebooks_linked ON internal_ebooks(linked_book_id)',
      'CREATE INDEX idx_messages_user ON client_messages(user_id)',
      'CREATE INDEX idx_messages_status ON client_messages(status)',
      'CREATE INDEX idx_messages_type ON client_messages(type)',
      'CREATE INDEX idx_ideas_user ON book_ideas(user_id)',
      'CREATE INDEX idx_ideas_status ON book_ideas(status)',
      'CREATE INDEX idx_activity_user ON user_activity(user_id)',
      'CREATE INDEX idx_activity_type ON user_activity(activity_type)',
      'CREATE INDEX idx_activity_date ON user_activity(created_at)',
      'CREATE INDEX idx_sessions_user ON reading_sessions(user_id)',
      'CREATE INDEX idx_sessions_book ON reading_sessions(book_id)',
      'CREATE INDEX idx_analytics_date ON daily_analytics(date)',
      'CREATE INDEX idx_ai_gen_status ON ai_generations(status)',
      'CREATE INDEX idx_ai_gen_type ON ai_generations(type)',
    ];

    for (const idx of indexes) {
      try {
        await connection.query(idx);
      } catch {
        // Index already exists, ignore
      }
    }

    console.log('[DB] MySQL schema initialized successfully');
  } finally {
    connection.release();
  }
}

// Run initialization
await initializeDatabase();

export default db;
