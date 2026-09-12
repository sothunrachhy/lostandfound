require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const ROUNDS     = 10;
const EXPIRES_IN = '7d';

// A forgeable secret is worse than a dead deploy: fail loudly instead of
// falling back to a default that would let anyone mint an admin token.
const SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production')
    throw new Error('JWT_SECRET is not set — refusing to start with a guessable signing key.');
  console.warn('⚠️  JWT_SECRET not set — using an insecure dev-only key.');
  return 'lf-dev-only-secret-do-not-use-in-production';
})();

const isHashed = (s) => typeof s === 'string' && /^\$2[aby]\$/.test(s);

const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);

// Accepts legacy plaintext rows so no existing account is locked out, and
// reports them back so the caller can re-store them hashed.
async function verifyPassword(plain, stored) {
  if (!plain || !stored) return { ok: false, needsUpgrade: false };

  if (isHashed(stored)) {
    return { ok: await bcrypt.compare(plain, stored), needsUpgrade: false };
  }

  const a = Buffer.from(String(plain));
  const b = Buffer.from(String(stored));
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  return { ok, needsUpgrade: ok };
}

const signToken = (user) => jwt.sign(
  { sub: user.user_id ?? user.UserID, role: user.role_id ?? user.RoleID },
  SECRET,
  { expiresIn: EXPIRES_IN }
);

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token)
    return res.status(401).json({ success: false, message: 'Authentication required' });

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = { UserID: payload.sub, RoleID: payload.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Session expired — please sign in again.' });
  }
}

const requireAdmin = (req, res, next) => requireAuth(req, res, () => {
  if (req.user.RoleID !== 2)
    return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
});

module.exports = { hashPassword, verifyPassword, isHashed, signToken, requireAuth, requireAdmin };
