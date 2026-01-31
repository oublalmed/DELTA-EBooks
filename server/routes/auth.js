import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = Router();

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
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).run(email.toLowerCase().trim(), passwordHash, name || '');

    const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken(user);

    res.status(201).json({ user, token });
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

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last active
    db.prepare('UPDATE users SET last_active_at = datetime("now") WHERE id = ?').run(user.id);

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── GET /api/auth/me ──
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, role, status, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    // Get purchased books
    const purchases = db.prepare(
      'SELECT book_id, purchased_at FROM purchases WHERE user_id = ? AND status = ?'
    ).all(req.user.id, 'completed');

    // Get download count
    const downloadCount = db.prepare(
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
