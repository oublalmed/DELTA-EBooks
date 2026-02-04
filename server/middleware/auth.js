import jwt from 'jsonwebtoken';
import db from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'delta-ebooks-secret-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'delta-ebooks-refresh-secret-change-in-production';

// Warn if using default secrets in production
if (process.env.NODE_ENV === 'production') {
  if (JWT_SECRET.includes('change-in-production')) {
    console.warn('[SECURITY WARNING] Using default JWT_SECRET in production!');
  }
  if (REFRESH_SECRET.includes('change-in-production')) {
    console.warn('[SECURITY WARNING] Using default REFRESH_SECRET in production!');
  }
}

/**
 * Required auth middleware — rejects if no valid token
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    // Update last active time
    try {
      await db.prepare('UPDATE users SET last_active_at = NOW() WHERE id = ?').run(decoded.id);
    } catch (e) { /* ignore */ }
    
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth middleware — attaches user if valid token, otherwise continues
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
    req.user = null;
  }
  next();
}

/**
 * Admin-only middleware — requires admin role
 * SECURITY: This is the gatekeeper for all admin routes
 */
export async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Double-check role from database for security
    const user = await db.prepare('SELECT id, email, role, status FROM users WHERE id = ?').get(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account suspended' });
    }
    
    if (user.role !== 'admin') {
      // Log unauthorized admin access attempt
      console.warn(`[SECURITY] Unauthorized admin access attempt by user ${user.id} (${user.email})`);
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = { ...decoded, role: user.role };
    req.isAdmin = true;
    
    // Update last active time
    await db.prepare('UPDATE users SET last_active_at = NOW() WHERE id = ?').run(decoded.id);
    
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Check if user is admin (non-blocking, just sets flag)
 */
export async function checkAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  req.isAdmin = false;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.prepare('SELECT role FROM users WHERE id = ?').get(decoded.id);
    req.isAdmin = user?.role === 'admin';
  } catch { /* ignore */ }
  next();
}

/**
 * Generate a JWT access token for a user
 * Short-lived (15 minutes) for security
 */
export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      role: user.role || 'client',
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: '15m' } // Short-lived for security
  );
}

/**
 * Generate a long-lived refresh token
 * Used to obtain new access tokens
 */
export function generateRefreshToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      type: 'refresh'
    },
    REFRESH_SECRET,
    { expiresIn: '30d' } // Long-lived
  );
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
