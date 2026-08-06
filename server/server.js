require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./db');
const { getAllMatches } = require('./matching');
const { uploadToB2 }   = require('./b2Service');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Vercel Serverless Function route prefix normalizer
app.use((req, res, next) => {
  if (req.url.startsWith('/api/') && req.url !== '/api') {
    // Keep req.url untouched for Express routes matching /api/*
  }
  next();
});

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'LF System API is running serverlessly on Vercel!',
    database: 'Neon PostgreSQL',
    endpoints: [
      '/api/lost-items',
      '/api/found-items',
      '/api/categories',
      '/api/locations',
      '/api/claims',
      '/api/messages',
      '/api/users'
    ]
  });
});

// ── Helper ────────────────────────────────────────────────────────
const q = (text, params) => pool.query(text, params);

// ══════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await q(
      `SELECT u.user_id, u.student_id, u.name, u.email, u.phone,
              u.password, u.profile_image, r.role_id, r.role_name
       FROM users u JOIN roles r USING (role_id)
       WHERE LOWER(u.email) = LOWER($1)`,
      [email]
    );
    const user = rows[0];
    if (!user || user.password !== password)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    res.json({ success: true, user: sanitizeUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone, studentID, roleID, profileImage } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email and password required' });

  try {
    const role    = parseInt(roleID) === 2 ? 2 : 1;
    const sid     = studentID || `STU-${Date.now().toString().slice(-6)}`;
    let avatar = profileImage || '';
    if (avatar && !avatar.startsWith('http')) {
      avatar = await uploadToB2(avatar);
    }

    const { rows } = await q(
      `INSERT INTO users (student_id, name, email, phone, password, role_id, profile_image)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING user_id, student_id, name, email, phone, role_id, profile_image`,
      [sid, name, email, phone || '', password, role, avatar]
    );
    const user = rows[0];
    user.role_name = role === 2 ? 'Admin' : 'User';
    res.json({ success: true, message: 'Registration successful!', user: sanitizeUser(user) });
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ success: false, message: 'Email already registered' });
    res.status(500).json({ message: e.message });
  }
});

