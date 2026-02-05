import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { generateBookPDF } from '../services/pdf.js';

const router = Router();

// Constants
const FREE_CHAPTERS = 5;
const JOURNAL_FREE_DAYS = 7;
const PDF_ADS_REQUIRED = 5;
const JOURNAL_ACCESS_DAYS = 7; // Days granted per ad watch

// ══════════════════════════════════════════════════════════════════
// CHAPTER UNLOCK ROUTES
// ══════════════════════════════════════════════════════════════════

// Get all unlocked chapters for a user
router.get('/chapters', requireAuth, async (req, res) => {
  try {
    const unlocks = await db.all(`
      SELECT book_id, chapter_id, unlocked_at
      FROM chapter_unlocks
      WHERE user_id = ?
    `, [req.user.id]);

    // Group by book
    const unlockedByBook = {};
    for (const unlock of unlocks) {
      if (!unlockedByBook[unlock.book_id]) {
        unlockedByBook[unlock.book_id] = [];
      }
      unlockedByBook[unlock.book_id].push(unlock.chapter_id);
    }

    res.json({
      freeChapters: FREE_CHAPTERS,
      unlocks: unlockedByBook,
      raw: unlocks
    });
  } catch (error) {
    console.error('Error getting chapter unlocks:', error);
    res.status(500).json({ error: 'Failed to get chapter unlocks' });
  }
});

// Check if a specific chapter is unlocked
router.get('/chapters/:bookId/:chapterId', requireAuth, async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;
    const chapterNum = parseInt(chapterId);

    // First 5 chapters are always free
    if (chapterNum <= FREE_CHAPTERS) {
      return res.json({
        isUnlocked: true,
        isFree: true,
        chapterId: chapterNum,
        bookId
      });
    }

    // Check if chapter was unlocked via ad
    const unlock = await db.get(`
      SELECT * FROM chapter_unlocks
      WHERE user_id = ? AND book_id = ? AND chapter_id = ?
    `, [req.user.id, bookId, chapterNum]);

    res.json({
      isUnlocked: !!unlock,
      isFree: false,
      chapterId: chapterNum,
      bookId,
      unlockedAt: unlock?.unlocked_at || null
    });
  } catch (error) {
    console.error('Error checking chapter unlock:', error);
    res.status(500).json({ error: 'Failed to check chapter unlock' });
  }
});

