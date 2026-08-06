require('dotenv').config();
const pool = require('./db');

async function setup() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connected to Neon PostgreSQL...');

    // ── Schema ────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id   SERIAL PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        user_id        SERIAL PRIMARY KEY,
        student_id     VARCHAR(50) UNIQUE,
        name           VARCHAR(150) NOT NULL,
        email          VARCHAR(150) UNIQUE NOT NULL,
        phone          VARCHAR(50),
        password       VARCHAR(255) NOT NULL,
        role_id        INT REFERENCES roles(role_id) DEFAULT 1,
        profile_image  TEXT
      );

      CREATE TABLE IF NOT EXISTS categories (
        category_id   SERIAL PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS locations (
        location_id   SERIAL PRIMARY KEY,
        location_name VARCHAR(150) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lost_items (
        lost_id      SERIAL PRIMARY KEY,
        user_id      INT REFERENCES users(user_id) ON DELETE CASCADE,
        category_id  INT REFERENCES categories(category_id),
        location_id  INT REFERENCES locations(location_id),
        item_name    VARCHAR(200) NOT NULL,
        brand        VARCHAR(100),
        color        VARCHAR(100),
        description  TEXT,
        date_lost    DATE,
        image        TEXT,
        status       VARCHAR(50) DEFAULT 'Lost',
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS found_items (
        found_id     SERIAL PRIMARY KEY,
        user_id      INT REFERENCES users(user_id) ON DELETE CASCADE,
        category_id  INT REFERENCES categories(category_id),
        location_id  INT REFERENCES locations(location_id),
        item_name    VARCHAR(200) NOT NULL,
        brand        VARCHAR(100),
        color        VARCHAR(100),
        description  TEXT,
        date_found   DATE,
        image        TEXT,
        status       VARCHAR(50) DEFAULT 'Available',
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS claims (
        claim_id      SERIAL PRIMARY KEY,
        lost_id       INT REFERENCES lost_items(lost_id) ON DELETE SET NULL,
        found_id      INT REFERENCES found_items(found_id) ON DELETE CASCADE,
        owner_id      INT REFERENCES users(user_id),
        finder_id     INT REFERENCES users(user_id),
        proof         TEXT NOT NULL,
        contact_info  TEXT,
        status        VARCHAR(50) DEFAULT 'Pending',
        admin_notes   TEXT,
        submitted_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notifications (
        notification_id SERIAL PRIMARY KEY,
        user_id         INT REFERENCES users(user_id) ON DELETE CASCADE,
        message         TEXT NOT NULL,
        type            VARCHAR(50) DEFAULT 'General',
        status          VARCHAR(20) DEFAULT 'Unread',
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        message_id   SERIAL PRIMARY KEY,
        sender_id    INT REFERENCES users(user_id) ON DELETE CASCADE,
        receiver_id  INT REFERENCES users(user_id) ON DELETE CASCADE,
        item_id      INT,
        message_text TEXT NOT NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log(' Tables created.');

    // ── Seed (skip if data already exists) ───────────────────────
    const { rows: existingRoles } = await client.query('SELECT * FROM roles LIMIT 1');
    if (existingRoles.length > 0) {
      console.log(' Data already exists — skipping seed.');
      return;
    }

    // Roles
    await client.query(`INSERT INTO roles (role_name) VALUES ('User'), ('Admin')`);

    // Categories
    await client.query(`
      INSERT INTO categories (category_name) VALUES
        ('Electronics & Gadgets'),
        ('IDs & Cards'),
        ('Bags & Wallets'),
        ('Keys & Lanyards'),
        ('Books & Stationery'),
        ('Apparel & Accessories'),
        ('Other Items')
    `);

    // Locations (Royal University of Phnom Penh Campus Map)
    await client.query(`
      INSERT INTO locations (location_name) VALUES
        ('RUPP — Building T'),
        ('RUPP — Building C'),
        ('RUPP — Building D'),
        ('RUPP — IT Building B'),
        ('RUPP — STEM Building'),
        ('RUPP — Faculty of Engineering'),
        ('RUPP — Football Field'),
        ('RUPP — Canteen (Cantinee RUPP)'),
        ('RUPP — DMC Café'),
        ('RUPP — Motorcycle Parking'),
        ('RUPP — Auditorium'),
        ('RUPP — Central Library (បណ្ណាល័យ)'),
        ('RUPP — IFL (Institute of Foreign Languages)')
    `);

    // Admin User
    await client.query(`
      INSERT INTO users (student_id, name, email, phone, password, role_id, profile_image) VALUES
        ('ADM-2024-0001', 'Ah Mab', 'admin123@gmail.com', '+855 12 345 678', '88887777', 2, '')
    `);

    console.log('✅ Initial setup complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
