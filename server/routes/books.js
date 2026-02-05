import { Router } from 'express';
import db from '../db.js';

const router = Router();

const mapChapterRow = (chapter) => ({
  id: chapter.id,
  title: chapter.title,
  subtitle: chapter.subtitle,
  summary: chapter.summary,
  content: chapter.content,
  reflectionPrompt: chapter.reflection_prompt || '',
  image: chapter.image,
});

const mapBookRow = (book, chapters = []) => ({
  id: book.id,
  title: book.title,
  subtitle: book.subtitle,
  author: book.author,
  description: book.description,
  coverImage: book.cover_image,
  accentColor: book.accent_color,
  systemPrompt: '',
  chapters,
});

// ── GET /api/books ──
router.get('/', async (_req, res) => {
  try {
    const books = await db.all('SELECT * FROM books ORDER BY created_at');
    const chapters = await db.all('SELECT * FROM chapters ORDER BY sort_order, id');
    const chaptersByBook = chapters.reduce((acc, chapter) => {
      acc[chapter.book_id] = acc[chapter.book_id] || [];
      acc[chapter.book_id].push(mapChapterRow(chapter));
      return acc;
    }, {});

    res.json(books.map(book => mapBookRow(book, chaptersByBook[book.id] || [])));
  } catch (err) {
    console.error('Books list error:', err);
    res.status(500).json({ error: 'Failed to load books' });
  }
});

// ── GET /api/books/:bookId ──
router.get('/:bookId', async (req, res) => {
  try {
    const book = await db.get('SELECT * FROM books WHERE id = ?', [req.params.bookId]);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const chapters = await db.all(
      'SELECT * FROM chapters WHERE book_id = ? ORDER BY sort_order, id',
      [book.id]
    );

    res.json(mapBookRow(book, chapters.map(mapChapterRow)));
  } catch (err) {
    console.error('Book detail error:', err);
    res.status(500).json({ error: 'Failed to load book' });
  }
});

// ── GET /api/books/:bookId/chapters/:chapterId ──
router.get('/:bookId/chapters/:chapterId', async (req, res) => {
  try {
    const chapter = await db.get(
      'SELECT * FROM chapters WHERE book_id = ? AND id = ?',
      [req.params.bookId, parseInt(req.params.chapterId)]
    );

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    res.json(mapChapterRow(chapter));
  } catch (err) {
    console.error('Chapter error:', err);
    res.status(500).json({ error: 'Failed to load chapter' });
  }
});

export default router;
