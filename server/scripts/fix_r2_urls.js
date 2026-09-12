require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const oldPrefix = 'https://07dd571c5a28de09e85c9c7b4fd7f1a6.r2.cloudflarestorage.com/rachhy-cars/';
    const newPrefix = 'https://pub-ace758cbe3c34d8cbc4f60289e34dcd7.r2.dev/';

    const r1 = await pool.query(
      "UPDATE lost_items SET image = REPLACE(image, $1, $2) WHERE image LIKE '%r2.cloudflarestorage.com%'",
      [oldPrefix, newPrefix]
    );

    const r2 = await pool.query(
      "UPDATE found_items SET image = REPLACE(image, $1, $2) WHERE image LIKE '%r2.cloudflarestorage.com%'",
      [oldPrefix, newPrefix]
    );

    console.log(`✅ Fixed R2 URLs — Lost Items: ${r1.rowCount}, Found Items: ${r2.rowCount}`);
  } catch (e) {
    console.error('Error fixing URLs:', e);
  } finally {
    await pool.end();
  }
}

run();
