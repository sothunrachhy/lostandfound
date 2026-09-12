/**
 * One-off migration: replace every plaintext password with a bcrypt hash.
 *
 * Safe to run more than once — rows that are already hashed are skipped, so
 * re-running it will not double-hash anyone out of their account.
 *
 *   node server/scripts/hashPasswords.js
 */
require('dotenv').config();
const pool = require('../db');
const { hashPassword, isHashed } = require('../auth');

(async () => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT user_id, email, password FROM users');
    console.log(`Found ${rows.length} user(s).`);

    let hashed = 0, skipped = 0;
    for (const u of rows) {
      if (isHashed(u.password)) { skipped++; continue; }
      await client.query('UPDATE users SET password=$1 WHERE user_id=$2', [
        await hashPassword(u.password), u.user_id
      ]);
      console.log(`  hashed  ${u.email}`);
      hashed++;
    }

    console.log(`\nDone — ${hashed} hashed, ${skipped} already hashed.`);

    const { rows: left } = await client.query(
      `SELECT COUNT(*)::int AS n FROM users WHERE password NOT LIKE '$2%'`
    );
    console.log(left[0].n === 0
      ? 'Verified: no plaintext passwords remain.'
      : `WARNING: ${left[0].n} row(s) still look like plaintext.`);
  } finally {
    client.release();
    await pool.end();
  }
})().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
