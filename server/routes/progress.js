/**
 * User Progress Routes
 * 
 * Manages chapter reflections and reading progress
 * - Save/update chapter reflections
 * - Get user progress for a book
 * - Mark chapters as complete
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();

// ══════════════════════════════════════════════════════════════════
// GET /api/progress - Get all user progress
// ══════════════════════════════════════════════════════════════════
router.get('/', requireAuth, async (req, res) => {
  try {
    const progress = await db.prepare(`
      SELECT book_id, chapter_id, completed, reflection, updated_at
      FROM user_progress
      WHERE user_id = ?
      ORDER BY book_id, chapter_id
    `).all(req.user.id);

    // Group by book
    const grouped = progress.reduce((acc, row) => {
      if (!acc[row.book_id]) {
        acc[row.book_id] = {
          completedIds: [],
          reflections: {}
        };
      }
      if (row.completed) {
        acc[row.book_id].completedIds.push(row.chapter_id);
      }
      if (row.reflection) {
        acc[row.book_id].reflections[row.chapter_id] = row.reflection;
      }
      return acc;
    }, {});

    res.json({ books: grouped });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

// ══════════════════════════════════════════════════════════════════
// GET /api/progress/:bookId - Get progress for specific book
// ══════════════════════════════════════════════════════════════════
router.get('/:bookId', requireAuth, async (req, res) => {
  try {
    const { bookId } = req.params;

    const progress = await db.prepare(`
      SELECT chapter_id, completed, reflection, updated_at
      FROM user_progress
      WHERE user_id = ? AND book_id = ?
      ORDER BY chapter_id
    `).all(req.user.id, bookId);

    const completedIds = progress.filter(p => p.completed).map(p => p.chapter_id);
    const reflections = progress.reduce((acc, p) => {
      if (p.reflection) {
        acc[p.chapter_id] = p.reflection;
      }
      return acc;
    }, {});

    res.json({ 
      bookId,
      completedIds, 
      reflections 
    });
  } catch (err) {
    console.error('Get book progress error:', err);
    res.status(500).json({ error: 'Failed to load book progress' });
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/progress/:bookId/:chapterId/reflection - Save reflection
// ══════════════════════════════════════════════════════════════════
router.post('/:bookId/:chapterId/reflection', requireAuth, async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;
    const { reflection } = req.body;

    if (reflection === undefined) {
      return res.status(400).json({ error: 'Reflection text is required' });
    }

    // Upsert reflection
    await db.prepare(`
      INSERT INTO user_progress (user_id, book_id, chapter_id, reflection, updated_at)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE reflection = VALUES(reflection), updated_at = NOW()
    `).run(req.user.id, bookId, parseInt(chapterId), reflection);

    res.json({ 
      success: true, 
      message: 'Reflection saved',
      bookId,
      chapterId: parseInt(chapterId),
      reflection
    });
  } catch (err) {
    console.error('Save reflection error:', err);
    res.status(500).json({ error: 'Failed to save reflection' });
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/progress/:bookId/:chapterId/complete - Mark chapter complete
// ══════════════════════════════════════════════════════════════════
router.post('/:bookId/:chapterId/complete', requireAuth, async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;
    const { completed } = req.body;

    // Upsert completion status
    await db.prepare(`
      INSERT INTO user_progress (user_id, book_id, chapter_id, completed, updated_at)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE completed = VALUES(completed), updated_at = NOW()
    `).run(req.user.id, bookId, parseInt(chapterId), completed ? 1 : 0);

    res.json({ 
      success: true, 
      message: completed ? 'Chapter marked complete' : 'Chapter marked incomplete',
      bookId,
      chapterId: parseInt(chapterId),
      completed
    });
  } catch (err) {
    console.error('Mark complete error:', err);
    res.status(500).json({ error: 'Failed to update chapter status' });
  }
});

// ══════════════════════════════════════════════════════════════════
// GET /api/progress/export - Export all reflections for download
// ══════════════════════════════════════════════════════════════════
router.get('/export/all', requireAuth, async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const reflections = await db.prepare(`
      SELECT 
        up.book_id, 
        up.chapter_id, 
        up.reflection, 
        up.completed,
        up.updated_at
      FROM user_progress up
      WHERE up.user_id = ? AND up.reflection IS NOT NULL AND up.reflection != ''
      ORDER BY up.book_id, up.chapter_id
    `).all(req.user.id);

    if (format === 'json') {
      res.json({ reflections });
    } else if (format === 'txt') {
      let txt = '# My Reading Journal\n\n';
      reflections.forEach(r => {
        txt += `## Book: ${r.book_id} - Chapter ${r.chapter_id}\n`;
        txt += `Date: ${r.updated_at}\n\n`;
        txt += `${r.reflection}\n\n`;
        txt += '---\n\n';
      });
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="reading-journal.txt"');
      res.send(txt);
    } else if (format === 'md' || format === 'markdown') {
      let md = '# My Reading Journal\n\n';
      md += `*Exported on ${new Date().toLocaleString()}*\n\n`;
      reflections.forEach(r => {
        md += `## ${r.book_id} - Chapter ${r.chapter_id}\n\n`;
        md += `> *${r.updated_at}*\n\n`;
        md += `${r.reflection}\n\n`;
        md += '---\n\n';
      });
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="reading-journal.md"');
      res.send(md);
    } else {
      res.status(400).json({ error: 'Invalid format. Use json, txt, or md' });
    }
  } catch (err) {
    console.error('Export reflections error:', err);
    res.status(500).json({ error: 'Failed to export reflections' });
  }
});

// ══════════════════════════════════════════════════════════════════
// GET /api/progress/export/:bookId - Export reflections for a book
// ══════════════════════════════════════════════════════════════════
router.get('/export/:bookId', requireAuth, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { format = 'json' } = req.query;

    const reflections = await db.prepare(`
      SELECT 
        chapter_id, 
        reflection, 
        completed,
        updated_at
      FROM user_progress
      WHERE user_id = ? AND book_id = ? AND reflection IS NOT NULL AND reflection != ''
      ORDER BY chapter_id
    `).all(req.user.id, bookId);

    if (format === 'json') {
      res.json({ bookId, reflections });
    } else if (format === 'txt') {
      let txt = `# Reading Journal: ${bookId}\n\n`;
      reflections.forEach(r => {
        txt += `## Chapter ${r.chapter_id}\n`;
        txt += `Date: ${r.updated_at}\n\n`;
        txt += `${r.reflection}\n\n`;
        txt += '---\n\n';
      });
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="journal-${bookId}.txt"`);
      res.send(txt);
    } else if (format === 'md' || format === 'markdown') {
      let md = `# Reading Journal: ${bookId}\n\n`;
      md += `*Exported on ${new Date().toLocaleString()}*\n\n`;
      reflections.forEach(r => {
        md += `## Chapter ${r.chapter_id}\n\n`;
        md += `> *${r.updated_at}*\n\n`;
        md += `${r.reflection}\n\n`;
        md += '---\n\n';
      });
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="journal-${bookId}.md"`);
      res.send(md);
    } else {
      res.status(400).json({ error: 'Invalid format. Use json, txt, or md' });
    }
  } catch (err) {
    console.error('Export book reflections error:', err);
    res.status(500).json({ error: 'Failed to export reflections' });
  }
});

export default router;
