/**
 * Rate Limiting Middleware
 * 
 * Protects against brute force attacks and API abuse
 */

import rateLimit from 'express-rate-limit';

// ══════════════════════════════════════════════════════════════════
// General API Rate Limiter
// ══════════════════════════════════════════════════════════════════
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ══════════════════════════════════════════════════════════════════
// Auth Rate Limiter (stricter for login/register)
// ══════════════════════════════════════════════════════════════════
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    error: 'Too many authentication attempts, please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// ══════════════════════════════════════════════════════════════════
// Password Reset Rate Limiter (very strict)
// ══════════════════════════════════════════════════════════════════
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    error: 'Too many password reset attempts, please try again in 1 hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ══════════════════════════════════════════════════════════════════
// Admin Actions Rate Limiter
// ══════════════════════════════════════════════════════════════════
export const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per window
  message: {
    error: 'Too many admin requests, please slow down.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ══════════════════════════════════════════════════════════════════
// AI Generation Rate Limiter (expensive operation)
// ══════════════════════════════════════════════════════════════════
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 AI generations per hour
  message: {
    error: 'AI generation limit reached, please try again in 1 hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
