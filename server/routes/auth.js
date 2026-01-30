import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import db from '../db.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = Router();
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const isDev = process.env.NODE_ENV !== 'production';

// ── POST /api/auth/register ──
router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    const verificationCode = generateCode();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, name, email_verified, email_verification_token, email_verification_expires) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(email.toLowerCase().trim(), passwordHash, name || '', 0, verificationCode, verificationExpires);

    const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    console.log(`[auth] Verification code for ${user.email}: ${verificationCode}`);

    res.status(201).json({
      user,
      verificationRequired: true,
      verificationHint: 'Check your email for the verification code.',
      devVerificationCode: isDev ? verificationCode : undefined,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── POST /api/auth/login ──
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Email not verified', code: 'EMAIL_NOT_VERIFIED' });
    }

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── POST /api/auth/verify-email ──
router.post('/verify-email', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.email_verified) {
      return res.json({ success: true });
    }
    if (!user.email_verification_token || user.email_verification_token !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    if (user.email_verification_expires && new Date(user.email_verification_expires).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Verification code expired' });
    }

    db.prepare('UPDATE users SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?')
      .run(user.id);

    res.json({ success: true });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ── POST /api/auth/resend-verification ──
router.post('/resend-verification', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.email_verified) {
      return res.json({ success: true });
    }

    const verificationCode = generateCode();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare('UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE id = ?')
      .run(verificationCode, verificationExpires, user.id);

    console.log(`[auth] Resent verification code for ${user.email}: ${verificationCode}`);
    res.json({ success: true, devVerificationCode: isDev ? verificationCode : undefined });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Failed to resend verification' });
  }
});

// ── POST /api/auth/forgot-password ──
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.json({ success: true });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    db.prepare('UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?')
      .run(resetToken, resetExpires, user.id);

    console.log(`[auth] Password reset token for ${user.email}: ${resetToken}`);
    res.json({ success: true, devResetToken: isDev ? resetToken : undefined });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to initiate reset' });
  }
});

// ── POST /api/auth/reset-password ──
router.post('/reset-password', (req, res) => {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res.status(400).json({ error: 'Email, reset token, and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user || !user.password_reset_token) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }
    if (user.password_reset_token !== token) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }
    if (user.password_reset_expires && new Date(user.password_reset_expires).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Reset token expired' });
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    db.prepare('UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?')
      .run(passwordHash, user.id);

    res.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ── POST /api/auth/google ──
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }
    if (!googleClient || !googleClientId) {
      return res.status(500).json({ error: 'Google Sign-In not configured' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const email = payload.email.toLowerCase().trim();
    const googleId = payload.sub;
    const name = payload.name || payload.given_name || '';

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = bcrypt.hashSync(randomPassword, 12);
      const result = db.prepare(
        'INSERT INTO users (email, password_hash, name, email_verified, google_id) VALUES (?, ?, ?, ?, ?)'
      ).run(email, passwordHash, name, 1, googleId);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    } else {
      db.prepare('UPDATE users SET email_verified = 1, google_id = ? WHERE id = ?')
        .run(googleId, user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    }

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Google sign-in error:', err);
    res.status(500).json({ error: 'Google sign-in failed' });
  }
});

// ── GET /api/auth/me ──
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, created_at, email_verified FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// PATCH /api/auth/me
router.patch('/me', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    if (name === undefined) {
      return res.status(400).json({ error: 'No update fields provided' });
    }

    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.id);

    const updatedUser = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
