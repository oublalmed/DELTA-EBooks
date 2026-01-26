import { Router } from 'express';
import db from '../db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

const FREE_CHAPTERS = 4;

/**
 * Get content for a chapter with access rules applied:
 * - Chapters 1-2: full access
 * - Chapter 3: partial content (cut at 60%)
 * - Chapter 4: teaser (cut at 30% with cliffhanger)
 * - Chapters 5+: locked (title/summary only)
 */
function applyAccessRules(chapter, hasAccess) {
  if (hasAccess) return chapter;

  const chapterId = chapter.id;

  if (chapterId <= 2) {
    // Chapters 1-2: fully visible
    return chapter;
  }

  if (chapterId === 3) {
    // Chapter 3: partially visible (60%)
    const words = chapter.content.split(' ');
    const cutPoint = Math.floor(words.length * 0.6);
    return {
      ...chapter,
      content: words.slice(0, cutPoint).join(' ') + '...',
      isPartial: true,
      accessMessage: 'This chapter continues... Purchase the book to read the full content.',
    };
  }

  if (chapterId === 4) {
    // Chapter 4: teaser (30% — cut before the ending)
    const words = chapter.content.split(' ');
    const cutPoint = Math.floor(words.length * 0.3);
    return {
      ...chapter,
      content: words.slice(0, cutPoint).join(' ') + '...',
      isPartial: true,
      isTeaser: true,
      accessMessage: 'The story continues with a powerful revelation... Purchase the book to discover what comes next.',
    };
  }

  // Chapters 5+: locked
  return {
    id: chapter.id,
    book_id: chapter.book_id,
    title: chapter.title,
    subtitle: chapter.subtitle,
    summary: chapter.summary,
    image: chapter.image,
    content: null,
    isLocked: true,
    accessMessage: 'Purchase this book to unlock all chapters.',
  };
}

// ── GET /api/books ──
router.get('/', optionalAuth, (req, res) => {
  try {
    const books = db.prepare('SELECT * FROM books ORDER BY created_at').all();
    let purchasedBookIds = [];

    if (req.user) {
      const purchases = db.prepare(
        'SELECT book_id FROM purchases WHERE user_id = ? AND status = ?'
      ).all(req.user.id, 'completed');
      purchasedBookIds = purchases.map(p => p.book_id);
    }

    const enrichedBooks = books.map(book => ({
      ...book,
      isPurchased: purchasedBookIds.includes(book.id),
      freeChapters: FREE_CHAPTERS,
    }));

    res.json(enrichedBooks);
  } catch (err) {
    console.error('Books list error:', err);
    res.status(500).json({ error: 'Failed to load books' });
  }
});

// ── GET /api/books/:bookId ──
router.get('/:bookId', optionalAuth, (req, res) => {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    let hasAccess = false;
    if (req.user) {
      const purchase = db.prepare(
        'SELECT id FROM purchases WHERE user_id = ? AND book_id = ? AND status = ?'
      ).get(req.user.id, book.id, 'completed');
      hasAccess = !!purchase;
    }

    const chapters = db.prepare(
      'SELECT * FROM chapters WHERE book_id = ? ORDER BY sort_order, id'
    ).all(book.id);

    const processedChapters = chapters.map(ch => applyAccessRules(ch, hasAccess));

    res.json({
      ...book,
      isPurchased: hasAccess,
      freeChapters: FREE_CHAPTERS,
      chapters: processedChapters,
    });
  } catch (err) {
    console.error('Book detail error:', err);
    res.status(500).json({ error: 'Failed to load book' });
  }
});

// ── GET /api/books/:bookId/chapters/:chapterId ──
router.get('/:bookId/chapters/:chapterId', optionalAuth, (req, res) => {
  try {
    const chapter = db.prepare(
      'SELECT * FROM chapters WHERE book_id = ? AND id = ?'
    ).get(req.params.bookId, parseInt(req.params.chapterId));

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    let hasAccess = false;
    if (req.user) {
      const purchase = db.prepare(
        'SELECT id FROM purchases WHERE user_id = ? AND book_id = ? AND status = ?'
      ).get(req.user.id, req.params.bookId, 'completed');
      hasAccess = !!purchase;
    }

    res.json(applyAccessRules(chapter, hasAccess));
  } catch (err) {
    console.error('Chapter error:', err);
    res.status(500).json({ error: 'Failed to load chapter' });
  }
});

export default router;
