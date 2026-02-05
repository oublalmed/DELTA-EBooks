/**
 * Ad-Based Premium Access Routes
 *
 * Manages premium access granted via rewarded ads:
 * - Check premium status
 * - Grant premium access after watching ad
 * - Track trials and access history
 * - Google Play policy compliant
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();

// ══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════════
const PREMIUM_DURATION_DAYS = 7; // Premium lasts 7 days after watching ad
const TRIAL_DURATION_DAYS = 3;   // First-time users get 3-day trial
const MAX_ADS_PER_DAY = 5;       // Limit ads per day (fraud prevention)

// ══════════════════════════════════════════════════════════════════
// GET /api/premium/status - Check user's premium status
// ══════════════════════════════════════════════════════════════════
router.get('/status', requireAuth, async (req, res) => {
  try {
    const user = await db.get(
      'SELECT premium_until, trial_used FROM users WHERE id = ?',
      [req.user.id]
    );

    const now = new Date().toISOString();
    const isPremium = user.premium_until && user.premium_until > now;

    // Check trial status
    const trial = await db.get('SELECT * FROM user_trials WHERE user_id = ?', [req.user.id]);
    const trialActive = trial && !trial.trial_used && trial.trial_ends > now;
    const trialAvailable = !trial && !user.trial_used;

    // Get active premium access record
    const activeAccess = await db.get(`
      SELECT * FROM premium_access
      WHERE user_id = ? AND expires_at > ?
      ORDER BY expires_at DESC LIMIT 1
    `, [req.user.id, now]);

    // Count ads watched today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const adsWatchedToday = await db.get(`
      SELECT COUNT(*) as count FROM premium_access_logs
      WHERE user_id = ? AND action = 'ad_watched' AND created_at >= ?
    `, [req.user.id, todayStart.toISOString()]);

    res.json({
      isPremium: isPremium || trialActive,
      premiumUntil: isPremium ? user.premium_until : (trialActive ? trial.trial_ends : null),
      accessType: trialActive ? 'trial' : (isPremium ? 'ad_reward' : 'free'),
      trialAvailable,
      trialUsed: Boolean(user.trial_used || trial?.trial_used),
      adsWatchedToday: adsWatchedToday.count,
      maxAdsPerDay: MAX_ADS_PER_DAY,
      canWatchAd: adsWatchedToday.count < MAX_ADS_PER_DAY,
      durationDays: PREMIUM_DURATION_DAYS,
      activeAccess: activeAccess ? {
        grantedAt: activeAccess.granted_at,
        expiresAt: activeAccess.expires_at,
        durationDays: activeAccess.duration_days
      } : null
    });
  } catch (err) {
    console.error('Failed to get premium status:', err);
    res.status(500).json({ error: 'Failed to check premium status.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/premium/start-trial - Start free trial
// ══════════════════════════════════════════════════════════════════
router.post('/start-trial', requireAuth, async (req, res) => {
  try {
    const user = await db.get('SELECT trial_used FROM users WHERE id = ?', [req.user.id]);
    const existingTrial = await db.get('SELECT * FROM user_trials WHERE user_id = ?', [req.user.id]);

    if (user.trial_used || existingTrial) {
      return res.status(400).json({ error: 'Trial already used.' });
    }

    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + TRIAL_DURATION_DAYS);

    await db.run(`
      INSERT INTO user_trials (user_id, trial_ends) VALUES (?, ?)
    `, [req.user.id, trialEnds.toISOString()]);

    // Log the action
    await db.run(`
      INSERT INTO premium_access_logs (user_id, action, access_type, duration_days, ip_address)
      VALUES (?, 'trial_started', 'trial', ?, ?)
    `, [req.user.id, TRIAL_DURATION_DAYS, req.ip]);

    res.json({
      success: true,
      message: `Your ${TRIAL_DURATION_DAYS}-day trial has started!`,
      trialEnds: trialEnds.toISOString()
    });
  } catch (err) {
    console.error('Failed to start trial:', err);
    res.status(500).json({ error: 'Failed to start trial.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/premium/grant-access - Grant premium after ad watched
// ══════════════════════════════════════════════════════════════════
router.post('/grant-access', requireAuth, async (req, res) => {
  const {
    adNetwork = 'admob',
    adUnitId,
    rewardAmount = 1,
    deviceId,
    platform,
    verificationToken // For server-side ad verification (optional)
  } = req.body;

  try {
    // Check daily limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const adsWatchedToday = await db.get(`
      SELECT COUNT(*) as count FROM premium_access_logs
      WHERE user_id = ? AND action = 'ad_watched' AND created_at >= ?
    `, [req.user.id, todayStart.toISOString()]);

    if (adsWatchedToday.count >= MAX_ADS_PER_DAY) {
      return res.status(429).json({
        error: 'Daily ad limit reached. Please try again tomorrow.',
        maxAdsPerDay: MAX_ADS_PER_DAY
      });
    }

    // Calculate new expiry date
    const now = new Date();
    const user = await db.get('SELECT premium_until FROM users WHERE id = ?', [req.user.id]);

    // If already premium, extend from current expiry; otherwise from now
    let expiresAt;
    if (user.premium_until && new Date(user.premium_until) > now) {
      expiresAt = new Date(user.premium_until);
    } else {
      expiresAt = now;
    }
    expiresAt.setDate(expiresAt.getDate() + PREMIUM_DURATION_DAYS);

    // Create premium access record
    await db.run(`
      INSERT INTO premium_access
      (user_id, access_type, expires_at, duration_days, ad_network, ad_unit_id, reward_amount, device_id, platform)
      VALUES (?, 'ad_reward', ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      expiresAt.toISOString(),
      PREMIUM_DURATION_DAYS,
      adNetwork,
      adUnitId || null,
      rewardAmount,
      deviceId || null,
      platform || null
    ]);

    // Update user's premium_until
    await db.run('UPDATE users SET premium_until = ? WHERE id = ?', [expiresAt.toISOString(), req.user.id]);

    // Mark trial as used if exists
    await db.run('UPDATE user_trials SET trial_used = 1 WHERE user_id = ?', [req.user.id]);
    await db.run('UPDATE users SET trial_used = 1 WHERE id = ?', [req.user.id]);

    // Log the action
    await db.run(`
      INSERT INTO premium_access_logs
      (user_id, action, access_type, duration_days, ip_address, device_info)
      VALUES (?, 'ad_watched', 'ad_reward', ?, ?, ?)
    `, [
      req.user.id,
      PREMIUM_DURATION_DAYS,
      req.ip,
      JSON.stringify({ deviceId, platform, adNetwork, adUnitId })
    ]);

    res.json({
      success: true,
      message: `Premium access granted for ${PREMIUM_DURATION_DAYS} days!`,
      premiumUntil: expiresAt.toISOString(),
      durationDays: PREMIUM_DURATION_DAYS
    });
  } catch (err) {
    console.error('Failed to grant premium access:', err);
    res.status(500).json({ error: 'Failed to grant premium access.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// GET /api/premium/history - Get premium access history
// ══════════════════════════════════════════════════════════════════
router.get('/history', requireAuth, async (req, res) => {
  try {
    const history = await db.all(`
      SELECT * FROM premium_access
      WHERE user_id = ?
      ORDER BY granted_at DESC
      LIMIT 50
    `, [req.user.id]);

    const logs = await db.all(`
      SELECT * FROM premium_access_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `, [req.user.id]);

    res.json({ history, logs });
  } catch (err) {
    console.error('Failed to get premium history:', err);
    res.status(500).json({ error: 'Failed to retrieve premium history.' });
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/premium/verify-ad - Verify ad completion (server-side)
// Used for AdMob server-side verification callback
// ══════════════════════════════════════════════════════════════════
router.post('/verify-ad', (req, res) => {
  const {
    ad_network,
    ad_unit,
    reward_amount,
    reward_item,
    timestamp,
    transaction_id,
    user_id,
    signature,
    key_id
  } = req.query;

  // TODO: Implement proper AdMob SSV verification
  // https://developers.google.com/admob/android/ssv

  // For now, just log the callback
  console.log('AdMob SSV Callback:', {
    ad_network,
    ad_unit,
    reward_amount,
    user_id,
    transaction_id,
    timestamp
  });

  // Return 200 to acknowledge receipt
  res.status(200).send('OK');
});

// ══════════════════════════════════════════════════════════════════
// Middleware to check premium access
// Export for use in other routes
// ══════════════════════════════════════════════════════════════════
export async function requirePremium(req, res, next) {
  try {
    const user = await db.get(
      'SELECT premium_until, trial_used FROM users WHERE id = ?',
      [req.user.id]
    );

    const now = new Date().toISOString();

    // Check premium status
    if (user.premium_until && user.premium_until > now) {
      req.isPremium = true;
      return next();
    }

    // Check trial status
    const trial = await db.get('SELECT * FROM user_trials WHERE user_id = ?', [req.user.id]);
    if (trial && !trial.trial_used && trial.trial_ends > now) {
      req.isPremium = true;
      req.isTrial = true;
      return next();
    }

    return res.status(403).json({
      error: 'Premium access required.',
      message: 'Watch a rewarded ad to unlock premium features for 7 days!'
    });
  } catch (err) {
    console.error('Premium check failed:', err);
    res.status(500).json({ error: 'Failed to verify premium status.' });
  }
}

export async function optionalPremium(req, res, next) {
  try {
    if (!req.user) {
      req.isPremium = false;
      return next();
    }

    const user = await db.get('SELECT premium_until FROM users WHERE id = ?', [req.user.id]);
    const now = new Date().toISOString();

    req.isPremium = user.premium_until && user.premium_until > now;

    // Check trial
    if (!req.isPremium) {
      const trial = await db.get('SELECT * FROM user_trials WHERE user_id = ?', [req.user.id]);
      req.isPremium = trial && !trial.trial_used && trial.trial_ends > now;
      req.isTrial = req.isPremium;
    }

    next();
  } catch (err) {
    req.isPremium = false;
    next();
  }
}

export default router;
