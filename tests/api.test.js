/**
 * API security + workflow tests.
 *
 * Run with:  npm test
 *
 * ⚠️  These run against whatever DATABASE_URL points at — there is no separate
 * test database yet. Every fixture this file creates is prefixed with
 * `__test__` and removed in the cleanup hook, but the safest setup is a second
 * Neon branch with its own DATABASE_URL. Do not run this against production
 * data you cannot afford to touch.
 *
 * The suite starts its own API process on an OS-assigned free port, so it
 * never collides with a dev server. Set TEST_PORT to pin it.
 */
require('dotenv').config();
const { test, before, after, describe } = require('node:test');
const assert = require('node:assert');
const { spawn, execFileSync } = require('node:child_process');
const path = require('node:path');
const net = require('node:net');

// A hardcoded port lets a leftover server from a previous run answer the
// readiness check and then die mid-suite, which shows up as scattered
// failures. Ask the OS for a free one instead. listen() is async, so this
// must be awaited — it is resolved in before(), not at module load.
const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

// Assigned in before(); every request builds its URL from BASE at call time.
let PORT = process.env.TEST_PORT ? Number(process.env.TEST_PORT) : null;
let BASE = '';
const PREFIX = '__test__';

const pool = require('../server/db');

let server;
let serverExited = null;
const created = { users: [], lost: [], found: [] };

