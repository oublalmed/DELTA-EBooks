import { Router } from 'express';
import db from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

// ══════════════════════════════════════════════════════════════════
// ADMIN SETUP ROUTE (One-time, secure setup for first admin)
// This route is only available when no admin exists
// ══════════════════════════════════════════════════════════════════
router.post('/setup', requireAuth, async (req, res) => {
  try {
    // Check if an admin already exists
    const existingAdmin = await db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
    
    if (existingAdmin) {
      return res.status(403).json({ error: 'Admin already exists. Setup is disabled.' });
    }
    
    // Promote the current authenticated user to admin
    await db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', req.user.id);
    
    console.log(`[ADMIN SETUP] User ${req.user.id} (${req.user.email}) promoted to admin`);
    
    res.json({ 
      success: true, 
      message: 'You are now the platform admin',
      userId: req.user.id
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ error: 'Failed to setup admin' });
  }
});

// All other admin routes require admin authentication
router.use(requireAdmin);

// ══════════════════════════════════════════════════════════════════
// DASHBOARD OVERVIEW
// ══════════════════════════════════════════════════════════════════

router.get('/dashboard', async (req, res) => {
  try {
    // Get overview statistics
    const stats = {
      totalUsers: (await db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('client'))?.count || 0,
      activeUsers: (await db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ? AND last_active_at > DATE_SUB(NOW(), INTERVAL 7 DAY)').get('client'))?.count || 0,
      totalBooks: (await db.prepare('SELECT COUNT(*) as count FROM books').get())?.count || 0,
      internalEbooks: (await db.prepare('SELECT COUNT(*) as count FROM internal_ebooks').get())?.count || 0,
      totalAds: (await db.prepare('SELECT COUNT(*) as count FROM ads').get())?.count || 0,
      activeAds: (await db.prepare('SELECT COUNT(*) as count FROM ads WHERE status = ?').get('active'))?.count || 0,
      unreadMessages: (await db.prepare('SELECT COUNT(*) as count FROM client_messages WHERE status = ?').get('unread'))?.count || 0,
      pendingIdeas: (await db.prepare('SELECT COUNT(*) as count FROM book_ideas WHERE status = ?').get('pending'))?.count || 0,
      totalImpressions: (await db.prepare('SELECT SUM(impressions) as total FROM ads').get())?.total || 0,
      totalClicks: (await db.prepare('SELECT SUM(clicks) as total FROM ads').get())?.total || 0,
    };

    // Recent activity
    const recentUsers = await db.prepare(`
      SELECT id, email, name, created_at, last_active_at
      FROM users WHERE role = 'client'
      ORDER BY created_at DESC LIMIT 5
    `).all();

    const recentMessages = await db.prepare(`
      SELECT cm.*, u.email, u.name as user_name
      FROM client_messages cm
      JOIN users u ON cm.user_id = u.id
      ORDER BY cm.created_at DESC LIMIT 5
    `).all();

    const recentIdeas = await db.prepare(`
      SELECT bi.*, u.email, u.name as user_name
      FROM book_ideas bi
      JOIN users u ON bi.user_id = u.id
      ORDER BY bi.created_at DESC LIMIT 5
    `).all();

    res.json({
      stats,
      recentUsers,
      recentMessages,
      recentIdeas
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// ══════════════════════════════════════════════════════════════════
// ADS MANAGEMENT
// ══════════════════════════════════════════════════════════════════

// Get all ads
router.get('/ads', async (req, res) => {
  try {
    const { status, type, placement } = req.query;
    
    let query = 'SELECT * FROM ads WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (placement) {
      query += ' AND placement = ?';
      params.push(placement);
    }
    
    query += ' ORDER BY priority DESC, created_at DESC';
    
    const ads = await db.prepare(query).all(...params);
    res.json(ads);
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// Get single ad with stats
router.get('/ads/:id', async (req, res) => {
  try {
    const ad = await db.prepare('SELECT * FROM ads WHERE id = ?').get(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Get daily stats for last 30 days
    const impressionStats = await db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM ad_impressions
      WHERE ad_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all(req.params.id);

    const clickStats = await db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM ad_clicks
      WHERE ad_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all(req.params.id);

    res.json({ ...ad, impressionStats, clickStats });
  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json({ error: 'Failed to fetch ad' });
  }
});

// Create ad
router.post('/ads', async (req, res) => {
  try {
    const { name, type, placement, content_url, image_url, link_url, cta_text, status, priority, start_date, end_date, target_books } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Ad name is required' });
    }

    const result = await db.prepare(`
      INSERT INTO ads (name, type, placement, content_url, image_url, link_url, cta_text, status, priority, start_date, end_date, target_books)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      type || 'banner',
      placement || 'reading',
      content_url || null,
      image_url || null,
      link_url || null,
      cta_text || 'Learn More',
      status || 'active',
      priority || 0,
      start_date || null,
      end_date || null,
      target_books ? JSON.stringify(target_books) : null
    );

    const ad = await db.prepare('SELECT * FROM ads WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(ad);
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ error: 'Failed to create ad' });
  }
});

// Update ad
router.put('/ads/:id', async (req, res) => {
  try {
    const { name, type, placement, content_url, image_url, link_url, cta_text, status, priority, start_date, end_date, target_books } = req.body;

    await db.prepare(`
      UPDATE ads SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        placement = COALESCE(?, placement),
        content_url = ?,
        image_url = ?,
        link_url = ?,
        cta_text = COALESCE(?, cta_text),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        start_date = ?,
        end_date = ?,
        target_books = ?,
        updated_at = NOW()
      WHERE id = ?
    `).run(
      name, type, placement, content_url, image_url, link_url, cta_text, status, priority,
      start_date, end_date, target_books ? JSON.stringify(target_books) : null, req.params.id
    );

    const ad = await db.prepare('SELECT * FROM ads WHERE id = ?').get(req.params.id);
    res.json(ad);
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ error: 'Failed to update ad' });
  }
});

// Delete ad
router.delete('/ads/:id', async (req, res) => {
  try {
    await db.prepare('DELETE FROM ads WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

// Toggle ad status (quick action)
router.post('/ads/:id/toggle', async (req, res) => {
  try {
    const ad = await db.prepare('SELECT status FROM ads WHERE id = ?').get(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    await db.prepare('UPDATE ads SET status = ?, updated_at = NOW() WHERE id = ?').run(newStatus, req.params.id);

    res.json({ id: req.params.id, status: newStatus });
  } catch (error) {
    console.error('Toggle ad error:', error);
    res.status(500).json({ error: 'Failed to toggle ad status' });
  }
});

// ══════════════════════════════════════════════════════════════════
// CLIENT MANAGEMENT
// ══════════════════════════════════════════════════════════════════

// Get all clients
router.get('/clients', async (req, res) => {
  try {
    const { status, search, sort, order } = req.query;
    
    let query = `
      SELECT u.*, 
        (SELECT COUNT(*) FROM user_progress WHERE user_id = u.id AND completed = 1) as chapters_read,
        (SELECT COUNT(*) FROM reading_sessions WHERE user_id = u.id) as total_sessions,
        (SELECT SUM(duration_seconds) FROM reading_sessions WHERE user_id = u.id) as total_reading_time
      FROM users u
      WHERE u.role = 'client'
    `;
    const params = [];

    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (u.email LIKE ? OR u.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const sortCol = ['created_at', 'last_active_at', 'email', 'name'].includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY u.${sortCol} ${sortOrder}`;

    const clients = await db.prepare(query).all(...params);
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client with full activity
router.get('/clients/:id', async (req, res) => {
  try {
    const client = await db.prepare(`
      SELECT * FROM users WHERE id = ? AND role = 'client'
    `).get(req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Reading progress
    const readingProgress = await db.prepare(`
      SELECT up.*, b.title as book_title
      FROM user_progress up
      JOIN books b ON up.book_id = b.id
      WHERE up.user_id = ?
      ORDER BY up.updated_at DESC
    `).all(req.params.id);

    // Reading sessions
    const sessions = await db.prepare(`
      SELECT rs.*, b.title as book_title
      FROM reading_sessions rs
      JOIN books b ON rs.book_id = b.id
      WHERE rs.user_id = ?
      ORDER BY rs.started_at DESC
      LIMIT 50
    `).all(req.params.id);

    // Activity log
    const activity = await db.prepare(`
      SELECT * FROM user_activity
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(req.params.id);

    // Messages from this client
    const messages = await db.prepare(`
      SELECT * FROM client_messages
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.params.id);

    // Ideas from this client
    const ideas = await db.prepare(`
      SELECT * FROM book_ideas
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.params.id);

    // Remove sensitive data
    delete client.password_hash;

    res.json({
      ...client,
      readingProgress,
      sessions,
      activity,
      messages,
      ideas
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to fetch client data' });
  }
});

// Update client status (suspend, activate, restrict)
router.put('/clients/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended', 'restricted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.prepare('UPDATE users SET status = ?, updated_at = NOW() WHERE id = ? AND role = ?')
      .run(status, req.params.id, 'client');

    res.json({ success: true, status });
  } catch (error) {
    console.error('Update client status error:', error);
    res.status(500).json({ error: 'Failed to update client status' });
  }
});

// ══════════════════════════════════════════════════════════════════
// EBOOK MANAGEMENT (Public Books)
// ══════════════════════════════════════════════════════════════════

// Get all public books with stats
router.get('/ebooks', async (req, res) => {
  try {
    const books = await db.prepare(`
      SELECT b.*,
        (SELECT COUNT(*) FROM user_progress WHERE book_id = b.id AND completed = 1) as total_reads,
        (SELECT COUNT(DISTINCT user_id) FROM user_progress WHERE book_id = b.id) as unique_readers,
        (SELECT COUNT(*) FROM reading_sessions WHERE book_id = b.id) as total_sessions
      FROM books b
      ORDER BY b.created_at DESC
    `).all();

    res.json(books);
  } catch (error) {
    console.error('Get ebooks error:', error);
    res.status(500).json({ error: 'Failed to fetch ebooks' });
  }
});

// ══════════════════════════════════════════════════════════════════
// INTERNAL EBOOKS (Admin-Only Private Ebooks)
// ══════════════════════════════════════════════════════════════════

// Get all internal ebooks
router.get('/internal-ebooks', async (req, res) => {
  try {
    const { category, status, linked } = req.query;
    
    let query = `
      SELECT ie.*, b.title as linked_book_title
      FROM internal_ebooks ie
      LEFT JOIN books b ON ie.linked_book_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND ie.category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND ie.status = ?';
      params.push(status);
    }
    if (linked === 'true') {
      query += ' AND ie.linked_book_id IS NOT NULL';
    } else if (linked === 'false') {
      query += ' AND ie.linked_book_id IS NULL';
    }

    query += ' ORDER BY ie.updated_at DESC';

    const ebooks = await db.prepare(query).all(...params);
    res.json(ebooks);
  } catch (error) {
    console.error('Get internal ebooks error:', error);
    res.status(500).json({ error: 'Failed to fetch internal ebooks' });
  }
});

// Get single internal ebook with chapters
router.get('/internal-ebooks/:id', async (req, res) => {
  try {
    const ebook = await db.prepare(`
      SELECT ie.*, b.title as linked_book_title
      FROM internal_ebooks ie
      LEFT JOIN books b ON ie.linked_book_id = b.id
      WHERE ie.id = ?
    `).get(req.params.id);

    if (!ebook) {
      return res.status(404).json({ error: 'Internal ebook not found' });
    }

    const chapters = await db.prepare(`
      SELECT * FROM internal_ebook_chapters
      WHERE ebook_id = ?
      ORDER BY chapter_number
    `).all(req.params.id);

    res.json({ ...ebook, chapters });
  } catch (error) {
    console.error('Get internal ebook error:', error);
    res.status(500).json({ error: 'Failed to fetch internal ebook' });
  }
});

// Create internal ebook
router.post('/internal-ebooks', async (req, res) => {
  try {
    const { title, subtitle, description, content, category, status, linked_book_id, cover_image, notes, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await db.prepare(`
      INSERT INTO internal_ebooks (title, subtitle, description, content, category, status, linked_book_id, cover_image, notes, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, subtitle || null, description || null, content || null,
      category || 'draft', status || 'draft', linked_book_id || null,
      cover_image || null, notes || null, tags ? JSON.stringify(tags) : null
    );

    const ebook = await db.prepare('SELECT * FROM internal_ebooks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(ebook);
  } catch (error) {
    console.error('Create internal ebook error:', error);
    res.status(500).json({ error: 'Failed to create internal ebook' });
  }
});

// Update internal ebook
router.put('/internal-ebooks/:id', async (req, res) => {
  try {
    const { title, subtitle, description, content, category, status, linked_book_id, cover_image, notes, tags } = req.body;

    await db.prepare(`
      UPDATE internal_ebooks SET
        title = COALESCE(?, title),
        subtitle = ?,
        description = ?,
        content = ?,
        category = COALESCE(?, category),
        status = COALESCE(?, status),
        linked_book_id = ?,
        cover_image = ?,
        notes = ?,
        tags = ?,
        version = version + 1,
        updated_at = NOW()
      WHERE id = ?
    `).run(
      title, subtitle, description, content, category, status, linked_book_id,
      cover_image, notes, tags ? JSON.stringify(tags) : null, req.params.id
    );

    const ebook = await db.prepare('SELECT * FROM internal_ebooks WHERE id = ?').get(req.params.id);
    res.json(ebook);
  } catch (error) {
    console.error('Update internal ebook error:', error);
    res.status(500).json({ error: 'Failed to update internal ebook' });
  }
});

// Delete internal ebook
router.delete('/internal-ebooks/:id', async (req, res) => {
  try {
    await db.prepare('DELETE FROM internal_ebooks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete internal ebook error:', error);
    res.status(500).json({ error: 'Failed to delete internal ebook' });
  }
});

// Add chapter to internal ebook
router.post('/internal-ebooks/:id/chapters', async (req, res) => {
  try {
    const { chapter_number, title, content, notes, status } = req.body;

    const result = await db.prepare(`
      INSERT INTO internal_ebook_chapters (ebook_id, chapter_number, title, content, notes, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.params.id, chapter_number || 1, title || 'New Chapter', content || '', notes || null, status || 'draft');

    const chapter = await db.prepare('SELECT * FROM internal_ebook_chapters WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(chapter);
  } catch (error) {
    console.error('Add chapter error:', error);
    res.status(500).json({ error: 'Failed to add chapter' });
  }
});

// ══════════════════════════════════════════════════════════════════
// MESSAGES & IDEAS MANAGEMENT
// ══════════════════════════════════════════════════════════════════

// Get all messages
router.get('/messages', async (req, res) => {
  try {
    const { status, type, priority } = req.query;

    let query = `
      SELECT cm.*, u.email, u.name as user_name
      FROM client_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND cm.status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND cm.type = ?';
      params.push(type);
    }
    if (priority) {
      query += ' AND cm.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY cm.created_at DESC';

    const messages = await db.prepare(query).all(...params);
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get single message
router.get('/messages/:id', async (req, res) => {
  try {
    const message = await db.prepare(`
      SELECT cm.*, u.email, u.name as user_name
      FROM client_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.id = ?
    `).get(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Mark as read
    if (message.status === 'unread') {
      await db.prepare('UPDATE client_messages SET status = ? WHERE id = ?').run('read', req.params.id);
      message.status = 'read';
    }

    res.json(message);
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

// Reply to message
router.post('/messages/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ error: 'Reply is required' });
    }

    await db.prepare(`
      UPDATE client_messages SET
        admin_reply = ?,
        replied_at = NOW(),
        status = 'replied',
        updated_at = NOW()
      WHERE id = ?
    `).run(reply, req.params.id);

    const message = await db.prepare('SELECT * FROM client_messages WHERE id = ?').get(req.params.id);
    res.json(message);
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({ error: 'Failed to reply to message' });
  }
});

// Update message status/priority
router.put('/messages/:id', async (req, res) => {
  try {
    const { status, priority } = req.body;

    await db.prepare(`
      UPDATE client_messages SET
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        updated_at = NOW()
      WHERE id = ?
    `).run(status, priority, req.params.id);

    const message = await db.prepare('SELECT * FROM client_messages WHERE id = ?').get(req.params.id);
    res.json(message);
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete message
router.delete('/messages/:id', async (req, res) => {
  try {
    await db.prepare('DELETE FROM client_messages WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Get all book ideas
router.get('/ideas', async (req, res) => {
  try {
    const { status, priority } = req.query;

    let query = `
      SELECT bi.*, u.email, u.name as user_name
      FROM book_ideas bi
      JOIN users u ON bi.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND bi.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND bi.priority >= ?';
      params.push(parseInt(priority));
    }

    query += ' ORDER BY bi.priority DESC, bi.created_at DESC';

    const ideas = await db.prepare(query).all(...params);
    res.json(ideas);
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

// Update idea status/priority/notes
router.put('/ideas/:id', async (req, res) => {
  try {
    const { status, priority, admin_notes } = req.body;

    await db.prepare(`
      UPDATE book_ideas SET
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        admin_notes = ?,
        updated_at = NOW()
      WHERE id = ?
    `).run(status, priority, admin_notes, req.params.id);

    const idea = await db.prepare('SELECT * FROM book_ideas WHERE id = ?').get(req.params.id);
    res.json(idea);
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

// Delete idea
router.delete('/ideas/:id', async (req, res) => {
  try {
    await db.prepare('DELETE FROM book_ideas WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete idea error:', error);
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

// ══════════════════════════════════════════════════════════════════
// AI GENERATION
// ══════════════════════════════════════════════════════════════════

// Get AI generation history
router.get('/ai-generations', async (req, res) => {
  try {
    const generations = await db.prepare(`
      SELECT ag.*, ie.title as ebook_title
      FROM ai_generations ag
      LEFT JOIN internal_ebooks ie ON ag.internal_ebook_id = ie.id
      ORDER BY ag.created_at DESC
      LIMIT 100
    `).all();

    res.json(generations);
  } catch (error) {
    console.error('Get AI generations error:', error);
    res.status(500).json({ error: 'Failed to fetch AI generations' });
  }
});

// ══════════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════════

router.get('/analytics', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysInt = Math.max(1, Number.parseInt(days, 10) || 30);

    // Daily user stats
    const userStats = await db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as new_users
      FROM users
      WHERE created_at > DATE_SUB(NOW(), INTERVAL ${daysInt} DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all();

    // Daily reading stats
    const readingStats = await db.prepare(`
      SELECT DATE(started_at) as date, 
        COUNT(*) as sessions,
        SUM(duration_seconds) as total_time
      FROM reading_sessions
      WHERE started_at > DATE_SUB(NOW(), INTERVAL ${daysInt} DAY)
      GROUP BY DATE(started_at)
      ORDER BY date
    `).all();

    // Ad performance
    const adStats = await db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as impressions
      FROM ad_impressions
      WHERE created_at > DATE_SUB(NOW(), INTERVAL ${daysInt} DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all();

    // Top books by reads
    const topBooks = await db.prepare(`
      SELECT b.id, b.title, COUNT(*) as reads
      FROM reading_sessions rs
      JOIN books b ON rs.book_id = b.id
      WHERE rs.started_at > DATE_SUB(NOW(), INTERVAL ${daysInt} DAY)
      GROUP BY b.id
      ORDER BY reads DESC
      LIMIT 10
    `).all();

    res.json({
      userStats,
      readingStats,
      adStats,
      topBooks
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
