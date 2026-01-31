import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

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
router.get('/chapters', requireAuth, (req, res) => {
  try {
    const unlocks = db.prepare(`
      SELECT book_id, chapter_id, unlocked_at
      FROM chapter_unlocks
      WHERE user_id = ?
    `).all(req.user.id);

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
router.get('/chapters/:bookId/:chapterId', requireAuth, (req, res) => {
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
    const unlock = db.prepare(`
      SELECT * FROM chapter_unlocks
      WHERE user_id = ? AND book_id = ? AND chapter_id = ?
    `).get(req.user.id, bookId, chapterNum);

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
router.post('/chapters/:bookId/:chapterId/unlock', requireAuth, (req, res) => {
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
    const existing = db.prepare(`
      SELECT * FROM chapter_unlocks
      WHERE user_id = ? AND book_id = ? AND chapter_id = ?
    `).get(req.user.id, bookId, chapterNum);

    if (existing) {
      return res.json({
        success: true,
        message: 'Chapter already unlocked',
        isUnlocked: true,
        unlockedAt: existing.unlocked_at
      });
    }

    // Unlock the chapter
    db.prepare(`
      INSERT INTO chapter_unlocks (user_id, book_id, chapter_id)
      VALUES (?, ?, ?)
    `).run(req.user.id, bookId, chapterNum);

    // Log the unlock
    db.prepare(`
      INSERT INTO premium_access_logs (user_id, action, access_type, device_info)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, 'chapter_unlock', 'ad_reward', JSON.stringify({
      bookId,
      chapterId: chapterNum,
      userAgent: req.headers['user-agent']
    }));

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
router.get('/journal', requireAuth, (req, res) => {
  try {
    const now = new Date();
    
    // Get or create journal access record
    let access = db.prepare(`
      SELECT * FROM journal_access WHERE user_id = ?
    `).get(req.user.id);

    if (!access) {
      // Create new access with free trial
      const freeTrialEnds = new Date(now.getTime() + JOURNAL_FREE_DAYS * 24 * 60 * 60 * 1000);
      
      db.prepare(`
        INSERT INTO journal_access (user_id, free_trial_ends)
        VALUES (?, ?)
      `).run(req.user.id, freeTrialEnds.toISOString());

      access = db.prepare(`
        SELECT * FROM journal_access WHERE user_id = ?
      `).get(req.user.id);
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
router.post('/journal/unlock', requireAuth, (req, res) => {
  try {
    const now = new Date();
    
    // Get current access
    let access = db.prepare(`
      SELECT * FROM journal_access WHERE user_id = ?
    `).get(req.user.id);

    if (!access) {
      // Create with expired trial (user is unlocking directly)
      const freeTrialEnds = new Date(now.getTime() - 1000); // Already expired
      db.prepare(`
        INSERT INTO journal_access (user_id, free_trial_ends)
        VALUES (?, ?)
      `).run(req.user.id, freeTrialEnds.toISOString());
    }

    // Calculate new access end date
    const currentAccess = access?.access_until ? new Date(access.access_until) : now;
    const startFrom = currentAccess > now ? currentAccess : now;
    const newAccessUntil = new Date(startFrom.getTime() + JOURNAL_ACCESS_DAYS * 24 * 60 * 60 * 1000);

    // Update access
    db.prepare(`
      UPDATE journal_access
      SET access_until = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `).run(newAccessUntil.toISOString(), req.user.id);

    // Log the unlock
    db.prepare(`
      INSERT INTO premium_access_logs (user_id, action, access_type, duration_days, device_info)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, 'journal_unlock', 'ad_reward', JOURNAL_ACCESS_DAYS, JSON.stringify({
      userAgent: req.headers['user-agent']
    }));

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
router.get('/pdf/:bookId', requireAuth, (req, res) => {
  try {
    const { bookId } = req.params;

    // Get or create download progress
    let progress = db.prepare(`
      SELECT * FROM pdf_download_progress
      WHERE user_id = ? AND book_id = ?
    `).get(req.user.id, bookId);

    if (!progress) {
      db.prepare(`
        INSERT INTO pdf_download_progress (user_id, book_id, ads_required)
        VALUES (?, ?, ?)
      `).run(req.user.id, bookId, PDF_ADS_REQUIRED);

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
router.post('/pdf/:bookId/watch-ad', requireAuth, (req, res) => {
  try {
    const { bookId } = req.params;

    // Get or create download progress
    let progress = db.prepare(`
      SELECT * FROM pdf_download_progress
      WHERE user_id = ? AND book_id = ?
    `).get(req.user.id, bookId);

    if (!progress) {
      db.prepare(`
        INSERT INTO pdf_download_progress (user_id, book_id, ads_required)
        VALUES (?, ?, ?)
      `).run(req.user.id, bookId, PDF_ADS_REQUIRED);

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

    db.prepare(`
      UPDATE pdf_download_progress
      SET ads_watched = ?,
          is_unlocked = ?,
          unlocked_at = CASE WHEN ? = 1 THEN datetime('now') ELSE unlocked_at END,
          updated_at = datetime('now')
      WHERE user_id = ? AND book_id = ?
    `).run(newAdsWatched, isNowUnlocked ? 1 : 0, isNowUnlocked ? 1 : 0, req.user.id, bookId);

    // Log the ad watch
    db.prepare(`
      INSERT INTO premium_access_logs (user_id, action, access_type, device_info)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, 'pdf_ad_watched', 'ad_reward', JSON.stringify({
      bookId,
      adsWatched: newAdsWatched,
      adsRequired: progress.ads_required,
      userAgent: req.headers['user-agent']
    }));

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
router.get('/pdf', requireAuth, (req, res) => {
  try {
    const progresses = db.prepare(`
      SELECT * FROM pdf_download_progress
      WHERE user_id = ?
    `).all(req.user.id);

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

export default router;
