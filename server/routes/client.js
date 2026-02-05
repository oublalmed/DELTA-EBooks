import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ══════════════════════════════════════════════════════════════════
// CLIENT MESSAGES (Contact Admin)
// ══════════════════════════════════════════════════════════════════

// Get my messages
router.get('/messages', requireAuth, async (req, res) => {
  try {
    const messages = await db.all(`
      SELECT id, type, subject, message, status, admin_reply, replied_at, created_at
      FROM client_messages
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message to admin
router.post('/messages', requireAuth, async (req, res) => {
  try {
    const { type, subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const validTypes = ['general', 'feedback', 'support', 'bug_report', 'feature_request'];
    const messageType = validTypes.includes(type) ? type : 'general';

    const result = await db.run(`
      INSERT INTO client_messages (user_id, type, subject, message)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, messageType, subject.trim(), message.trim()]);

    const newMessage = await db.get('SELECT * FROM client_messages WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ══════════════════════════════════════════════════════════════════
// BOOK IDEAS (Propose New Ebooks)
// ══════════════════════════════════════════════════════════════════

// Get my submitted ideas
router.get('/ideas', requireAuth, async (req, res) => {
  try {
    const ideas = await db.all(`
      SELECT id, title, description, category, theme, status, created_at
      FROM book_ideas
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json(ideas);
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

// Submit a new book idea
router.post('/ideas', requireAuth, async (req, res) => {
  try {
    const { title, description, category, theme, target_audience, additional_notes } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const result = await db.run(`
      INSERT INTO book_ideas (user_id, title, description, category, theme, target_audience, additional_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      title.trim(),
      description.trim(),
      category || null,
      theme || null,
      target_audience || null,
      additional_notes || null
    ]);

    const newIdea = await db.get('SELECT * FROM book_ideas WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Book idea submitted successfully! Thank you for your suggestion.',
      data: newIdea
    });
  } catch (error) {
    console.error('Submit idea error:', error);
    res.status(500).json({ error: 'Failed to submit idea' });
  }
});

// ══════════════════════════════════════════════════════════════════
// USER ACTIVITY TRACKING (for analytics)
// ══════════════════════════════════════════════════════════════════

// Log user activity
router.post('/activity', requireAuth, async (req, res) => {
  try {
    const { activity_type, book_id, chapter_id, duration_seconds, metadata } = req.body;

    await db.run(`
      INSERT INTO user_activity (user_id, activity_type, book_id, chapter_id, duration_seconds, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      activity_type || 'unknown',
      book_id || null,
      chapter_id || null,
      duration_seconds || null,
      metadata ? JSON.stringify(metadata) : null
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// Start reading session
router.post('/reading-session/start', requireAuth, async (req, res) => {
  try {
    const { book_id, chapter_id } = req.body;

    if (!book_id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    const result = await db.run(`
      INSERT INTO reading_sessions (user_id, book_id, chapter_id)
      VALUES (?, ?, ?)
    `, [req.user.id, book_id, chapter_id || null]);

    res.json({ session_id: result.insertId });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start reading session' });
  }
});

// End reading session
router.post('/reading-session/:id/end', requireAuth, async (req, res) => {
  try {
    const { pages_read } = req.body;

    // Get session start time
    const session = await db.get(
      'SELECT started_at FROM reading_sessions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const startTime = new Date(session.started_at);
    const endTime = new Date();
    const durationSeconds = Math.round((endTime - startTime) / 1000);

    await db.run(`
      UPDATE reading_sessions SET
        ended_at = NOW(),
        duration_seconds = ?,
        pages_read = ?
      WHERE id = ?
    `, [durationSeconds, pages_read || null, req.params.id]);

    res.json({ success: true, duration_seconds: durationSeconds });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end reading session' });
  }
});

export default router;
