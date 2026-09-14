# Telegram Mini App — setup

A read-only view of the campus board that runs inside Telegram. Students link
their existing LF System account once, then open the board straight from a
Telegram chat.

Everything in the codebase is done. The steps below are the parts that need a
Telegram account and a deployment, which cannot be scripted.

---

## What it does

- **Links to an existing account.** On first open the student signs in once
  with their LF email and password. That stores their Telegram id against
  their user row; every open after that is instant.
- **Browses the board.** Lost and Found tabs, search across name, description,
  location, category, brand and colour, and a detail view per item.
- **Matches the user's Telegram theme**, light or dark, using the colour
  variables Telegram provides.

It deliberately does **not** report items, show claims, or include chat. Those
stay in the full portals.

---

## 1. Create the bot

In Telegram, message [@BotFather](https://t.me/BotFather):

```
/newbot
```

Give it a name (`LF System`) and a username ending in `bot`
(`rupp_lostfound_bot`). BotFather replies with a token that looks like:

```
8123456789:AAF3x9_exampleTokenValueGoesHere
```

**That token is a credential.** Anyone holding it can act as your bot and forge
Mini App sign-ins. Keep it out of git — `.env` is already ignored.

---

## 2. Deploy the mini app

It is a separate Vite app in `telegram/`, deployed like the other two portals.

On Vercel, create a project from this repo with:

| Setting | Value |
|---|---|
| Root directory | `telegram` |
| Build command | `vite build` |
| Output directory | `dist` |
| Env var | `VITE_API_BASE_URL` = your API URL |

Telegram requires **HTTPS**, which Vercel gives you. A Mini App cannot run from
`http://localhost`, so browser-testing is limited to the "Open this from
Telegram" screen — the real flow needs a deployed URL.

---

## 3. Add the token to the API

The bot token lives with the **API** project, not the mini app. The mini app
never sees it; only the server verifies signatures with it.

- Locally: fill in `TELEGRAM_BOT_TOKEN=` in `.env`
- On Vercel: add `TELEGRAM_BOT_TOKEN` to the **root/API** project, then redeploy

Never prefix it with `VITE_`. Anything named `VITE_*` is compiled into the
public bundle and readable by anyone.

Without the token the two Telegram endpoints answer `503` with a clear message
rather than failing obscurely.

---

## 4. Point the bot at the deployed URL

Back in BotFather:

```
/mybots → (your bot) → Bot Settings → Menu Button → Configure menu button
```

Paste the mini app URL and give the button a label such as `Lost & Found`.

Optionally set a description and profile picture in the same menu so the bot
looks finished when students find it.

---

## 5. Run the database migration

Adds the `telegram_id` column. Safe to re-run.

```bash
npm run db:migrate-telegram
```

Already applied to the database this repo points at.

---

## How the sign-in works

```
Telegram  ──signed initData──►  mini app  ──►  POST /api/auth/telegram
                                                     │
                                    verify HMAC-SHA256 with bot token
                                                     │
                              linked? ──yes──►  issue the normal LF JWT
                                     └──no───►  404, show the link screen
```

`initData` is signed by Telegram with your bot token. The server recomputes
the signature in [`server/telegram.js`](../server/telegram.js) and rejects
anything that does not match, so a forged or edited payload cannot sign anyone
in. It also rejects data older than 24 hours, so a captured string cannot be
replayed forever.

Once verified, the mini app uses the **same JWT** as the web portals, so every
authorization rule already in place applies unchanged.

### Linking rules

- Linking requires the correct LF email **and** password — Telegram identity
  alone is not enough to claim an account.
- One Telegram account maps to one LF account, enforced by a unique index.
  Trying to link a second returns `409` with an explanation rather than
  silently moving the link and locking the first person out.

---

## Testing

The server side is covered by the main suite (`npm test`) plus the dedicated
checks written during development: signature verification, tampering, wrong
bot token, replay, missing fields, wrong password, and double-linking.

The **UI** can only be exercised inside Telegram. Once deployed, open the bot
on a phone and check:

1. First open shows the link screen with your Telegram first name
2. A wrong password shows an error rather than silently failing
3. After linking, closing and reopening goes straight to the board
4. Lost/Found tabs, search, and the detail view work
5. The hardware back button closes the detail view instead of the app
6. Switching Telegram between light and dark re-themes the app

---

## Unlinking

The board has an **Unlink** action, which clears the token locally. To break
the link server-side:

```sql
UPDATE users SET telegram_id = NULL WHERE email = 'someone@gmail.com';
```