app.put('/api/users/profile', async (req, res) => {
  const { UserID, Name, Phone, StudentID, ProfileImage } = req.body;
  if (!UserID || !Name) return res.status(400).json({ success: false, message: 'UserID and Name required' });
  try {
    let avatar = ProfileImage || '';
    if (avatar && !avatar.startsWith('http')) {
      avatar = await uploadToB2(avatar);
    }

    const { rows } = await q(
      `UPDATE users
       SET name = $1, phone = $2, student_id = $3, profile_image = COALESCE(NULLIF($4, ''), profile_image)
       WHERE user_id = $5
       RETURNING user_id, student_id, name, email, phone, role_id, profile_image`,
      [Name, Phone || '', StudentID || '', avatar, UserID]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    const user = rows[0];
    user.role_name = 'User';
    res.json({ success: true, message: 'Profile updated!', user: sanitizeUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/users', async (_req, res) => {
  const { rows } = await q(
    `SELECT u.user_id, u.student_id, u.name, u.email, u.phone, u.profile_image,
            r.role_id, r.role_name
     FROM users u JOIN roles r USING (role_id) ORDER BY u.user_id`
  );
  res.json(rows.map(sanitizeUser));
});

// ══════════════════════════════════════════════════════════════════
// CATEGORIES & LOCATIONS
// ══════════════════════════════════════════════════════════════════
app.get('/api/categories', async (_req, res) => {
  const { rows } = await q('SELECT category_id AS "CategoryID", category_name AS "CategoryName" FROM categories ORDER BY category_id');
  res.json(rows);
});

app.post('/api/categories', async (req, res) => {
  const { CategoryName } = req.body;
  if (!CategoryName) return res.status(400).json({ message: 'Category name required' });
  const { rows } = await q(
    'INSERT INTO categories (category_name) VALUES ($1) RETURNING category_id AS "CategoryID", category_name AS "CategoryName"',
    [CategoryName]
  );
  res.json({ success: true, category: rows[0] });
});

app.put('/api/categories/:id', async (req, res) => {
  const { CategoryName } = req.body;
  if (!CategoryName) return res.status(400).json({ message: 'Category name required' });
  try {
    await q('UPDATE categories SET category_name = $1 WHERE category_id = $2', [CategoryName, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await q('DELETE FROM categories WHERE category_id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: 'Cannot delete category that is currently assigned to reported items' }); }
});

app.get('/api/locations', async (_req, res) => {
  const { rows } = await q('SELECT location_id AS "LocationID", location_name AS "LocationName" FROM locations ORDER BY location_id');
  res.json(rows);
});

app.post('/api/locations', async (req, res) => {
  const { LocationName } = req.body;
  if (!LocationName) return res.status(400).json({ message: 'Location name required' });
  const { rows } = await q(
    'INSERT INTO locations (location_name) VALUES ($1) RETURNING location_id AS "LocationID", location_name AS "LocationName"',
    [LocationName]
  );
  res.json({ success: true, location: rows[0] });
});

app.put('/api/locations/:id', async (req, res) => {
  const { LocationName } = req.body;
  if (!LocationName) return res.status(400).json({ message: 'Location name required' });
  try {
    await q('UPDATE locations SET location_name = $1 WHERE location_id = $2', [LocationName, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/locations/:id', async (req, res) => {
  try {
    await q('DELETE FROM locations WHERE location_id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: 'Cannot delete location that is currently assigned to reported items' }); }
});

// ══════════════════════════════════════════════════════════════════
// LOST ITEMS
// ══════════════════════════════════════════════════════════════════
const LOST_SELECT = `
  SELECT l.lost_id AS "LostID", l.user_id AS "UserID",
         l.category_id AS "CategoryID", l.location_id AS "LocationID",
         l.item_name AS "ItemName", l.brand AS "Brand", l.color AS "Color",
         l.description AS "Description",
         TO_CHAR(l.date_lost, 'YYYY-MM-DD') AS "DateLost",
         l.image AS "Image", l.status AS "Status",
         l.created_at AS "CreatedAt",
         c.category_name AS "CategoryName",
         loc.location_name AS "LocationName",
         u.name AS "OwnerName"
  FROM lost_items l
  JOIN categories c   ON c.category_id  = l.category_id
  JOIN locations  loc ON loc.location_id = l.location_id
  JOIN users      u   ON u.user_id       = l.user_id
`;

app.get('/api/lost-items', async (req, res) => {
  try {
    const { search, categoryId, locationId, status } = req.query;
    let sql    = LOST_SELECT + ' WHERE 1=1';
    const vals = [];

    if (search)     { vals.push(`%${search}%`);     sql += ` AND (l.item_name ILIKE $${vals.length} OR l.brand ILIKE $${vals.length} OR l.color ILIKE $${vals.length} OR l.description ILIKE $${vals.length})`; }
    if (categoryId) { vals.push(categoryId);         sql += ` AND l.category_id = $${vals.length}`; }
    if (locationId) { vals.push(locationId);         sql += ` AND l.location_id = $${vals.length}`; }
    if (status)     { vals.push(status);             sql += ` AND LOWER(l.status) = LOWER($${vals.length})`; }

    sql += ' ORDER BY l.created_at DESC';
    const { rows } = await q(sql, vals);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/lost-items', async (req, res) => {
  const { UserID, CategoryID, LocationID, ItemName, Brand, Color, Description, DateLost, Image } = req.body;
  if (!UserID || !ItemName || !CategoryID || !LocationID)
    return res.status(400).json({ success: false, message: 'Required fields missing' });
  try {
    const imageUrl = (await uploadToB2(Image)) || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=600';
    const { rows } = await q(
      `INSERT INTO lost_items (user_id, category_id, location_id, item_name, brand, color, description, date_lost, image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING lost_id AS "LostID"`,
      [UserID, CategoryID, LocationID, ItemName, Brand || '', Color || '', Description || '',
       DateLost || new Date().toISOString().split('T')[0], imageUrl]
    );

    // Auto-match notifications
    await autoMatchNotify('lost', rows[0].LostID, UserID);

    res.json({ success: true, message: 'Lost item reported!', lostItem: rows[0] });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/lost-items/:id', async (req, res) => {
  await q('DELETE FROM lost_items WHERE lost_id = $1', [req.params.id]);
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════
// FOUND ITEMS
// ══════════════════════════════════════════════════════════════════
const FOUND_SELECT = `
  SELECT f.found_id AS "FoundID", f.user_id AS "UserID",
         f.category_id AS "CategoryID", f.location_id AS "LocationID",
         f.item_name AS "ItemName", f.brand AS "Brand", f.color AS "Color",
         f.description AS "Description",
         TO_CHAR(f.date_found, 'YYYY-MM-DD') AS "DateFound",
         f.image AS "Image", f.status AS "Status",
         f.created_at AS "CreatedAt",
         c.category_name AS "CategoryName",
         loc.location_name AS "LocationName",
         u.name AS "FinderName"
  FROM found_items f
  JOIN categories c   ON c.category_id  = f.category_id
  JOIN locations  loc ON loc.location_id = f.location_id
  JOIN users      u   ON u.user_id       = f.user_id
`;

app.get('/api/found-items', async (req, res) => {
  try {
    const { search, categoryId, locationId, status } = req.query;
    let sql    = FOUND_SELECT + ' WHERE 1=1';
    const vals = [];

    if (search)     { vals.push(`%${search}%`);     sql += ` AND (f.item_name ILIKE $${vals.length} OR f.brand ILIKE $${vals.length} OR f.color ILIKE $${vals.length} OR f.description ILIKE $${vals.length})`; }
    if (categoryId) { vals.push(categoryId);         sql += ` AND f.category_id = $${vals.length}`; }
    if (locationId) { vals.push(locationId);         sql += ` AND f.location_id = $${vals.length}`; }
    if (status)     { vals.push(status);             sql += ` AND LOWER(f.status) = LOWER($${vals.length})`; }

    sql += ' ORDER BY f.created_at DESC';
    const { rows } = await q(sql, vals);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/found-items', async (req, res) => {
  const { UserID, CategoryID, LocationID, ItemName, Brand, Color, Description, DateFound, Image } = req.body;
  if (!UserID || !ItemName || !CategoryID || !LocationID)
    return res.status(400).json({ success: false, message: 'Required fields missing' });
  try {
    const imageUrl = (await uploadToB2(Image)) || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=600';
    const { rows } = await q(
      `INSERT INTO found_items (user_id, category_id, location_id, item_name, brand, color, description, date_found, image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING found_id AS "FoundID"`,
      [UserID, CategoryID, LocationID, ItemName, Brand || '', Color || '', Description || '',
       DateFound || new Date().toISOString().split('T')[0], imageUrl]
    );

    await autoMatchNotify('found', rows[0].FoundID, UserID);
    res.json({ success: true, message: 'Found item reported!', foundItem: rows[0] });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/found-items/:id', async (req, res) => {
  await q(`DELETE FROM found_items WHERE found_id=$1`, [req.params.id]);
  res.json({ success: true, message: 'Item deleted' });
});

app.put('/api/found-items/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await q(`UPDATE found_items SET status=$1 WHERE found_id=$2`, [status || 'Claimed', req.params.id]);
    res.json({ success: true, message: `Item status updated to ${status || 'Claimed'}` });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ══════════════════════════════════════════════════════════════════
// MATCHING ENGINE
// ══════════════════════════════════════════════════════════════════
app.get('/api/matches', async (_req, res) => {
  try {
    const [lostRes, foundRes] = await Promise.all([
      q(LOST_SELECT  + " WHERE l.status = 'Lost' ORDER BY l.created_at DESC"),
      q(FOUND_SELECT + " WHERE f.status = 'Available' ORDER BY f.created_at DESC")
    ]);
    const matches = getAllMatches(lostRes.rows, foundRes.rows);
    res.json(matches);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ══════════════════════════════════════════════════════════════════
// CLAIMS
// ══════════════════════════════════════════════════════════════════
app.get('/api/claims', async (_req, res) => {
  try {
    const { rows } = await q(`
      SELECT cl.claim_id AS "ClaimID", cl.lost_id AS "LostID", cl.found_id AS "FoundID",
             cl.owner_id AS "OwnerID", cl.finder_id AS "FinderID",
             cl.proof AS "Proof", cl.contact_info AS "ContactInfo",
             cl.status AS "Status", cl.admin_notes AS "AdminNotes",
             cl.submitted_at AS "SubmittedAt",
             -- Found item
             json_build_object('ItemName', f.item_name, 'Description', f.description) AS "FoundItem",
             -- Owner
             json_build_object('Name', ou.name, 'Email', ou.email) AS "Owner",
             -- Finder
             json_build_object('Name', fu.name, 'Email', fu.email) AS "Finder"
      FROM claims cl
      LEFT JOIN found_items f  ON f.found_id = cl.found_id
      LEFT JOIN users ou ON ou.user_id = cl.owner_id
      LEFT JOIN users fu ON fu.user_id = cl.finder_id
      ORDER BY cl.submitted_at DESC
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/claims', async (req, res) => {
  const { LostID, FoundID, OwnerID, FinderID, Proof, ContactInfo } = req.body;
  if (!FoundID || !OwnerID || !Proof)
    return res.status(400).json({ success: false, message: 'FoundID, OwnerID, and Proof are required' });
  try {
    const { rows } = await q(
      `INSERT INTO claims (lost_id, found_id, owner_id, finder_id, proof, contact_info)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING claim_id AS "ClaimID"`,
      [LostID || null, FoundID, OwnerID, FinderID || null, Proof, ContactInfo || '']
    );

    // Notify finder
    if (FinderID) {
      await q(
        `INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,'Claim')`,
        [FinderID, `New ownership claim submitted for Found Item #${FoundID}. Please await admin review.`]
      );
    }

    res.json({ success: true, message: 'Claim submitted!', claim: rows[0] });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/claims/:id/status', async (req, res) => {
  const { status, adminNotes } = req.body;
  const claimId = req.params.id;
  try {
    const { rows } = await q(
      `UPDATE claims SET status=$1, admin_notes=$2 WHERE claim_id=$3
       RETURNING claim_id, owner_id, found_id, lost_id`,
      [status, adminNotes || '', claimId]
    );
    const claim = rows[0];
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    if (status === 'Approved') {
      if (claim.found_id) await q(`UPDATE found_items SET status='Claimed' WHERE found_id=$1`, [claim.found_id]);
      if (claim.lost_id)  await q(`UPDATE lost_items  SET status='Claimed' WHERE lost_id=$1`,  [claim.lost_id]);

      // Notify owner
      await q(
        `INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,'Approval')`,
        [claim.owner_id, `Your ownership claim for Found Item #${claim.found_id} has been approved by Campus Safety!`]
      );
    }

    res.json({ success: true, message: `Claim ${status}` });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post(['/api/claims/approve-direct', '/claims/approve-direct'], async (req, res) => {
  const { foundId, finderId, ownerId } = req.body;
  try {
    if (foundId) {
      await q(`UPDATE found_items SET status='Claimed' WHERE found_id=$1`, [foundId]);
    }
    if (foundId && ownerId) {
      await q(`UPDATE claims SET status='Approved' WHERE found_id=$1 AND owner_id=$2`, [foundId, ownerId]);
    }
    if (ownerId) {
      await q(
        `INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,'Approval')`,
        [ownerId, `Your item claim has been approved by the finder! The item is now marked as returned.`]
      );
    }
    res.json({ success: true, message: 'Item marked as returned successfully!' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ══════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════
app.get('/api/notifications', async (req, res) => {
  const { userId } = req.query;
  const sql = userId
    ? `SELECT notification_id AS "NotificationID", user_id AS "UserID", message AS "Message",
              type AS "Type", status AS "Status", created_at AS "Date"
       FROM notifications WHERE user_id=$1 ORDER BY created_at DESC`
    : `SELECT notification_id AS "NotificationID", user_id AS "UserID", message AS "Message",
              type AS "Type", status AS "Status", created_at AS "Date"
       FROM notifications ORDER BY created_at DESC`;
  const { rows } = await q(sql, userId ? [userId] : []);
  res.json(rows);
});

app.put('/api/notifications/:id/read', async (req, res) => {
  await q(`UPDATE notifications SET status='Read' WHERE notification_id=$1`, [req.params.id]);
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════
// MESSAGES
// ══════════════════════════════════════════════════════════════════
app.get('/api/messages', async (req, res) => {
  const { userId1, userId2 } = req.query;
  if (userId1 && userId2) {
    const { rows } = await q(
      `SELECT message_id AS "MessageID", sender_id AS "SenderID",
              receiver_id AS "ReceiverID", item_id AS "ItemID",
              message_text AS "MessageText", created_at AS "Timestamp"
       FROM messages
       WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)
       ORDER BY created_at ASC`,
      [userId1, userId2]
    );
    return res.json(rows);
  }
  const { rows } = await q(`SELECT * FROM messages ORDER BY created_at ASC`);
  res.json(rows);
});

app.post('/api/messages', async (req, res) => {
  const { SenderID, ReceiverID, ItemID, MessageText } = req.body;
  if (!SenderID || !ReceiverID || !MessageText)
    return res.status(400).json({ message: 'Sender, receiver, and message text required' });
  const { rows } = await q(
    `INSERT INTO messages (sender_id, receiver_id, item_id, message_text)
     VALUES ($1,$2,$3,$4)
     RETURNING message_id AS "MessageID", sender_id AS "SenderID",
               receiver_id AS "ReceiverID", item_id AS "ItemID",
               message_text AS "MessageText", created_at AS "Timestamp"`,
    [SenderID, ReceiverID, ItemID || null, MessageText]
  );
  res.json({ success: true, message: rows[0] });
});

// ══════════════════════════════════════════════════════════════════
// ADMIN STATS
// ══════════════════════════════════════════════════════════════════
app.get('/api/admin/stats', async (_req, res) => {
  try {
    const [lostRes, foundRes, claimsRes, usersRes] = await Promise.all([
      q(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='Claimed') AS claimed FROM lost_items`),
      q(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='Claimed') AS claimed FROM found_items`),
      q(`SELECT COUNT(*) FILTER (WHERE status='Pending')  AS pending,
                COUNT(*) FILTER (WHERE status='Approved') AS approved
         FROM claims`),
      q(`SELECT COUNT(*) AS total FROM users`)
    ]);

    const totalLost    = parseInt(lostRes.rows[0].total);
    const claimedLost  = parseInt(lostRes.rows[0].claimed);
    const totalFound   = parseInt(foundRes.rows[0].total);
    const claimedFound = parseInt(foundRes.rows[0].claimed);
    const pending      = parseInt(claimsRes.rows[0].pending);
    const approved     = parseInt(claimsRes.rows[0].approved);
    const totalUsers   = parseInt(usersRes.rows[0].total);
    const recoveryRate = totalLost > 0 ? Math.round((claimedLost / totalLost) * 100) : 0;

    res.json({ totalLost, totalFound, claimedLost, claimedFound, pendingClaims: pending, approvedClaims: approved, totalUsers, recoveryRate });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ══════════════════════════════════════════════════════════════════
// AUTO-MATCH NOTIFICATIONS (internal helper)
// ══════════════════════════════════════════════════════════════════
async function autoMatchNotify(type, itemId, reporterUserId) {
  try {
    const [lostRes, foundRes] = await Promise.all([
      q(LOST_SELECT  + " WHERE l.status = 'Lost'"),
      q(FOUND_SELECT + " WHERE f.status = 'Available'")
    ]);
    const matches = getAllMatches(lostRes.rows, foundRes.rows).filter(m => m.matchScore >= 50);

    for (const match of matches) {
      if (type === 'lost'  && match.lostItem.LostID   === itemId) {
        await q(`INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,'Match')`,
          [reporterUserId, `Match found! Your lost "${match.lostItem.ItemName}" matches a found item with ${match.matchScore}% confidence.`]);
      }
      if (type === 'found' && match.foundItem.FoundID === itemId) {
        await q(`INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,'Match')`,
          [match.lostItem.UserID, `Match found! Someone turned in "${match.foundItem.ItemName}" that matches your lost item (${match.matchScore}% match).`]);
      }
    }
  } catch (e) {
    console.warn('Auto-match notification error:', e.message);
  }
}

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════
const getDefaultAvatar = (name) => {
  const initial = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${initial}&background=0d9488&color=ffffff&bold=true`;
};

function sanitizeUser(u) {
  return {
    UserID:       u.user_id,
    StudentID:    u.student_id,
    Name:         u.name,
    Email:        u.email,
    Phone:        u.phone,
    RoleID:       u.role_id,
    RoleName:     u.role_name,
    ProfileImage: u.profile_image || getDefaultAvatar(u.name)
  };
}

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ LF System API running on http://localhost:${PORT}`);
    console.log(`   Database: Neon PostgreSQL (${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]})`);
  });
}