/* ── helpers ────────────────────────────────────────────────────── */
const hdr = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const api = (method, pathname, { token, body } = {}) =>
  fetch(BASE + pathname, {
    method,
    headers: hdr(token),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

const status = async (...args) => (await api(...args)).status;

async function register(label) {
  const email = `${PREFIX}${label}${Date.now()}${Math.random().toString(36).slice(2, 6)}@example.com`;
  const res = await api('POST', '/api/auth/register', {
    body: { name: `${PREFIX}${label}`, email, password: 'pw123456' },
  });
  const data = await res.json();
  assert.ok(data.success, `could not register fixture user: ${JSON.stringify(data)}`);
  created.users.push(data.user.UserID);
  return data;
}

async function loginAdmin() {
  const res = await api('POST', '/api/auth/login', {
    body: { email: 'admin123@gmail.com', password: '88887777' },
  });
  const data = await res.json();
  assert.ok(data.token, 'admin login failed — has the seed admin password changed?');
  return data;
}

async function createReport(kind, token, userId, name) {
  const [cats, locs] = await Promise.all([
    api('GET', '/api/categories', { token }).then((r) => r.json()),
    api('GET', '/api/locations', { token }).then((r) => r.json()),
  ]);
  const endpoint = kind === 'lost' ? 'lost-items' : 'found-items';
  const res = await api('POST', `/api/${endpoint}`, {
    token,
    body: {
      UserID: userId,
      CategoryID: cats[0].CategoryID,
      LocationID: locs[0].LocationID,
      ItemName: `${PREFIX}${name}`,
    },
  });
  const data = await res.json();
  assert.ok(data.success, `could not create ${kind} fixture: ${JSON.stringify(data)}`);
  const id = kind === 'lost' ? data.lostItem.LostID : data.foundItem.FoundID;
  created[kind].push(id);
  return { id, data };
}

/* ── lifecycle ──────────────────────────────────────────────────── */
before(async () => {
  if (!PORT) PORT = await freePort();
  BASE = `http://localhost:${PORT}`;

  // An explicit TEST_PORT might be occupied; fail loudly rather than
  // silently testing whatever else is listening there.
  if (process.env.TEST_PORT) {
    await new Promise((resolve, reject) => {
      const probe = net.createServer();
      probe.once('error', () => reject(new Error(
        `Port ${PORT} is already in use — refusing to run against a server this suite did not start.`
      )));
      probe.once('listening', () => probe.close(() => resolve()));
      probe.listen(PORT, '127.0.0.1');
    });
  }

  server = spawn(process.execPath, [path.join(__dirname, '..', 'server', 'server.js')], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });

  server.once('exit', (code) => {
    if (code !== null && code !== 0) serverExited = code;
  });

  const deadline = Date.now() + 30000;
  for (;;) {
    if (serverExited !== null)
      throw new Error(`API process exited with code ${serverExited} before becoming ready.`);
    try {
      const res = await fetch(`${BASE}/api`);
      if (res.ok && (await res.json()).status === 'online') return;
    } catch { /* not up yet */ }
    if (Date.now() > deadline) throw new Error(`API did not start on ${PORT}`);
    await new Promise((r) => setTimeout(r, 200));
  }
});

after(async () => {
  await pool.query('DELETE FROM lost_items  WHERE item_name LIKE $1', [`${PREFIX}%`]);
  await pool.query('DELETE FROM found_items WHERE item_name LIKE $1', [`${PREFIX}%`]);
  await pool.query('DELETE FROM users       WHERE email     LIKE $1', [`${PREFIX}%`]);
  await pool.end();

  // child.kill() leaves the tree alive on Windows, and a survivor would
  // poison the next run. Kill the tree explicitly there.
  if (server && server.pid) {
    if (process.platform === 'win32') {
      try {
        execFileSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
      } catch { /* already gone */ }
    } else {
      server.kill('SIGTERM');
    }
  }
});

/* ── 1. authentication ──────────────────────────────────────────── */
describe('authentication', () => {
  test('public endpoints stay reachable', async () => {
    assert.equal(await status('GET', '/api'), 200);
  });

  test('every protected endpoint rejects anonymous callers', async () => {
    const guarded = [
      ['GET', '/api/users'], ['GET', '/api/lost-items'], ['GET', '/api/found-items'],
      ['GET', '/api/messages'], ['GET', '/api/claims'], ['GET', '/api/notifications'],
      ['GET', '/api/matches'], ['GET', '/api/admin/stats'],
      ['DELETE', '/api/lost-items/1'], ['DELETE', '/api/users/1'],
      ['POST', '/api/admin/users'], ['PUT', '/api/lost-items/1/approval'],
    ];
    for (const [method, pathname] of guarded) {
      assert.equal(
        await status(method, pathname, { body: method === 'GET' ? undefined : {} }),
        401,
        `${method} ${pathname} should require authentication`
      );
    }
  });

  test('a token signed with the wrong secret is rejected', async () => {
    const forged = require('jsonwebtoken').sign({ sub: 1, role: 2 }, 'not-the-real-secret');
    assert.equal(await status('GET', '/api/admin/stats', { token: forged }), 401);
  });

  test('malformed tokens are rejected', async () => {
    assert.equal(await status('GET', '/api/users', { token: 'garbage.token.here' }), 401);
  });
});

/* ── 2. passwords ───────────────────────────────────────────────── */
describe('password storage', () => {
  test('no password is stored in plaintext', async () => {
    const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM users WHERE password NOT LIKE '$2%'");
    assert.equal(rows[0].n, 0, 'found plaintext passwords in the users table');
  });

  test('a correct password authenticates and returns a token', async () => {
    const admin = await loginAdmin();
    assert.ok(admin.token.length > 20);
    assert.equal(admin.user.RoleID, 2);
  });

  test('a wrong password is refused and leaks no token', async () => {
    const res = await api('POST', '/api/auth/login', {
      body: { email: 'admin123@gmail.com', password: 'definitely-not-it' },
    });
    assert.equal(res.status, 401);
    assert.ok(!(await res.json()).token);
  });

  test('registration stores a bcrypt hash, never the raw password', async () => {
    const user = await register('pw');
    const { rows } = await pool.query('SELECT password FROM users WHERE user_id = $1', [user.user.UserID]);
    assert.match(rows[0].password, /^\$2[aby]\$/);
    assert.notEqual(rows[0].password, 'pw123456');
  });
});

/* ── 3. privilege separation ────────────────────────────────────── */
describe('privilege separation', () => {
  test('public registration cannot mint an admin', async () => {
    const email = `${PREFIX}esc${Date.now()}@example.com`;
    const res = await api('POST', '/api/auth/register', {
      body: { name: `${PREFIX}esc`, email, password: 'pw123456', roleID: 2 },
    });
    const data = await res.json();
    created.users.push(data.user.UserID);
    assert.equal(data.user.RoleID, 1, 'roleID from the request body must be ignored');
  });

  test('a normal user cannot reach admin-only routes', async () => {
    const user = await register('nonadmin');
    assert.equal(await status('GET', '/api/admin/stats', { token: user.token }), 403);
    assert.equal(await status('GET', '/api/claims', { token: user.token }), 403);
    assert.equal(
      await status('POST', '/api/admin/users', {
        token: user.token,
        body: { name: 'x', email: `${PREFIX}x${Date.now()}@example.com`, password: 'pw123456', roleID: 2 },
      }),
      403
    );
  });
});

/* ── 4. ownership ───────────────────────────────────────────────── */
describe('ownership', () => {
  test('a user cannot delete someone else’s report', async () => {
    const victim = await register('victim');
    const attacker = await register('attacker');
    const { id } = await createReport('lost', victim.token, victim.user.UserID, 'owned');

    assert.equal(await status('DELETE', `/api/lost-items/${id}`, { token: attacker.token }), 404);

    const { rowCount } = await pool.query('SELECT 1 FROM lost_items WHERE lost_id = $1', [id]);
    assert.equal(rowCount, 1, 'the report should have survived');
  });

  test('a user can delete their own report', async () => {
    const owner = await register('owner');
    const { id } = await createReport('lost', owner.token, owner.user.UserID, 'mine');
    assert.equal(await status('DELETE', `/api/lost-items/${id}`, { token: owner.token }), 200);
  });

  test('an admin can delete any report', async () => {
    const owner = await register('owner2');
    const admin = await loginAdmin();
    const { id } = await createReport('lost', owner.token, owner.user.UserID, 'adminreach');
    assert.equal(await status('DELETE', `/api/lost-items/${id}`, { token: admin.token }), 200);
  });

  test('only the finder may mark a found item returned', async () => {
    const finder = await register('finder');
    const stranger = await register('stranger');
    const { id } = await createReport('found', finder.token, finder.user.UserID, 'returned');

    assert.equal(
      await status('POST', '/api/claims/approve-direct', {
        token: stranger.token,
        body: { foundId: id, finderId: finder.user.UserID, ownerId: stranger.user.UserID },
      }),
      403,
      'finderId in the body must not grant authority'
    );

    assert.equal(
      await status('POST', '/api/claims/approve-direct', {
        token: finder.token,
        body: { foundId: id, ownerId: stranger.user.UserID },
      }),
      200
    );
  });

  test('a user cannot edit someone else’s profile', async () => {
    const target = await register('target');
    const attacker = await register('attacker2');

    await api('PUT', '/api/users/profile', {
      token: attacker.token,
      body: { UserID: target.user.UserID, Name: 'HACKED' },
    });

    const { rows } = await pool.query('SELECT name FROM users WHERE user_id = $1', [target.user.UserID]);
    assert.notEqual(rows[0].name, 'HACKED');
  });

  test('a user cannot read a conversation they are not part of', async () => {
    const a = await register('talkerA');
    const b = await register('talkerB');
    const snoop = await register('snoop');
    const secret = `${PREFIX}secret-thread`;

    await pool.query('INSERT INTO messages (sender_id, receiver_id, message_text) VALUES ($1,$2,$3)', [
      a.user.UserID, b.user.UserID, secret,
    ]);

    const seen = await api('GET', `/api/messages?userId1=${a.user.UserID}&userId2=${b.user.UserID}`, {
      token: snoop.token,
    }).then((r) => r.json());

    assert.ok(!JSON.stringify(seen).includes(secret));
  });
});

/* ── 5. report moderation ───────────────────────────────────────── */
describe('report moderation', () => {
  test('a new report is held for approval and hidden from other students', async () => {
    const reporter = await register('reporter');
    const bystander = await register('bystander');
    const { id, data } = await createReport('lost', reporter.token, reporter.user.UserID, 'pending');

    assert.equal(data.pending, true);

    const { rows } = await pool.query('SELECT approval_status FROM lost_items WHERE lost_id = $1', [id]);
    assert.equal(rows[0].approval_status, 'Pending');

    const othersView = await api('GET', '/api/lost-items', { token: bystander.token }).then((r) => r.json());
    assert.ok(!othersView.some((i) => i.LostID === id), 'pending reports must not be public');
  });

  test('the reporter can still see their own pending report', async () => {
    const reporter = await register('reporter2');
    const { id } = await createReport('lost', reporter.token, reporter.user.UserID, 'ownpending');

    const ownView = await api('GET', '/api/lost-items', { token: reporter.token }).then((r) => r.json());
    const mine = ownView.find((i) => i.LostID === id);
    assert.ok(mine, 'a reporter should see their own submission');
    assert.equal(mine.ApprovalStatus, 'Pending');
  });

  test('approval publishes the report and notifies the reporter', async () => {
    const reporter = await register('reporter3');
    const bystander = await register('bystander2');
    const admin = await loginAdmin();
    const { id } = await createReport('lost', reporter.token, reporter.user.UserID, 'approve');

    assert.equal(
      await status('PUT', `/api/lost-items/${id}/approval`, { token: admin.token, body: { approval: 'Approved' } }),
      200
    );

    const publicView = await api('GET', '/api/lost-items', { token: bystander.token }).then((r) => r.json());
    assert.ok(publicView.some((i) => i.LostID === id), 'approved reports must be public');

    const notes = await api('GET', '/api/notifications', { token: reporter.token }).then((r) => r.json());
    assert.ok(notes.some((n) => /approved/i.test(n.Message)));
  });

  test('rejected reports stay hidden', async () => {
    const reporter = await register('reporter4');
    const bystander = await register('bystander3');
    const admin = await loginAdmin();
    const { id } = await createReport('lost', reporter.token, reporter.user.UserID, 'reject');

    await api('PUT', `/api/lost-items/${id}/approval`, { token: admin.token, body: { approval: 'Rejected' } });

    const publicView = await api('GET', '/api/lost-items', { token: bystander.token }).then((r) => r.json());
    assert.ok(!publicView.some((i) => i.LostID === id));
  });

  test('students cannot approve, and bad input is refused', async () => {
    const reporter = await register('reporter5');
    const admin = await loginAdmin();
    const { id } = await createReport('lost', reporter.token, reporter.user.UserID, 'perm');

    assert.equal(await status('PUT', `/api/lost-items/${id}/approval`, { token: reporter.token, body: { approval: 'Approved' } }), 403);
    assert.equal(await status('PUT', `/api/lost-items/${id}/approval`, { token: admin.token, body: { approval: 'Maybe' } }), 400);
    assert.equal(await status('PUT', '/api/lost-items/99999999/approval', { token: admin.token, body: { approval: 'Approved' } }), 404);
  });

  test('a student cannot use the approval filter to peek at the queue', async () => {
    const reporter = await register('reporter6');
    const snoop = await register('snoop2');
    const { id } = await createReport('lost', reporter.token, reporter.user.UserID, 'peek');

    const seen = await api('GET', '/api/lost-items?approval=Pending', { token: snoop.token }).then((r) => r.json());
    assert.ok(!seen.some((i) => i.LostID === id));
  });
});

/* ── 6. presence ────────────────────────────────────────────────── */
describe('presence', () => {
  test('every user record carries an isOnline flag', async () => {
    const user = await register('presence');
    const users = await api('GET', '/api/users', { token: user.token }).then((r) => r.json());
    assert.ok(Array.isArray(users));
    assert.ok(users.every((u) => typeof u.isOnline === 'boolean'));
  });

  test('a user idle beyond the window reads as offline', async () => {
    const user = await register('idle');
    await pool.query("UPDATE users SET last_active = NOW() - INTERVAL '10 minutes' WHERE user_id = $1", [user.user.UserID]);

    const admin = await loginAdmin();
    const users = await api('GET', '/api/users', { token: admin.token }).then((r) => r.json());
    assert.equal(users.find((u) => u.UserID === user.user.UserID)?.isOnline, false);
  });
});
