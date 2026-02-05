/**
 * Enhanced Journal Routes
 *
 * CRUD operations for the expressive journal with:
 * - Title, category, content, mood, tags
 * - Image attachments
 * - Public/private visibility
 * - Likes and comments on public entries
 * - Calendar-based date entries
 */

import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();

// ══════════════════════════════════════════════════════════════════
// JOURNAL ENTRY CATEGORIES
// ══════════════════════════════════════════════════════════════════
const VALID_CATEGORIES = [
  'general',
  'feeling',
  'experience',
  'adventure',
  'success',
  'failure',
  'gratitude',
  'goal',
  'reflection',
  'dream',
  'learning'
];

const VALID_MOODS = [
  'happy',
  'peaceful',
  'grateful',
  'excited',
  'motivated',
  'neutral',
  'thoughtful',
  'sad',
  'stressed',
  'anxious',
  'confused',
  'angry'
];

// ══════════════════════════════════════════════════════════════════
// GET /api/journal - Get all journal entries for the user
// ══════════════════════════════════════════════════════════════════
router.get('/', requireAuth, async (req, res) => {
  try {
    const { month, year, category, mood, book_id } = req.query;

    let query = 'SELECT * FROM journal_entries WHERE user_id = ?';
    const params = [req.user.id];

    // Filter by book_id (per-book journal)
    if (book_id) {
      query += ' AND book_id = ?';
      params.push(book_id);
    }

    // Filter by month/year if provided
    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      query += ' AND date >= ? AND date <= ?';
      params.push(startDate, endDate);
    }

    // Filter by category
    if (category && VALID_CATEGORIES.includes(category)) {
      query += ' AND category = ?';
      params.push(category);
    }

    // Filter by mood
    if (mood && VALID_MOODS.includes(mood)) {
      query += ' AND mood = ?';
      params.push(mood);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const entries = await db.all(query, params);

    // Parse tags from JSON string
    const parsed = entries.map(e => ({
      ...e,
      tags: e.tags ? JSON.parse(e.tags) : [],
      is_public: Boolean(e.is_public)
    }));

    res.json(parsed);
  } catch (err) {
    console.error('Failed to get journal entries:', err);
    res.status(500).json({ error: 'Failed to retrieve journal entries.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// GET /api/journal/calendar/:year/:month - Get calendar data for a month
// ══════════════════════════════════════════════════════════════════
router.get('/calendar/:year/:month', requireAuth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const entries = await db.all(`
      SELECT date, mood, mood_rating, title, category
      FROM journal_entries
      WHERE user_id = ? AND date >= ? AND date <= ?
      ORDER BY date ASC
    `, [req.user.id, startDate, endDate]);

    // Group by date for calendar view
    const calendarData = {};
    entries.forEach(e => {
      if (!calendarData[e.date]) {
        calendarData[e.date] = [];
      }
      calendarData[e.date].push({
        mood: e.mood,
        mood_rating: e.mood_rating,
        title: e.title,
        category: e.category
      });
    });

    res.json(calendarData);
  } catch (err) {
    console.error('Failed to get calendar data:', err);
    res.status(500).json({ error: 'Failed to retrieve calendar data.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// GET /api/journal/analytics - Get mood analytics
// ══════════════════════════════════════════════════════════════════
router.get('/analytics', requireAuth, async (req, res) => {
  try {
    const { period } = req.query; // 'week', 'month', 'year'

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (period === 'month') {
      dateFilter = "AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    } else if (period === 'year') {
      dateFilter = "AND date >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
    }

    // Mood distribution
    const moodCounts = await db.all(`
      SELECT mood, COUNT(*) as count
      FROM journal_entries
      WHERE user_id = ? AND mood IS NOT NULL ${dateFilter}
      GROUP BY mood
    `, [req.user.id]);

    // Category distribution
    const categoryCounts = await db.all(`
      SELECT category, COUNT(*) as count
      FROM journal_entries
      WHERE user_id = ? ${dateFilter}
      GROUP BY category
    `, [req.user.id]);

    // Average mood rating over time
    const avgRating = await db.get(`
      SELECT AVG(mood_rating) as avg_rating
      FROM journal_entries
      WHERE user_id = ? AND mood_rating IS NOT NULL ${dateFilter}
    `, [req.user.id]);

    // Entry streak
    const streakData = await db.all(`
      SELECT date FROM journal_entries
      WHERE user_id = ?
      ORDER BY date DESC
    `, [req.user.id]);

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const dates = new Set(streakData.map(d => d.date));

    let checkDate = new Date();
    while (dates.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Total entries
    const totalEntries = await db.get(`
      SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?
    `, [req.user.id]);

    res.json({
      moodDistribution: moodCounts,
      categoryDistribution: categoryCounts,
      averageMoodRating: avgRating?.avg_rating || 0,
      currentStreak,
      totalEntries: totalEntries.count
    });
  } catch (err) {
    console.error('Failed to get analytics:', err);
    res.status(500).json({ error: 'Failed to retrieve analytics.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// JOURNAL EXPORT / DOWNLOAD
// (Must be registered BEFORE /:id to avoid path conflicts)
// ══════════════════════════════════════════════════════════════════

// GET /api/journal/export/all - Export all journal entries
router.get('/export/all', requireAuth, async (req, res) => {
  try {
    const { format = 'txt' } = req.query;

    const entries = await db.all(`
      SELECT je.*, b.title as book_title
      FROM journal_entries je
      LEFT JOIN books b ON je.book_id = b.id
      WHERE je.user_id = ?
      ORDER BY je.date DESC, je.created_at DESC
    `, [req.user.id]);

    if (entries.length === 0) {
      return res.status(404).json({ error: 'No journal entries found.' });
    }

    const parsed = entries.map(e => ({
      ...e,
      tags: e.tags ? JSON.parse(e.tags) : [],
    }));

    if (format === 'json') {
      return res.json({ entries: parsed });
    }

    if (format === 'md' || format === 'markdown') {
      let md = '# My Reading Journal\n\n';
      md += `*Exported on ${new Date().toLocaleString()}*\n\n`;
      md += `**Total entries:** ${parsed.length}\n\n---\n\n`;

      for (const entry of parsed) {
        md += `## ${entry.title}\n\n`;
        md += `**Date:** ${entry.date}`;
        if (entry.book_title) md += ` | **Book:** ${entry.book_title}`;
        if (entry.mood) md += ` | **Mood:** ${entry.mood}`;
        if (entry.category !== 'general') md += ` | **Category:** ${entry.category}`;
        md += '\n\n';
        md += `${entry.content}\n\n`;
        if (entry.tags.length > 0) {
          md += `*Tags: ${entry.tags.map(t => `#${t}`).join(' ')}*\n\n`;
        }
        md += '---\n\n';
      }

      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="my-journal.md"');
      return res.send(md);
    }

    if (format === 'pdf') {
      const { generateJournalPDF } = await import('../services/pdf.js');
      const pdfBuffer = await generateJournalPDF(parsed, 'My Reading Journal');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="my-journal.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    }

    // Default: TXT
    let txt = 'MY READING JOURNAL\n';
    txt += `Exported on ${new Date().toLocaleString()}\n`;
    txt += `Total entries: ${parsed.length}\n`;
    txt += '═'.repeat(60) + '\n\n';

    for (const entry of parsed) {
      txt += `${entry.title}\n`;
      txt += '-'.repeat(40) + '\n';
      txt += `Date: ${entry.date}`;
      if (entry.book_title) txt += ` | Book: ${entry.book_title}`;
      if (entry.mood) txt += ` | Mood: ${entry.mood}`;
      txt += '\n\n';
      txt += `${entry.content}\n\n`;
      if (entry.tags.length > 0) {
        txt += `Tags: ${entry.tags.map(t => `#${t}`).join(' ')}\n`;
      }
      txt += '─'.repeat(60) + '\n\n';
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="my-journal.txt"');
    res.send(txt);
  } catch (err) {
    console.error('Failed to export journal:', err);
    res.status(500).json({ error: 'Failed to export journal.' });
  }
});

// GET /api/journal/export/:bookId - Export journal entries for a specific book
router.get('/export/:bookId', requireAuth, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { format = 'txt' } = req.query;

    const book = await db.get('SELECT title FROM books WHERE id = ?', [bookId]);
    const bookTitle = book?.title || bookId;

    const entries = await db.all(`
      SELECT * FROM journal_entries
      WHERE user_id = ? AND book_id = ?
      ORDER BY date DESC, created_at DESC
    `, [req.user.id, bookId]);

    if (entries.length === 0) {
      return res.status(404).json({ error: 'No journal entries found for this book.' });
    }

    const parsed = entries.map(e => ({
      ...e,
      tags: e.tags ? JSON.parse(e.tags) : [],
    }));

    const safeTitle = bookTitle.replace(/[^a-zA-Z0-9]/g, '_');

    if (format === 'json') {
      return res.json({ bookId, bookTitle, entries: parsed });
    }

    if (format === 'md' || format === 'markdown') {
      let md = `# Journal: ${bookTitle}\n\n`;
      md += `*Exported on ${new Date().toLocaleString()}*\n\n`;
      md += `**Entries:** ${parsed.length}\n\n---\n\n`;

      for (const entry of parsed) {
        md += `## ${entry.title}\n\n`;
        md += `**Date:** ${entry.date}`;
        if (entry.mood) md += ` | **Mood:** ${entry.mood}`;
        md += '\n\n';
        md += `${entry.content}\n\n`;
        if (entry.tags.length > 0) {
          md += `*Tags: ${entry.tags.map(t => `#${t}`).join(' ')}*\n\n`;
        }
        md += '---\n\n';
      }

      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="journal-${safeTitle}.md"`);
      return res.send(md);
    }

    if (format === 'pdf') {
      const { generateJournalPDF } = await import('../services/pdf.js');
      const pdfBuffer = await generateJournalPDF(parsed, `Journal: ${bookTitle}`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="journal-${safeTitle}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    }

    // Default: TXT
    let txt = `JOURNAL: ${bookTitle.toUpperCase()}\n`;
    txt += `Exported on ${new Date().toLocaleString()}\n`;
    txt += `Entries: ${parsed.length}\n`;
    txt += '═'.repeat(60) + '\n\n';

    for (const entry of parsed) {
      txt += `${entry.title}\n`;
      txt += '-'.repeat(40) + '\n';
      txt += `Date: ${entry.date}`;
      if (entry.mood) txt += ` | Mood: ${entry.mood}`;
      txt += '\n\n';
      txt += `${entry.content}\n\n`;
      txt += '─'.repeat(60) + '\n\n';
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="journal-${safeTitle}.txt"`);
    res.send(txt);
  } catch (err) {
    console.error('Failed to export book journal:', err);
    res.status(500).json({ error: 'Failed to export journal entries.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// PUBLIC ENTRIES (Community Features)
// (Must be registered BEFORE /:id to avoid path conflicts)
// ══════════════════════════════════════════════════════════════════

// GET /api/journal/public/feed - Get public journal entries
router.get('/public/feed', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const entries = await db.all(`
      SELECT
        j.*,
        u.name as author_name,
        (SELECT COUNT(*) FROM journal_likes WHERE entry_id = j.id) as likes_count,
        (SELECT COUNT(*) FROM journal_comments WHERE entry_id = j.id) as comments_count
      FROM journal_entries j
      JOIN users u ON j.user_id = u.id
      WHERE j.is_public = 1
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

    const parsed = [];
    for (const e of entries) {
      let is_liked = false;
      if (req.user) {
        const likeRow = await db.get(
          'SELECT 1 FROM journal_likes WHERE entry_id = ? AND user_id = ?',
          [e.id, req.user.id]
        );
        is_liked = Boolean(likeRow);
      }
      parsed.push({
        ...e,
        tags: e.tags ? JSON.parse(e.tags) : [],
        is_public: true,
        is_liked
      });
    }

    res.json(parsed);
  } catch (err) {
    console.error('Failed to get public feed:', err);
    res.status(500).json({ error: 'Failed to retrieve public feed.' });
  }
});

// DELETE /api/journal/comments/:commentId - Delete own comment
router.delete('/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const result = await db.run(
      'DELETE FROM journal_comments WHERE id = ? AND user_id = ?',
      [req.params.commentId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found or not yours.' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete comment:', err);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// GET /api/journal/:id - Get a specific journal entry
// ══════════════════════════════════════════════════════════════════
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const entry = await db.get(`
      SELECT * FROM journal_entries WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    res.json({
      ...entry,
      tags: entry.tags ? JSON.parse(entry.tags) : [],
      is_public: Boolean(entry.is_public)
    });
  } catch (err) {
    console.error('Failed to get journal entry:', err);
    res.status(500).json({ error: 'Failed to retrieve journal entry.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/journal - Create a new journal entry
// ══════════════════════════════════════════════════════════════════
router.post('/', requireAuth, async (req, res) => {
  const {
    date,
    title,
    category = 'general',
    content,
    mood,
    mood_rating = 3,
    tags = [],
    image_url,
    is_public = false,
    book_id,
  } = req.body;

  // Validation
  if (!date || !title || !content) {
    return res.status(400).json({ error: 'Date, title, and content are required.' });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category.' });
  }

  if (mood && !VALID_MOODS.includes(mood)) {
    return res.status(400).json({ error: 'Invalid mood.' });
  }

  if (mood_rating < 1 || mood_rating > 5) {
    return res.status(400).json({ error: 'Mood rating must be between 1 and 5.' });
  }

  try {
    const result = await db.run(`
      INSERT INTO journal_entries
      (user_id, book_id, date, title, category, content, mood, mood_rating, tags, image_url, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      book_id || null,
      date,
      title.trim(),
      category,
      content.trim(),
      mood || null,
      mood_rating,
      JSON.stringify(tags),
      image_url || null,
      is_public ? 1 : 0
    ]);

    const newEntry = await db.get('SELECT * FROM journal_entries WHERE id = ?', [result.insertId]);

    res.status(201).json({
      ...newEntry,
      tags: newEntry.tags ? JSON.parse(newEntry.tags) : [],
      is_public: Boolean(newEntry.is_public)
    });
  } catch (err) {
    console.error('Failed to create journal entry:', err);
    res.status(500).json({ error: 'Failed to save journal entry.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// PUT /api/journal/:id - Update a journal entry
// ══════════════════════════════════════════════════════════════════
router.put('/:id', requireAuth, async (req, res) => {
  const {
    title,
    category,
    content,
    mood,
    mood_rating,
    tags,
    image_url,
    is_public
  } = req.body;

  try {
    // Check ownership
    const existing = await db.get(
      'SELECT * FROM journal_entries WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title.trim());
    }
    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'Invalid category.' });
      }
      updates.push('category = ?');
      params.push(category);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content.trim());
    }
    if (mood !== undefined) {
      if (mood && !VALID_MOODS.includes(mood)) {
        return res.status(400).json({ error: 'Invalid mood.' });
      }
      updates.push('mood = ?');
      params.push(mood || null);
    }
    if (mood_rating !== undefined) {
      if (mood_rating < 1 || mood_rating > 5) {
        return res.status(400).json({ error: 'Mood rating must be between 1 and 5.' });
      }
      updates.push('mood_rating = ?');
      params.push(mood_rating);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(tags));
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url || null);
    }
    if (is_public !== undefined) {
      updates.push('is_public = ?');
      params.push(is_public ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    updates.push("updated_at = NOW()");
    params.push(req.params.id, req.user.id);

    await db.run(`
      UPDATE journal_entries SET ${updates.join(', ')} WHERE id = ? AND user_id = ?
    `, params);

    const updated = await db.get('SELECT * FROM journal_entries WHERE id = ?', [req.params.id]);

    res.json({
      ...updated,
      tags: updated.tags ? JSON.parse(updated.tags) : [],
      is_public: Boolean(updated.is_public)
    });
  } catch (err) {
    console.error('Failed to update journal entry:', err);
    res.status(500).json({ error: 'Failed to update journal entry.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// DELETE /api/journal/:id - Delete a journal entry
// ══════════════════════════════════════════════════════════════════
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.run(
      'DELETE FROM journal_entries WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete journal entry:', err);
    res.status(500).json({ error: 'Failed to delete journal entry.' });
  }
});

// POST /api/journal/:id/like - Like a public entry
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const entry = await db.get(
      'SELECT * FROM journal_entries WHERE id = ? AND is_public = 1',
      [req.params.id]
    );

    if (!entry) {
      return res.status(404).json({ error: 'Public entry not found.' });
    }

    // Check if already liked
    const existing = await db.get(
      'SELECT * FROM journal_likes WHERE entry_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing) {
      // Unlike
      await db.run(
        'DELETE FROM journal_likes WHERE entry_id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      res.json({ liked: false });
    } else {
      // Like
      await db.run(
        'INSERT INTO journal_likes (entry_id, user_id) VALUES (?, ?)',
        [req.params.id, req.user.id]
      );
      res.json({ liked: true });
    }
  } catch (err) {
    console.error('Failed to toggle like:', err);
    res.status(500).json({ error: 'Failed to toggle like.' });
  }
});

// GET /api/journal/:id/comments - Get comments for a public entry
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const entry = await db.get(
      'SELECT * FROM journal_entries WHERE id = ? AND is_public = 1',
      [req.params.id]
    );

    if (!entry) {
      return res.status(404).json({ error: 'Public entry not found.' });
    }

    const comments = await db.all(`
      SELECT c.*, u.name as author_name
      FROM journal_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.entry_id = ?
      ORDER BY c.created_at ASC
    `, [req.params.id]);

    res.json(comments);
  } catch (err) {
    console.error('Failed to get comments:', err);
    res.status(500).json({ error: 'Failed to retrieve comments.' });
  }
});

// POST /api/journal/:id/comments - Add a comment to a public entry
router.post('/:id/comments', requireAuth, async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content is required.' });
  }

  try {
    const entry = await db.get(
      'SELECT * FROM journal_entries WHERE id = ? AND is_public = 1',
      [req.params.id]
    );

    if (!entry) {
      return res.status(404).json({ error: 'Public entry not found.' });
    }

    const result = await db.run(`
      INSERT INTO journal_comments (entry_id, user_id, content) VALUES (?, ?, ?)
    `, [req.params.id, req.user.id, content.trim()]);

    const newComment = await db.get(`
      SELECT c.*, u.name as author_name
      FROM journal_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Failed to add comment:', err);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

export default router;
