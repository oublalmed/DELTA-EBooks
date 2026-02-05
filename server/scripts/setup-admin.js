/**
 * Admin Setup Script
 *
 * This script promotes an existing user to admin role.
 *
 * Usage:
 *   node scripts/setup-admin.js <email>
 *
 * Example:
 *   node scripts/setup-admin.js admin@example.com
 */

import db from '../db.js';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/setup-admin.js <email>');
  console.error('   Example: node scripts/setup-admin.js admin@example.com');
  process.exit(1);
}

(async () => {
  try {
    // Check if user exists
    const user = await db.get('SELECT id, email, name, role FROM users WHERE email = ?', [email.toLowerCase()]);

    if (!user) {
      console.error(`User not found: ${email}`);
      console.error('   Make sure the user has registered first.');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`User ${email} is already an admin.`);
      process.exit(0);
    }

    // Promote to admin
    await db.run('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id]);

    console.log('');
    console.log('══════════════════════════════════════════════════════════════');
    console.log('                    ADMIN SETUP COMPLETE                      ');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`  User: ${user.name || user.email}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: admin`);
    console.log('══════════════════════════════════════════════════════════════');
    console.log('  The user can now access the Admin Dashboard.               ');
    console.log('  Log in and click the "Admin" button in the header.         ');
    console.log('══════════════════════════════════════════════════════════════');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
