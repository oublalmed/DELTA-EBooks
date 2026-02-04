import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db.js';
import { generateToken, generateRefreshToken, requireAuth, verifyRefreshToken } from '../middleware/auth.js';
import { passwordResetLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// ══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════

/**
 * Generate a secure random token for password reset
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate token expiration time (1 hour from now)
 */
function getTokenExpiration(hours = 1) {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
}

// ── POST /api/auth/register ──
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    const result = await db.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).run(email.toLowerCase().trim(), passwordHash, name || '');

    const user = await db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── POST /api/auth/login ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last active
    await db.prepare('UPDATE users SET last_active_at = NOW() WHERE id = ?').run(user.id);

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── GET /api/auth/me ──
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await db.prepare('SELECT id, email, name, role, status, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    // Get purchased books
    const purchases = await db.prepare(
      'SELECT book_id, purchased_at FROM purchases WHERE user_id = ? AND status = ?'
    ).all(req.user.id, 'completed');

    // Get download count
    const downloadCount = await db.prepare(
      'SELECT COUNT(*) as count FROM download_history WHERE user_id = ?'
    ).get(req.user.id);

    res.json({
      user,
      purchases: purchases.map(p => p.book_id),
      purchaseDetails: purchases,
      downloadCount: downloadCount.count,
      isAdmin: user.role === 'admin',
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// PATCH /api/auth/me
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { name, language } = req.body;
    if (name === undefined && language === undefined) {
      return res.status(400).json({ error: 'No update fields provided' });
    }

    if (name !== undefined) {
      await db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.id);
    }
    if (language !== undefined) {
      await db.prepare('UPDATE users SET language = ? WHERE id = ?').run(language, req.user.id);
    }

    const updatedUser = await db.prepare('SELECT id, email, name, language, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ══════════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ══════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/forgot-password
 * Request a password reset token
 * Rate limited: 3 attempts per hour
 */
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await db.prepare('SELECT id, email, name FROM users WHERE email = ?').get(email.toLowerCase().trim());
    
    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate secure reset token
    const resetToken = generateResetToken();
    const resetExpires = getTokenExpiration(1); // 1 hour expiration

    // Store hashed token in database (never store plain token)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    await db.prepare(`
      UPDATE users 
      SET password_reset_token = ?, password_reset_expires = ? 
      WHERE id = ?
    `).run(hashedToken, resetExpires, user.id);

    // In production, send email with reset link
    // For development, return the token directly
    const isDev = process.env.NODE_ENV !== 'production';
    
    if (isDev) {
      // Development mode: return token for testing
      console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);
      return res.json({ 
        success: true, 
        message: 'Password reset token generated.',
        devResetToken: resetToken, // Only in dev mode
        expiresAt: resetExpires.toISOString()
      });
    }

    // Production mode: would send email here
    // TODO: Integrate email service (SendGrid, Mailgun, etc.)
    console.log(`[PROD] Password reset requested for ${email}`);
    
    res.json({ 
      success: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching email and valid token
    const user = await db.prepare(`
      SELECT id, email, password_reset_token, password_reset_expires 
      FROM users 
      WHERE email = ? AND password_reset_token = ?
    `).get(email.toLowerCase().trim(), hashedToken);

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token has expired
    const now = new Date();
    const expires = new Date(user.password_reset_expires);
    
    if (now > expires) {
      // Clear expired token
      await db.prepare(`
        UPDATE users 
        SET password_reset_token = NULL, password_reset_expires = NULL 
        WHERE id = ?
      `).run(user.id);
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    // Hash new password and update
    const passwordHash = bcrypt.hashSync(newPassword, 12);
    
    await db.prepare(`
      UPDATE users 
      SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL, updated_at = NOW()
      WHERE id = ?
    `).run(passwordHash, user.id);

    // Generate new auth token for automatic login
    const authToken = generateToken(user);

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully.',
      token: authToken,
      user: { id: user.id, email: user.email }
    });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ══════════════════════════════════════════════════════════════════
// GOOGLE OAUTH
// ══════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/google
 * Authenticate with Google OAuth
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Verify Google token
    const { OAuth2Client } = await import('google-auth-library');
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID not configured');
      return res.status(500).json({ error: 'Google authentication is not configured' });
    }

    const client = new OAuth2Client(clientId);
    
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError);
      return res.status(401).json({ error: 'Invalid Google credential' });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Check if user exists with this Google ID
    let user = await db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);

    if (!user) {
      // Check if user exists with this email (link accounts)
      user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

      if (user) {
        // Link existing email account with Google
        await db.prepare('UPDATE users SET google_id = ?, updated_at = NOW() WHERE id = ?')
          .run(googleId, user.id);
        console.log(`Linked Google account to existing user: ${email}`);
      } else {
        // Create new user with Google account
        const result = await db.prepare(`
          INSERT INTO users (email, password_hash, name, google_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `).run(
          email.toLowerCase(),
          '', // No password for Google-only accounts
          name || email.split('@')[0],
          googleId
        );

        user = await db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        console.log(`Created new user via Google: ${email}`);
      }
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Update last active
    await db.prepare('UPDATE users SET last_active_at = NOW() WHERE id = ?').run(user.id);

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, user.id);

    const { password_hash, refresh_token, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
      token,
      refreshToken,
      isNewUser: !user.created_at || (new Date() - new Date(user.created_at)) < 60000 // Within 1 minute
    });

  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// ══════════════════════════════════════════════════════════════════
// TOKEN REFRESH
// ══════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Check if token matches stored token
    const user = await db.prepare('SELECT * FROM users WHERE id = ? AND refresh_token = ?')
      .get(decoded.id, refreshToken);

    if (!user) {
      return res.status(401).json({ error: 'Refresh token has been revoked' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update stored refresh token (token rotation)
    await db.prepare('UPDATE users SET refresh_token = ?, last_active_at = NOW() WHERE id = ?')
      .run(newRefreshToken, user.id);

    const { password_hash, refresh_token, ...safeUser } = user;

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      user: safeUser
    });

  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * POST /api/auth/logout
 * Invalidate refresh token
 */
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // Clear refresh token
    await db.prepare('UPDATE users SET refresh_token = NULL WHERE id = ?').run(req.user.id);
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
