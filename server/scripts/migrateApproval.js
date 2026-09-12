/**
 * Adds the admin-approval workflow to lost_items / found_items.
 *
 * Reports now start as 'Pending' and only appear on the public board once an
 * admin approves them. Rows that already existed are marked 'Approved' so this
 * migration never retroactively hides items that were already published.
 *
 * Safe to re-run: the backfill only touches tables where the column was just
 * created, so it will not re-approve a genuinely pending queue.
 *
 *   node server/scripts/migrateApproval.js
 */
require('dotenv').config();
const pool = require('../db');

const TABLES = ['lost_items', 'found_items'];

(async () => {
  const client = await pool.connect();
  try {
    for (const table of TABLES) {
      const { rows: [{ exists }] } = await client.query(
        `SELECT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_name = $1 AND column_name = 'approval_status'
         ) AS exists`,
        [table]
      );

      if (exists) {
        console.log(`${table}: approval_status already present — leaving data untouched.`);
        continue;
      }

      await client.query(
        `ALTER TABLE ${table}
         ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'Pending'`
      );
      const { rowCount } = await client.query(
        `UPDATE ${table} SET approval_status = 'Approved'`
      );
      console.log(`${table}: column added, ${rowCount} existing report(s) marked Approved.`);
    }

    console.log('');
    for (const table of TABLES) {
      const { rows } = await client.query(
        `SELECT approval_status, COUNT(*)::int AS n FROM ${table} GROUP BY approval_status ORDER BY 1`
      );
      console.log(`${table}: ` + (rows.map(r => `${r.approval_status}=${r.n}`).join('  ') || '(empty)'));
    }
  } finally {
    client.release();
    await pool.end();
  }
})().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
