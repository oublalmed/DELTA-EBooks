/**
 * Email Service
 *
 * Handles sending transactional emails (password reset, etc.)
 *
 * Configuration via environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
 *
 * Falls back to console logging in development when SMTP is not configured.
 */

import nodemailer from 'nodemailer';

// ── Build transporter ───────────────────────────────────────────
let transporter = null;

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || 'noreply@deltaebooks.com';

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  // Verify connection on startup
  transporter.verify()
    .then(() => console.log('[EMAIL] SMTP connection verified'))
    .catch((err) => console.error('[EMAIL] SMTP connection failed:', err.message));
} else {
  console.log('[EMAIL] SMTP not configured — emails will be logged to console in development');
}

// ── Send email helper ───────────────────────────────────────────

/**
 * @param {{ to: string, subject: string, text: string, html?: string }} options
 * @returns {Promise<boolean>} true if sent (or logged in dev), false on error
 */
export async function sendEmail({ to, subject, text, html }) {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"DELTA EBooks" <${emailFrom}>`,
        to,
        subject,
        text,
        html: html || text,
      });
      console.log(`[EMAIL] Sent "${subject}" to ${to}`);
      return true;
    } catch (err) {
      console.error(`[EMAIL] Failed to send "${subject}" to ${to}:`, err.message);
      return false;
    }
  }

  // Development fallback — log the email
  console.log('─────────────────────────────────────────────');
  console.log(`[EMAIL-DEV] To: ${to}`);
  console.log(`[EMAIL-DEV] Subject: ${subject}`);
  console.log(`[EMAIL-DEV] Body:\n${text}`);
  console.log('─────────────────────────────────────────────');
  return true; // Treat as success in dev
}

// ── Password Reset Email ────────────────────────────────────────

/**
 * Send a password reset email with a reset token / link.
 *
 * @param {{ email: string, name: string, resetToken: string, expiresAt: string }} params
 */
export async function sendPasswordResetEmail({ email, name, resetToken, expiresAt }) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/?reset=${resetToken}&email=${encodeURIComponent(email)}`;
  const displayName = name || email.split('@')[0];

  const subject = 'Reset Your DELTA EBooks Password';

  const text = `Hi ${displayName},

You requested a password reset for your DELTA EBooks account.

Your reset code: ${resetToken}

Or use this link: ${resetLink}

This code expires at ${new Date(expiresAt).toLocaleString()}.

If you did not request this, please ignore this email — your password will remain unchanged.

— DELTA EBooks Team`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
  <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 48px; height: 48px; background: #292524; border-radius: 50%; line-height: 48px; text-align: center; color: white; font-size: 20px;">✦</div>
      <h1 style="margin: 16px 0 0; color: #292524; font-size: 24px;">Password Reset</h1>
    </div>

    <p style="color: #57534e; font-size: 15px; line-height: 1.6;">Hi ${displayName},</p>

    <p style="color: #57534e; font-size: 15px; line-height: 1.6;">You requested a password reset for your DELTA EBooks account. Use the code below in the app:</p>

    <div style="background: #f5f5f4; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #292524; margin: 0; font-family: monospace;">${resetToken}</p>
    </div>

    <p style="color: #a8a29e; font-size: 13px; text-align: center;">This code expires at <strong>${new Date(expiresAt).toLocaleString()}</strong></p>

    <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 32px 0;">

    <p style="color: #a8a29e; font-size: 12px; text-align: center;">If you did not request this, please ignore this email — your password will remain unchanged.</p>
  </div>
</body>
</html>`;

  return sendEmail({ to: email, subject, text, html });
}
