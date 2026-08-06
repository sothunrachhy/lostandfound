require('dotenv').config();
const pool = require('./db');

async function sync() {
  const locs = [
    'RUPP Campus 1 — Building A (Humanities)',
    'RUPP Campus 1 — Building B (Science & IT)',
    'RUPP Campus 1 — IFL (Institute of Foreign Languages)',
    'RUPP Campus 1 — Central Library (បណ្ណាល័យ)',
    'RUPP Campus 1 — Sports Field & Canteen',
    'RUPP Campus 2 — Faculty of Engineering (FE)',
    'RUPP Campus 2 — Main Classroom Block'
  ];

  for (const l of locs) {
    const { rows } = await pool.query('SELECT * FROM locations WHERE location_name = $1', [l]);
    if (rows.length === 0) {
      await pool.query('INSERT INTO locations (location_name) VALUES ($1)', [l]);
    }
  }
  console.log('✅ RUPP locations synced into database.');
  await pool.end();
}

sync().catch(console.error);
