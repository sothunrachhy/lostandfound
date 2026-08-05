require('dotenv').config();
const pool = require('./db');

async function resetData() {
  const client = await pool.connect();
  try {
    console.log('🧹 Cleaning up demo data...');

    // Clear items, claims, notifications, and messages
    await client.query(`
      TRUNCATE TABLE messages, notifications, claims, lost_items, found_items CASCADE;
    `);

    // Remove demo student users (keep admin user)
    await client.query(`
      DELETE FROM users WHERE role_id = 1;
    `);

    console.log('✅ Demo data successfully removed! System is clean and ready for real users.');
  } catch (err) {
    console.error('❌ Data reset error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resetData();