// Unlock a chapter after watching ad
router.post('/chapters/:bookId/:chapterId/unlock', requireAuth, async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;
    const chapterNum = parseInt(chapterId);

    // First 5 chapters don't need unlocking
    if (chapterNum <= FREE_CHAPTERS) {
      return res.json({
        success: true,
        message: 'Chapter is already free',
        isUnlocked: true
      });
    }

    // Check if already unlocked
    const existing = await db.get(`
      SELECT * FROM chapter_unlocks
      WHERE user_id = ? AND book_id = ? AND chapter_id = ?
    `, [req.user.id, bookId, chapterNum]);

    if (existing) {
      return res.json({
        success: true,
        message: 'Chapter already unlocked',
        isUnlocked: true,
        unlockedAt: existing.unlocked_at
      });
    }

    // Unlock the chapter
    await db.run(`
      INSERT INTO chapter_unlocks (user_id, book_id, chapter_id)
      VALUES (?, ?, ?)
    `, [req.user.id, bookId, chapterNum]);

    // Log the unlock
    await db.run(`
      INSERT INTO premium_access_logs (user_id, action, access_type, device_info)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, 'chapter_unlock', 'ad_reward', JSON.stringify({
      bookId,
      chapterId: chapterNum,
      userAgent: req.headers['user-agent']
    })]);

    res.json({
      success: true,
      message: `Chapter ${chapterNum} unlocked!`,
      isUnlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error unlocking chapter:', error);
    res.status(500).json({ error: 'Failed to unlock chapter' });
  }
});

// ══════════════════════════════════════════════════════════════════
// JOURNAL/CALENDAR ACCESS ROUTES
// ══════════════════════════════════════════════════════════════════

// Get journal access status
router.get('/journal', requireAuth, async (req, res) => {
  try {
    const now = new Date();

    // Get or create journal access record
    let access = await db.get(`
      SELECT * FROM journal_access WHERE user_id = ?
    `, [req.user.id]);

    if (!access) {
      // Create new access with free trial
      const freeTrialEnds = new Date(now.getTime() + JOURNAL_FREE_DAYS * 24 * 60 * 60 * 1000);

      await db.run(`
        INSERT INTO journal_access (user_id, free_trial_ends)
        VALUES (?, ?)
      `, [req.user.id, freeTrialEnds.toISOString()]);

      access = await db.get(`
        SELECT * FROM journal_access WHERE user_id = ?
      `, [req.user.id]);
    }

    const freeTrialEnds = new Date(access.free_trial_ends);
    const accessUntil = access.access_until ? new Date(access.access_until) : null;
    const freeTrialActive = now < freeTrialEnds;
    const freeTrialExpired = now >= freeTrialEnds;
    const hasAdAccess = accessUntil && now < accessUntil;
    const hasAccess = freeTrialActive || hasAdAccess;

    // Calculate days remaining
    let daysRemaining = 0;
    if (hasAccess) {
      const endDate = hasAdAccess ? accessUntil : freeTrialEnds;
      daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    }

    res.json({
      hasAccess,
      freeTrialActive,
      freeTrialEndsAt: access.free_trial_ends,
      freeTrialExpired,
      accessUntil: access.access_until,
      daysRemaining: Math.max(0, daysRemaining)
    });
  } catch (error) {
    console.error('Error getting journal access:', error);
    res.status(500).json({ error: 'Failed to get journal access status' });
  }
});

// Grant journal access after watching ad
router.post('/journal/unlock', requireAuth, async (req, res) => {
  try {
    const now = new Date();

    // Get current access
    let access = await db.get(`
      SELECT * FROM journal_access WHERE user_id = ?
    `, [req.user.id]);

    if (!access) {
      // Create with expired trial (user is unlocking directly)
      const freeTrialEnds = new Date(now.getTime() - 1000); // Already expired
      await db.run(`
        INSERT INTO journal_access (user_id, free_trial_ends)
        VALUES (?, ?)
      `, [req.user.id, freeTrialEnds.toISOString()]);
    }

    // Calculate new access end date
    const currentAccess = access?.access_until ? new Date(access.access_until) : now;
    const startFrom = currentAccess > now ? currentAccess : now;
    const newAccessUntil = new Date(startFrom.getTime() + JOURNAL_ACCESS_DAYS * 24 * 60 * 60 * 1000);

    // Update access
    await db.run(`
      UPDATE journal_access
      SET access_until = ?, updated_at = NOW()
      WHERE user_id = ?
    `, [newAccessUntil.toISOString(), req.user.id]);

    // Log the unlock
    await db.run(`
      INSERT INTO premium_access_logs (user_id, action, access_type, duration_days, device_info)
      VALUES (?, ?, ?, ?, ?)
    `, [req.user.id, 'journal_unlock', 'ad_reward', JOURNAL_ACCESS_DAYS, JSON.stringify({
      userAgent: req.headers['user-agent']
    })]);

    res.json({
      success: true,
      message: `Journal access granted for ${JOURNAL_ACCESS_DAYS} days!`,
      accessUntil: newAccessUntil.toISOString(),
      daysRemaining: JOURNAL_ACCESS_DAYS
    });
  } catch (error) {
    console.error('Error unlocking journal access:', error);
    res.status(500).json({ error: 'Failed to unlock journal access' });
  }
});

// ══════════════════════════════════════════════════════════════════
// PDF DOWNLOAD UNLOCK ROUTES
// ══════════════════════════════════════════════════════════════════

// Get PDF download status for a book
router.get('/pdf/:bookId', requireAuth, async (req, res) => {
  try {
    const { bookId } = req.params;

    // Get or create download progress
    let progress = await db.get(`
      SELECT * FROM pdf_download_progress
      WHERE user_id = ? AND book_id = ?
    `, [req.user.id, bookId]);

    if (!progress) {
      await db.run(`
        INSERT INTO pdf_download_progress (user_id, book_id, ads_required)
        VALUES (?, ?, ?)
      `, [req.user.id, bookId, PDF_ADS_REQUIRED]);

      progress = {
        ads_watched: 0,
        ads_required: PDF_ADS_REQUIRED,
        is_unlocked: 0
      };
    }

    res.json({
      bookId,
      adsWatched: progress.ads_watched,
      adsRequired: progress.ads_required,
      adsRemaining: Math.max(0, progress.ads_required - progress.ads_watched),
      isUnlocked: progress.is_unlocked === 1,
      canDownload: progress.is_unlocked === 1,
      unlockedAt: progress.unlocked_at || null
    });
  } catch (error) {
    console.error('Error getting PDF download status:', error);
    res.status(500).json({ error: 'Failed to get PDF download status' });
  }
});

// Record an ad watched for PDF download
router.post('/pdf/:bookId/watch-ad', requireAuth, async (req, res) => {
  try {
    const { bookId } = req.params;

    // Get or create download progress
    let progress = await db.get(`
      SELECT * FROM pdf_download_progress
      WHERE user_id = ? AND book_id = ?
    `, [req.user.id, bookId]);

    if (!progress) {
      await db.run(`
        INSERT INTO pdf_download_progress (user_id, book_id, ads_required)
        VALUES (?, ?, ?)
      `, [req.user.id, bookId, PDF_ADS_REQUIRED]);

      progress = {
        ads_watched: 0,
        ads_required: PDF_ADS_REQUIRED,
        is_unlocked: 0
      };
    }

    // Check if already unlocked
    if (progress.is_unlocked === 1) {
      return res.json({
        success: true,
        message: 'PDF download already unlocked',
        adsWatched: progress.ads_watched,
        adsRequired: progress.ads_required,
        isUnlocked: true,
        canDownload: true
      });
    }

    // Increment ads watched
    const newAdsWatched = progress.ads_watched + 1;
    const isNowUnlocked = newAdsWatched >= progress.ads_required;

    await db.run(`
      UPDATE pdf_download_progress
      SET ads_watched = ?,
          is_unlocked = ?,
          unlocked_at = CASE WHEN ? = 1 THEN NOW() ELSE unlocked_at END,
          updated_at = NOW()
      WHERE user_id = ? AND book_id = ?
    `, [newAdsWatched, isNowUnlocked ? 1 : 0, isNowUnlocked ? 1 : 0, req.user.id, bookId]);

    // Log the ad watch
    await db.run(`
      INSERT INTO premium_access_logs (user_id, action, access_type, device_info)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, 'pdf_ad_watched', 'ad_reward', JSON.stringify({
      bookId,
      adsWatched: newAdsWatched,
      adsRequired: progress.ads_required,
      userAgent: req.headers['user-agent']
    })]);

    res.json({
      success: true,
      message: isNowUnlocked
        ? 'PDF download unlocked! You can now download this book.'
        : `Ad watched! ${progress.ads_required - newAdsWatched} more ads to unlock download.`,
      adsWatched: newAdsWatched,
      adsRequired: progress.ads_required,
      adsRemaining: Math.max(0, progress.ads_required - newAdsWatched),
      isUnlocked: isNowUnlocked,
      canDownload: isNowUnlocked
    });
  } catch (error) {
    console.error('Error recording PDF ad watch:', error);
    res.status(500).json({ error: 'Failed to record ad watch' });
  }
});

