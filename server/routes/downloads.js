import { Router } from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { generateBookPDF } from '../services/pdf.js';

const router = Router();

const MAX_DOWNLOADS_PER_BOOK = 5;
const TOKEN_EXPIRY_MINUTES = 30;

// ── POST /api/downloads/generate-token ──
// Creates a temporary download token for a purchased book
router.post('/generate-token', requireAuth, async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    // Verify purchase
    const purchase = await db.prepare(
      'SELECT id FROM purchases WHERE user_id = ? AND book_id = ? AND status = ?'
    ).get(req.user.id, bookId, 'completed');

    if (!purchase) {
      return res.status(403).json({ error: 'You have not purchased this book' });
    }

    // Check download limit
    const downloadCount = await db.prepare(
      'SELECT COUNT(*) as count FROM download_history WHERE user_id = ? AND book_id = ?'
    ).get(req.user.id, bookId);

    if (downloadCount.count >= MAX_DOWNLOADS_PER_BOOK) {
      return res.status(429).json({
        error: `Download limit reached (${MAX_DOWNLOADS_PER_BOOK} downloads maximum). Contact support for additional downloads.`,
        downloadsUsed: downloadCount.count,
        maxDownloads: MAX_DOWNLOADS_PER_BOOK,
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await db.prepare(`
      INSERT INTO download_tokens (user_id, book_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, bookId, token, expiresAt);

    res.json({
      downloadUrl: `/api/downloads/${token}`,
      expiresAt: expiresAt.toISOString(),
      downloadsRemaining: MAX_DOWNLOADS_PER_BOOK - downloadCount.count - 1,
    });
  } catch (err) {
    console.error('Generate token error:', err);
    res.status(500).json({ error: 'Failed to generate download link' });
  }
});

// ── GET /api/downloads/:token ──
// Serves the PDF via secure temporary token
router.get('/:token', async (req, res) => {
  try {
    const tokenRecord = await db.prepare(`
      SELECT dt.*, u.email, u.name
      FROM download_tokens dt
      JOIN users u ON dt.user_id = u.id
      WHERE dt.token = ?
    `).get(req.params.token);

    if (!tokenRecord) {
      return res.status(404).json({ error: 'Invalid download link' });
    }

    // Check expiry
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Download link has expired. Please generate a new one.' });
    }

    // Check if token already used
    if (tokenRecord.used) {
      return res.status(410).json({ error: 'Download link already used. Please generate a new one.' });
    }

    // Get book and chapters
    const book = await db.prepare('SELECT * FROM books WHERE id = ?').get(tokenRecord.book_id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const chapters = await db.prepare(
      'SELECT * FROM chapters WHERE book_id = ? ORDER BY sort_order, id'
    ).all(tokenRecord.book_id);

    // Mark token as used
    await db.prepare('UPDATE download_tokens SET used = 1 WHERE id = ?').run(tokenRecord.id);

    // Record download
    await db.prepare(`
      INSERT INTO download_history (user_id, book_id, ip_address)
      VALUES (?, ?, ?)
    `).run(tokenRecord.user_id, tokenRecord.book_id, req.ip);

    // Generate PDF with watermark
    const pdfBuffer = await generateBookPDF({
      title: book.title,
      subtitle: book.subtitle,
      author: book.author,
      chapters,
      watermarkEmail: tokenRecord.email,
    });

    // Serve PDF
    const filename = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// ── GET /api/downloads/history ──
router.get('/user/history', requireAuth, async (req, res) => {
  try {
    const history = await db.prepare(`
      SELECT dh.*, b.title as book_title
      FROM download_history dh
      JOIN books b ON dh.book_id = b.id
      WHERE dh.user_id = ?
      ORDER BY dh.downloaded_at DESC
    `).all(req.user.id);

    // Get remaining downloads per book
    const purchases = await db.prepare(
      'SELECT book_id FROM purchases WHERE user_id = ? AND status = ?'
    ).all(req.user.id, 'completed');

    const downloadInfo = await Promise.all(
      purchases.map(async (p) => {
        const count = await db.prepare(
          'SELECT COUNT(*) as count FROM download_history WHERE user_id = ? AND book_id = ?'
        ).get(req.user.id, p.book_id);
        return {
          bookId: p.book_id,
          downloadsUsed: count.count,
          downloadsRemaining: Math.max(0, MAX_DOWNLOADS_PER_BOOK - count.count),
          maxDownloads: MAX_DOWNLOADS_PER_BOOK,
        };
      })
    );

    res.json({ history, downloadInfo });
  } catch (err) {
    console.error('Download history error:', err);
    res.status(500).json({ error: 'Failed to load download history' });
  }
});

export default router;
