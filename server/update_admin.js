require('dotenv').config();
const pool = require('./db');

async function updateAdmin() {
  const client = await pool.connect();
  try {
    console.log('🔄 Updating Admin user credentials in Neon PostgreSQL...');
    
    const { rows } = await client.query('SELECT user_id FROM users WHERE role_id = 2');
    
    if (rows.length > 0) {
      await client.query(
        `UPDATE users SET name = $1, email = $2, password = $3 WHERE role_id = 2`,
        ['Ah Mab', 'admin123@gmail.com', '88887777']
      );
      console.log('✅ Successfully updated Admin account credentials!');
    } else {
      await client.query(
        `INSERT INTO users (student_id, name, email, phone, password, role_id, profile_image)
         VALUES ($1, $2, $3, $4, $5, 2, '')`,
        ['ADM-2026-0001', 'Ah Mab', 'admin123@gmail.com', '+855 12 345 678', '88887777']
      );
      console.log('✅ Created new Admin account Ah Mab!');
    }
  } catch (e) {
    console.error('Error updating admin:', e);
  } finally {
    client.release();
    process.exit();
  }
}

updateAdmin();
