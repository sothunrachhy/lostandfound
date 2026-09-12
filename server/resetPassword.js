/**
 * Sets a new password for one account, stored as a bcrypt hash.
 *
 * Because passwords are hashed they cannot be read back, so this is the
 * supported way to restore access to an account whose password was forgotten.
 *
 *   node server/resetPassword.js <email> <newPassword>
 *
 * Example:
 *   node server/resetPassword.js someone@gmail.com student123
 */
require('dotenv').config();
const pool = require('./db');
const { hashPassword, isHashed } = require('./auth');

const [, , email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error('Usage: node server/resetPassword.js <email> <newPassword>');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error('Refusing to set a password shorter than 6 characters.');
  process.exit(1);
}

(async () => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT user_id, name, email, role_id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (rows.length === 0) {
      console.error(`No account found for ${email}`);
      process.exit(1);
    }

    const user = rows[0];
    const { rows: updated } = await client.query(
      'UPDATE users SET password = $1 WHERE user_id = $2 RETURNING password',
      [await hashPassword(newPassword), user.user_id]
    );

    console.log('Password reset for:');
    console.log('  user_id :', user.user_id);
    console.log('  name    :', user.name);
    console.log('  email   :', user.email);
    console.log('  role    :', user.role_id === 2 ? 'Admin' : 'User');
    console.log('  stored  :', isHashed(updated[0].password) ? 'bcrypt hash (not reversible)' : 'NOT HASHED — investigate');
  } finally {
    client.release();
    await pool.end();
  }
})().catch(e => { console.error('Reset failed:', e.message); process.exit(1); });
