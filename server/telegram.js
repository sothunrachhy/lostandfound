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

/* ══════════════════════════════════════════════════════════════
   Outbound: pushing notifications into the Telegram chat
   ══════════════════════════════════════════════════════════════ */

// Telegram rejects anything longer than this.
const MAX_MESSAGE_LENGTH = 4096;

/**
 * Sends a plain-text message from the bot to one chat.
 *
 * Deliberately no parse_mode: message bodies contain user-supplied text, and
 * a stray underscore or asterisk would either break the send or let someone
 * inject formatting into a message that looks system-generated.
 *
 * Never throws. A push failing must not fail the request that triggered it —
 * the in-app notification is the source of truth, this is a convenience.
 *
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
async function sendBotMessage(chatId, text) {
  if (!chatId || !text) return { ok: false, reason: 'missing chat id or text' };

  let token;
  try {
    token = botToken();
  } catch (e) {
    return { ok: false, reason: e.message };
  }

  const body = text.length > MAX_MESSAGE_LENGTH
    ? text.slice(0, MAX_MESSAGE_LENGTH - 1) + '…'
    : text;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: String(chatId),
        text: body,
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json().catch(() => ({}));

    if (!data.ok) {
      // 403 means the person has not started the bot, or blocked it. That is
      // normal and not worth shouting about.
      const reason = data.description || `HTTP ${res.status}`;
      return { ok: false, reason };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

module.exports.sendBotMessage = sendBotMessage;
module.exports.MAX_MESSAGE_LENGTH = MAX_MESSAGE_LENGTH;
