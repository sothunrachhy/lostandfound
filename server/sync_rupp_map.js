require('dotenv').config();
const pool = require('./db');

async function syncRuppLocations() {
  const client = await pool.connect();
  try {
    console.log('🔄 Upserting official RUPP map locations to Neon PostgreSQL...');

    const locations = [
      'RUPP — Building T',
      'RUPP — Building C',
      'RUPP — Building D',
      'RUPP — IT Building B',
      'RUPP — STEM Building',
      'RUPP — Faculty of Engineering',
      'RUPP — Football Field',
      'RUPP — Canteen (Cantinee RUPP)',
      'RUPP — DMC Café',
      'RUPP — Motorcycle Parking',
      'RUPP — Auditorium',
      'RUPP — Central Library (បណ្ណាល័យ)',
      'RUPP — IFL (Institute of Foreign Languages)'
    ];

    for (const loc of locations) {
      const { rows } = await client.query('SELECT location_id FROM locations WHERE location_name = $1', [loc]);
      if (rows.length === 0) {
        await client.query('INSERT INTO locations (location_name) VALUES ($1)', [loc]);
      }
    }

    console.log('✅ Successfully updated RUPP campus locations in database!');
  } catch (e) {
    console.error('Error syncing locations:', e);
  } finally {
    client.release();
    process.exit();
  }
}

syncRuppLocations();
