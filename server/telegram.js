require('dotenv').config();
const crypto = require('crypto');

/**
 * Verification of Telegram Mini App `initData`.
 *
 * Telegram hands the page a signed blob describing who opened it. It is the
 * only proof of identity we get, and it arrives from the browser, so it must
 * be verified server-side against the bot token — never trusted as sent.
 *
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */

// Reject anything older than this. Without it, a captured initData string
// would stay valid forever and could be replayed.
const MAX_AGE_SECONDS = 24 * 60 * 60;

function botToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set — cannot verify Telegram sign-ins.');
  return token;
}

/**
 * @param {string} initData raw `window.Telegram.WebApp.initData` query string
 * @returns {{ ok: true, user: object, authDate: Date } | { ok: false, reason: string }}
 */
function verifyInitData(initData, { maxAgeSeconds = MAX_AGE_SECONDS } = {}) {
  if (typeof initData !== 'string' || initData.length === 0)
    return { ok: false, reason: 'Missing Telegram sign-in data.' };

  let params;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return { ok: false, reason: 'Malformed Telegram sign-in data.' };
  }

  const hash = params.get('hash');
  if (!hash) return { ok: false, reason: 'Malformed Telegram sign-in data.' };

  // The signed payload is every field except `hash`, sorted, as key=value
  // lines. Order matters, so sort rather than relying on insertion order.
  const checkString = [...params.entries()]
    .filter(([k]) => k !== 'hash')
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken()).digest();
  const expected = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  // Constant-time compare so a wrong hash cannot be narrowed down by timing.
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(hash, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
    return { ok: false, reason: 'Telegram sign-in could not be verified.' };

  const authDate = Number(params.get('auth_date'));
  if (!Number.isFinite(authDate))
    return { ok: false, reason: 'Telegram sign-in is missing its timestamp.' };

  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > maxAgeSeconds)
    return { ok: false, reason: 'Telegram sign-in has expired. Please reopen the app.' };

  let user;
  try {
    user = JSON.parse(params.get('user') || 'null');
  } catch {
    return { ok: false, reason: 'Telegram sign-in is missing user details.' };
  }
  if (!user || !user.id)
    return { ok: false, reason: 'Telegram sign-in is missing user details.' };

  return { ok: true, user, authDate: new Date(authDate * 1000) };
}

module.exports = { verifyInitData, MAX_AGE_SECONDS };
