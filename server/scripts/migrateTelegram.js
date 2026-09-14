/**
 * Adds Telegram Mini App account linking.
 *
 * A Telegram account is linked to an existing LF System user, so the board
 * stays limited to people who already have a campus account. The column is
 * nullable (most users never link) and unique (one Telegram account cannot
 * be linked to two users).
 *
 * Safe to re-run.
 *
 *   npm run db:migrate-telegram
 */
require('dotenv').config();
const pool = require('../db');

(async () => {
  const client = await pool.connect();
  try {
    const { rows: [{ exists }] } = await client.query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_name = 'users' AND column_name = 'telegram_id'
       ) AS exists`
    );

    if (exists) {
      console.log('users.telegram_id already present — nothing to do.');
    } else {
      // BIGINT: Telegram ids already exceed the 32-bit range.
      await client.query('ALTER TABLE users ADD COLUMN telegram_id BIGINT');
      await client.query(
        'CREATE UNIQUE INDEX users_telegram_id_key ON users (telegram_id) WHERE telegram_id IS NOT NULL'
      );
      console.log('users.telegram_id added, with a unique index over linked rows.');
    }

    const { rows } = await client.query(
      'SELECT COUNT(*)::int AS linked FROM users WHERE telegram_id IS NOT NULL'
    );
    console.log(`Linked Telegram accounts: ${rows[0].linked}`);
  } finally {
    client.release();
    await pool.end();
  }
})().catch((e) => { console.error('Migration failed:', e.message); process.exit(1); });