// Get all PDF download statuses for user
router.get('/pdf', requireAuth, async (req, res) => {
  try {
    const progresses = await db.all(`
      SELECT * FROM pdf_download_progress
      WHERE user_id = ?
    `, [req.user.id]);

    const result = {};
    for (const p of progresses) {
      result[p.book_id] = {
        adsWatched: p.ads_watched,
        adsRequired: p.ads_required,
        adsRemaining: Math.max(0, p.ads_required - p.ads_watched),
        isUnlocked: p.is_unlocked === 1,
        canDownload: p.is_unlocked === 1
      };
    }

    res.json({
      adsRequired: PDF_ADS_REQUIRED,
      books: result
    });
  } catch (error) {
    console.error('Error getting all PDF statuses:', error);
    res.status(500).json({ error: 'Failed to get PDF download statuses' });
  }
});

// ══════════════════════════════════════════════════════════════════
// DOWNLOAD PDF - Generates and serves the PDF file
// ══════════════════════════════════════════════════════════════════
router.get('/pdf/:bookId/download', requireAuth, async (req, res) => {
  try {
    const { bookId } = req.params;

    // Check if user has unlocked this book's PDF
    const progress = await db.get(`
      SELECT * FROM pdf_download_progress
      WHERE user_id = ? AND book_id = ?
    `, [req.user.id, bookId]);

    if (!progress || progress.is_unlocked !== 1) {
      return res.status(403).json({
        error: 'PDF not unlocked. Please watch the required ads first.',
        adsWatched: progress?.ads_watched || 0,
        adsRequired: PDF_ADS_REQUIRED
      });
    }

    // Get book data - books are stored in frontend constants,
    // so we'll use a simple structure for now
    // In production, you'd fetch this from the database or an API
    console.log('Getting book data for:', bookId);
    const bookData = getBookData(bookId);

    if (!bookData) {
      console.log('Book not found:', bookId);
      return res.status(404).json({ error: 'Book not found' });
    }
    console.log('Book found:', bookData.title);

    // Generate PDF with watermark
    console.log('Generating PDF...');
    const pdfBuffer = await generateBookPDF({
      title: bookData.title,
      subtitle: bookData.subtitle,
      author: bookData.author,
      chapters: bookData.chapters,
      watermarkEmail: req.user.email
    });
    console.log('PDF generated, size:', pdfBuffer.length);

    // Record download
    await db.run(`
      INSERT INTO user_activity (user_id, activity_type, book_id, metadata)
      VALUES (?, 'pdf_download', ?, ?)
    `, [req.user.id, bookId, JSON.stringify({ email: req.user.email })]);

    // Serve PDF
    const filename = `${bookData.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Helper function to get book data
// This maps book IDs to their content
// In a production app, this would come from a database
function getBookData(bookId) {
  const books = {
    'relationship-guide': {
      title: 'The Relationship Guide',
      subtitle: 'Building Meaningful Connections',
      author: 'DELTA Wisdom',
      chapters: [
        { title: 'Understanding Connection', subtitle: 'The Foundation', content: 'Human connection is at the core of our existence...', reflectionPrompt: 'What does connection mean to you?' },
        { title: 'Communication Basics', subtitle: 'Speaking and Listening', content: 'Effective communication is a two-way street...', reflectionPrompt: 'How can you improve your listening?' },
        { title: 'Building Trust', subtitle: 'The Cornerstone', content: 'Trust is built through consistent actions...', reflectionPrompt: 'What builds trust in your relationships?' },
        { title: 'Handling Conflict', subtitle: 'Growing Through Challenges', content: 'Conflict is natural in any relationship...', reflectionPrompt: 'How do you typically handle conflict?' },
        { title: 'Deepening Bonds', subtitle: 'Creating Lasting Connections', content: 'Deep relationships require ongoing investment...', reflectionPrompt: 'What can you do to deepen your relationships?' }
      ]
    },
    'self-mastery': {
      title: 'Self Mastery',
      subtitle: 'The Path to Personal Excellence',
      author: 'DELTA Wisdom',
      chapters: [
        { title: 'Know Thyself', subtitle: 'Self-Awareness', content: 'The journey to mastery begins with understanding yourself...', reflectionPrompt: 'What do you know about yourself?' },
        { title: 'Discipline', subtitle: 'Building Habits', content: 'Discipline is the bridge between goals and accomplishment...', reflectionPrompt: 'Where could you apply more discipline?' },
        { title: 'Mindset', subtitle: 'Growth vs Fixed', content: 'Your mindset shapes your reality...', reflectionPrompt: 'Is your mindset helping or hindering you?' },
        { title: 'Resilience', subtitle: 'Bouncing Back', content: 'Resilience is not about avoiding failure...', reflectionPrompt: 'How do you recover from setbacks?' },
        { title: 'Purpose', subtitle: 'Finding Your Why', content: 'Purpose gives meaning to our actions...', reflectionPrompt: 'What drives you forward?' }
      ]
    },
    'financial-wisdom': {
      title: 'Financial Wisdom',
      subtitle: 'Building Wealth Mindfully',
      author: 'DELTA Wisdom',
      chapters: [
        { title: 'Money Mindset', subtitle: 'Your Relationship with Money', content: 'How you think about money shapes your financial reality...', reflectionPrompt: 'What is your current money mindset?' },
        { title: 'Budgeting Basics', subtitle: 'Managing Your Resources', content: 'A budget is a plan for your money...', reflectionPrompt: 'How do you currently manage your finances?' },
        { title: 'Saving Strategies', subtitle: 'Building Your Safety Net', content: 'Saving is the foundation of financial security...', reflectionPrompt: 'What are your saving goals?' },
        { title: 'Investing Introduction', subtitle: 'Growing Your Wealth', content: 'Investing puts your money to work...', reflectionPrompt: 'What do you want to learn about investing?' },
        { title: 'Financial Freedom', subtitle: 'The Ultimate Goal', content: 'Financial freedom means having choices...', reflectionPrompt: 'What does financial freedom mean to you?' }
      ]
    }
  };

  return books[bookId] || null;
}

export default router;
