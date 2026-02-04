import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const MYSQL_URL = process.env.MYSQL_URL;
const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'delta_ebooks';

const parsedUrl = MYSQL_URL ? new URL(MYSQL_URL) : null;

const pool = mysql.createPool({
  host: parsedUrl ? parsedUrl.hostname : MYSQL_HOST,
  user: parsedUrl ? decodeURIComponent(parsedUrl.username) : MYSQL_USER,
  password: parsedUrl ? decodeURIComponent(parsedUrl.password) : MYSQL_PASSWORD,
  database: parsedUrl ? parsedUrl.pathname.replace('/', '') : MYSQL_DATABASE,
  port: parsedUrl && parsedUrl.port ? Number(parsedUrl.port) : undefined,
  connectionLimit: 10,
  waitForConnections: true,
  multipleStatements: true,
  dateStrings: true,
});

const exec = async (sql) => {
  await pool.query(sql);
};

const prepare = (sql) => ({
  get: async (...params) => {
    const [rows] = await pool.execute(sql, params);
    return rows?.[0] ?? null;
  },
  all: async (...params) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },
  run: async (...params) => {
    const [result] = await pool.execute(sql, params);
    return {
      lastInsertRowid: result.insertId,
      changes: result.affectedRows,
    };
  },
});

const columnExists = async (table, column) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?`,
    [table, column]
  );
  return rows[0]?.count > 0;
};

const safeAddColumn = async (table, column, definition) => {
  if (!(await columnExists(table, column))) {
    await pool.execute(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
};

const init = async () => {
  await exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name VARCHAR(255) NOT NULL DEFAULT '',
      premium_until DATETIME,
      trial_used TINYINT NOT NULL DEFAULT 0,
      role VARCHAR(20) NOT NULL DEFAULT 'client',
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      last_active_at DATETIME,
      email_verified TINYINT NOT NULL DEFAULT 0,
      email_verification_token VARCHAR(255),
      email_verification_expires DATETIME,
      password_reset_token VARCHAR(255),
      password_reset_expires DATETIME,
      google_id VARCHAR(255),
      refresh_token TEXT,
      language VARCHAR(10) DEFAULT 'en',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS books (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      author VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL DEFAULT 9.99,
      currency VARCHAR(10) NOT NULL DEFAULT 'USD',
      cover_image TEXT,
      accent_color VARCHAR(50),
      total_chapters INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id INT NOT NULL,
      book_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      summary TEXT,
      content LONGTEXT NOT NULL,
      reflection_prompt TEXT,
      image TEXT,
      sort_order INT NOT NULL DEFAULT 0,
      PRIMARY KEY (book_id, id),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      book_id VARCHAR(255) NOT NULL,
      paypal_order_id VARCHAR(255),
      stripe_payment_intent_id VARCHAR(255),
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'USD',
      status VARCHAR(50) NOT NULL DEFAULT 'completed',
      purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, book_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payment_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      book_id VARCHAR(255),
      paypal_order_id VARCHAR(255),
      event_type VARCHAR(100) NOT NULL,
      amount DECIMAL(10, 2),
      currency VARCHAR(10),
      status VARCHAR(50) NOT NULL,
      raw_data LONGTEXT,
      ip_address VARCHAR(100),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS download_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      book_id VARCHAR(255) NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used TINYINT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS download_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      book_id VARCHAR(255) NOT NULL,
      ip_address VARCHAR(100),
      downloaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      user_id INT NOT NULL,
      book_id VARCHAR(255) NOT NULL,
      chapter_id INT NOT NULL,
      completed TINYINT NOT NULL DEFAULT 0,
      reflection TEXT,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, book_id, chapter_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS email_subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      source VARCHAR(50) DEFAULT 'website',
      subscribed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expression_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      text TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      mood VARCHAR(50),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS journey_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date VARCHAR(20) NOT NULL,
      emotion VARCHAR(50) NOT NULL,
      milestone TEXT,
      challenge TEXT,
      reflection TEXT,
      rating INT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'general',
      content LONGTEXT NOT NULL,
      mood VARCHAR(50),
      mood_rating INT DEFAULT 3,
      tags TEXT,
      image_url TEXT,
      is_public TINYINT NOT NULL DEFAULT 0,
      likes_count INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS journal_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      entry_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entry_id, user_id),
      FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS journal_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      entry_id INT NOT NULL,
      user_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS premium_access (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      access_type VARCHAR(50) NOT NULL DEFAULT 'ad_reward',
      granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      duration_days INT NOT NULL DEFAULT 7,
      ad_network VARCHAR(50) DEFAULT 'admob',
      ad_unit_id VARCHAR(255),
      reward_amount INT DEFAULT 1,
      device_id VARCHAR(255),
      platform VARCHAR(50),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS premium_access_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      action VARCHAR(100) NOT NULL,
      access_type VARCHAR(50),
      duration_days INT,
      ip_address VARCHAR(100),
      device_info TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_trials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      trial_started DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      trial_ends DATETIME NOT NULL,
      trial_used TINYINT NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS journal_access (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      free_trial_started DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      free_trial_ends DATETIME NOT NULL,
      access_until DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chapter_unlocks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      book_id VARCHAR(255) NOT NULL,
      chapter_id INT NOT NULL,
      unlocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, book_id, chapter_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pdf_download_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      book_id VARCHAR(255) NOT NULL,
      ads_watched INT NOT NULL DEFAULT 0,
      ads_required INT NOT NULL DEFAULT 5,
      is_unlocked TINYINT NOT NULL DEFAULT 0,
      unlocked_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, book_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'banner',
      placement VARCHAR(100) NOT NULL DEFAULT 'reading',
      content_url TEXT,
      image_url TEXT,
      link_url TEXT,
      cta_text VARCHAR(100) DEFAULT 'Learn More',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      priority INT NOT NULL DEFAULT 0,
      start_date DATETIME,
      end_date DATETIME,
      target_books TEXT,
      impressions INT NOT NULL DEFAULT 0,
      clicks INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ad_impressions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad_id INT NOT NULL,
      user_id INT,
      book_id VARCHAR(255),
      chapter_id INT,
      placement VARCHAR(100),
      device_type VARCHAR(50),
      ip_address VARCHAR(100),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ad_clicks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad_id INT NOT NULL,
      user_id INT,
      book_id VARCHAR(255),
      ip_address VARCHAR(100),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS internal_ebooks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      description TEXT,
      content LONGTEXT,
      category VARCHAR(50) NOT NULL DEFAULT 'draft',
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      linked_book_id VARCHAR(255),
      cover_image TEXT,
      notes TEXT,
      tags TEXT,
      version INT NOT NULL DEFAULT 1,
      ai_generated TINYINT NOT NULL DEFAULT 0,
      ai_model VARCHAR(50),
      ai_prompt TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (linked_book_id) REFERENCES books(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS internal_ebook_chapters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ebook_id INT NOT NULL,
      chapter_number INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT,
      notes TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ebook_id) REFERENCES internal_ebooks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS client_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'general',
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'unread',
      admin_reply TEXT,
      replied_at DATETIME,
      priority VARCHAR(50) NOT NULL DEFAULT 'normal',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS book_ideas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100),
      theme VARCHAR(100),
      target_audience VARCHAR(100),
      additional_notes TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      admin_notes TEXT,
      priority INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_activity (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      activity_type VARCHAR(100) NOT NULL,
      book_id VARCHAR(255),
      chapter_id INT,
      duration_seconds INT,
      metadata TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reading_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      book_id VARCHAR(255) NOT NULL,
      chapter_id INT,
      started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      duration_seconds INT,
      pages_read INT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_generations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(50) NOT NULL DEFAULT 'ebook',
      prompt TEXT NOT NULL,
      model VARCHAR(50) NOT NULL DEFAULT 'gemini',
      result LONGTEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      tokens_used INT,
      internal_ebook_id INT,
      error_message TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (internal_ebook_id) REFERENCES internal_ebooks(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS daily_analytics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(20) NOT NULL UNIQUE,
      total_users INT NOT NULL DEFAULT 0,
      new_users INT NOT NULL DEFAULT 0,
      active_users INT NOT NULL DEFAULT 0,
      total_sessions INT NOT NULL DEFAULT 0,
      total_reads INT NOT NULL DEFAULT 0,
      ad_impressions INT NOT NULL DEFAULT 0,
      ad_clicks INT NOT NULL DEFAULT 0,
      messages_received INT NOT NULL DEFAULT 0,
      ideas_submitted INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
    CREATE INDEX IF NOT EXISTS idx_purchases_book ON purchases(book_id);
    CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(paypal_order_id);
    CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_journal_entries_user ON journal_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
    CREATE INDEX IF NOT EXISTS idx_journal_entries_public ON journal_entries(is_public);
    CREATE INDEX IF NOT EXISTS idx_journal_likes_entry ON journal_likes(entry_id);
    CREATE INDEX IF NOT EXISTS idx_journal_comments_entry ON journal_comments(entry_id);
    CREATE INDEX IF NOT EXISTS idx_premium_access_user ON premium_access(user_id);
    CREATE INDEX IF NOT EXISTS idx_premium_access_expires ON premium_access(expires_at);
    CREATE INDEX IF NOT EXISTS idx_chapter_unlocks_user ON chapter_unlocks(user_id);
    CREATE INDEX IF NOT EXISTS idx_chapter_unlocks_book ON chapter_unlocks(book_id, chapter_id);
    CREATE INDEX IF NOT EXISTS idx_journal_access_user ON journal_access(user_id);
    CREATE INDEX IF NOT EXISTS idx_pdf_download_user ON pdf_download_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_pdf_download_book ON pdf_download_progress(book_id);
    CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
    CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad ON ad_impressions(ad_id);
    CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad ON ad_clicks(ad_id);
    CREATE INDEX IF NOT EXISTS idx_internal_ebooks_category ON internal_ebooks(category);
    CREATE INDEX IF NOT EXISTS idx_internal_ebooks_linked ON internal_ebooks(linked_book_id);
    CREATE INDEX IF NOT EXISTS idx_messages_user ON client_messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_status ON client_messages(status);
    CREATE INDEX IF NOT EXISTS idx_messages_type ON client_messages(type);
    CREATE INDEX IF NOT EXISTS idx_ideas_user ON book_ideas(user_id);
    CREATE INDEX IF NOT EXISTS idx_ideas_status ON book_ideas(status);
    CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity(activity_type);
    CREATE INDEX IF NOT EXISTS idx_activity_date ON user_activity(created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON reading_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_book ON reading_sessions(book_id);
    CREATE INDEX IF NOT EXISTS idx_ai_gen_status ON ai_generations(status);
    CREATE INDEX IF NOT EXISTS idx_ai_gen_type ON ai_generations(type);
    CREATE INDEX IF NOT EXISTS idx_analytics_date ON daily_analytics(date);
  `);

  await safeAddColumn('users', 'premium_until', 'premium_until DATETIME');
  await safeAddColumn('users', 'trial_used', 'trial_used TINYINT NOT NULL DEFAULT 0');
  await safeAddColumn('users', 'role', "role VARCHAR(20) NOT NULL DEFAULT 'client'");
  await safeAddColumn('users', 'status', "status VARCHAR(20) NOT NULL DEFAULT 'active'");
  await safeAddColumn('users', 'last_active_at', 'last_active_at DATETIME');
  await safeAddColumn('users', 'email_verified', 'email_verified TINYINT NOT NULL DEFAULT 0');
  await safeAddColumn('users', 'email_verification_token', 'email_verification_token VARCHAR(255)');
  await safeAddColumn('users', 'email_verification_expires', 'email_verification_expires DATETIME');
  await safeAddColumn('users', 'password_reset_token', 'password_reset_token VARCHAR(255)');
  await safeAddColumn('users', 'password_reset_expires', 'password_reset_expires DATETIME');
  await safeAddColumn('users', 'google_id', 'google_id VARCHAR(255)');
  await safeAddColumn('users', 'refresh_token', 'refresh_token TEXT');
  await safeAddColumn('users', 'language', "language VARCHAR(10) DEFAULT 'en'");
};

export default {
  prepare,
  exec,
  init,
  pool,
};
