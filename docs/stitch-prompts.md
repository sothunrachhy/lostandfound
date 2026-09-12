# Stitch AI prompts — LF System redesign

Prompts for redesigning the LF System UI in Google Stitch, derived from the
tokens actually used in this codebase (not invented ones).

**How to use:** Stitch designs one screen at a time. Paste **Block A** first to
establish the design system, then paste one screen prompt per generation. If
Stitch loses the style between generations, re-paste Block A with it.

---

## Block A — the design system (paste first, reuse every time)

```
Design system for a university Lost & Found web platform called "LF SYSTEM",
built for the Royal University of Phnom Penh (RUPP) in Cambodia.

VIBE
Calm, trustworthy, administrative-but-friendly. Light and airy with generous
whitespace. Institutional software that students actually enjoy using — closer
to Linear or Notion than to a government portal. Clean, not flashy. No dark
mode. No gradients, no glassmorphism, no heavy drop shadows.

COLOR
- Primary: deep teal #0f766e — used for primary buttons, active states, links,
  and brand marks. Its tints: #f0fdfa (soft wash), #ccfbf1 (light fill).
- Neutrals carry most of the UI: text #0f172a (near-black), secondary text
  #64748b, muted text #94a3b8, borders #e2e8f0, page background #f8fafc,
  surfaces pure white #ffffff.
- Semantic accents, used only as small badges and tints, never as large fills:
  · Lost items → rose: #be123c text on #fff1f2
  · Found items → teal: #0f766e text on #f0fdfa
  · Pending / awaiting review → amber: #b45309 text on #fffbeb
  · Online / success → emerald #10b981
Roughly 80% neutral, 15% teal, 5% accent. Color signals meaning, never
decoration.

TYPOGRAPHY
- Headings: "Outfit", weights 700–900, tight line-height. Confident and compact.
- Body and UI: "Plus Jakarta Sans", weights 400–700.
- Khmer text: "Kantumruy Pro" falling back to "Noto Sans Khmer". The interface
  must hold Khmer script without breaking layout — Khmer runs taller and wider
  than Latin, so give text rows vertical breathing room and never fix label
  widths.
- Small, dense type is the house style: labels around 11–12px in ALL CAPS with
  wide letter-spacing, body around 13–14px, card titles 14px bold.

SHAPE & DEPTH
- Border radius: 12px for buttons, inputs, chips and most containers; 16px for
  cards and modals; fully round for avatars and count badges.
- Depth comes from 1px #e2e8f0 borders, not shadows. Use at most a very soft
  shadow on modals and popovers.
- Icons: Lucide, 16–18px, stroke weight 2, always paired with a text label.

LANGUAGE
The interface ships in English, Khmer, Japanese, Korean and Chinese. Keep all
labels short and avoid idioms. Never bake text into images.

WRITING RULES
Never expose technical words to users — no "database", "server", "API",
"backend". Say what the person lost or gained and what they can do next.
Destructive confirmations state the consequence: "This cannot be undone."
```

---

## STUDENT PORTAL

### S1 — Sign in / Register

```
Design a sign-in screen for the LF SYSTEM student portal, using the design
system above.

A single centered card, max 420px wide, on a #f8fafc page. Inside, top to
bottom:
- A 48px rounded-square teal #0f766e brand mark with a white icon, centered
- "LF SYSTEM" as a bold Outfit heading
- A small muted subtitle: "Student — Campus Lost & Found"
- A segmented two-tab switch, "Sign In" / "Register", as a pill inside a
  #f1f5f9 track with the active tab on a white raised chip
- Sign In fields: Email Address, Password
- Register fields: Full Name, then Student ID and Phone side by side in two
  columns, then Email Address, Password
- A full-width teal primary button, 12px radius
- A language switcher as a small discreet control in the corner, offering
  EN / ខ្មែរ / 日本語 / 한국어 / 中文

Show the error state too: a small modal or inline banner reading "Sign In
Failed — Invalid email or password". Keep it calm, not alarming.
```

### S2 — Item board (the main screen)

```
Design the main board for the LF SYSTEM student portal, using the design system
above. This is the screen students spend all their time on.

Top: a slim white header bar with the LF SYSTEM mark on the left, and on the
right a language switcher, a chat icon, a notifications bell with a small amber
count badge, and a round avatar with a presence dot.

Below it, two prominent action buttons: "Report Lost Item" (rose-tinted) and
"Report Found Item" (teal). These are the primary jobs on this page.

A filter row: a search field with a leading magnifier icon, plus dropdowns for
Category and Location.

A tab bar: "All", "Lost Items (n)", "Found Items (n)" — the active tab takes a
solid fill matching its semantic color.

Then a responsive card grid, 3 columns on desktop, 2 on tablet, 1 on phone.
Each card:
- A 200px-tall photo at the top, corners rounded to match the card
- A small ALL-CAPS status badge overlaid top-left: "LOST" in rose or "FOUND" in
  teal
- Top-right overlay badge for state: "CLAIMED" or "AVAILABLE"
- A bottom-left amber badge "PENDING REVIEW" — shown only on the viewer's own
  submissions that an admin has not approved yet
- Body: item name (14px bold), a two-line truncated description, then small
  metadata rows each with a leading 14px icon — brand and color, campus
  location, and the date with time
- A footer row with a "Message" button and, for the card's owner, a delete
  action

Include an empty state: a soft illustration, "No items yet", and a line
inviting the student to file the first report.
```

### S3 — Report an item (modal)

```
Design the "Report a Lost Item" modal for the LF SYSTEM student portal, using
the design system above.

A centered modal, 16px radius, max 560px wide, on a dimmed backdrop. A header
with the title, a one-line description, and an X close button.

A two-column form on desktop collapsing to one on phone:
- Item Name (full width, required)
- Category and Location as dropdowns, side by side
- Brand and Color, side by side
- Date lost, a date field
- Description, a textarea, 3 rows
- An image upload as a dashed-border drop zone with an upload icon and the
  text "Add a photo", showing a thumbnail preview once chosen

A footer with a ghost "Cancel" and a solid teal "Submit Report".

Important: include a calm amber-tinted info note above the footer explaining
that the report is reviewed by campus staff before it appears on the board.
Then show the success state: a modal titled "Sent for Review" with the message
"Your report was submitted. It appears on the campus board once an admin
approves it."
```

### S4 — Chat drawer

```
Design a messaging drawer for the LF SYSTEM student portal, using the design
system above.

A right-side drawer, 420px wide, full height, white, with a 1px left border.

Header: the recipient's round avatar with an emerald presence dot at its
bottom-right corner (grey #cbd5e1 when offline), their name in bold, and a
close button.

Below the header, a horizontally scrolling strip of contact avatars — each a
40px round avatar with a presence dot and a truncated first name beneath. The
selected contact is ringed in teal.

The thread: chat bubbles, 16px radius with one squared corner on the sender's
side. My messages are teal #0f766e with white text, aligned right. Theirs are
white with a #e2e8f0 border, aligned left, preceded by a small 24px avatar.
Timestamps are 10px muted text. Include one bubble containing a shared campus
location — a small map thumbnail with an underlined "Open in Maps" link.

Composer at the bottom: a rounded input, an image attach icon, a location pin
icon, and a circular teal send button.
```

---

## ADMIN PORTAL

### A1 — Shell and dashboard

```
Design the dashboard for the LF SYSTEM admin portal — the staff-facing side of
a university Lost & Found platform — using the design system above. This is
internal tooling for campus safety staff: denser and more businesslike than the
student portal, but the same visual language.

A fixed 240px left sidebar, white at 95% opacity with a 1px right border:
- Brand block at the top: a teal rounded-square mark, "LF SYSTEM" in bold, and
  a tiny teal ALL-CAPS "ADMIN" beneath it
- A muted ALL-CAPS "NAVIGATION" section label
- Nav items at 14px semibold with 18px leading Lucide icons: Dashboard, Claims,
  Reports, Live Chat, Users, Settings. The active item gets a #f0fdfa fill,
  teal text, and a 3px teal left border. "Claims" carries a small round amber
  count badge.
- Pinned to the bottom: "Refresh Data", "Sign Out", and the signed-in admin's
  avatar with name and role

Main area on #f8fafc carrying a very faint large-scale Khmer ornamental
watermark pattern at about 3% opacity — a subtle nod to place, never competing
with content.

A page header bar showing the section name and a breadcrumb "LF System · Admin
Control Center".

Dashboard content:
- A row of four stat tiles: Total Lost, Total Found, Recovery Rate, Pending
  Approvals. Each is a white 16px-radius card with a 1px border, a small tinted
  icon chip, a large Outfit number, and a muted caption. The Pending Approvals
  tile is amber-tinted when non-zero.
- Below: a recovery-over-time line chart and a category breakdown as a
  horizontal bar chart. Muted teal series, thin #e2e8f0 gridlines, no chart
  junk.
- A "Recent Activity" list of compact rows, each with an avatar, a one-line
  description, and a relative timestamp.
```

### A2 — Report moderation (the newest feature)

```
Design the "Report Moderation" screen for the LF SYSTEM admin portal, using the
design system and the admin shell above. Staff use this to approve student
submissions before they go live on the student board.

Page title "Report Moderation Desk" with the subtitle "Review student lost &
found reports before they publish."

A tab row of filter pills showing counts: "All Reports (n)", "Awaiting Approval
(n)" in amber, "Lost Reports (n)" in rose, "Found Reports (n)" in teal. The
Awaiting Approval tab is the one staff live in — make it feel like the default
job.

A search field on the right of the tab row.

Below, two columns side by side on desktop, stacking on narrow screens: "Lost
Item Submissions" and "Found Item Submissions". Each column has a small header
with an icon, a title, and a record count chip.

Each report is a white 16px-radius row card with a 1px border:
- A 56px rounded-square thumbnail on the left
- Item name in bold, a two-line truncated description
- A metadata row with a location pin and a calendar date, 11px muted
- Top-right badges: an amber "PENDING" or grey "REJECTED" state chip beside a
  "LOST"/"FOUND" type chip
- On the far right, a vertical stack of icon buttons: a teal check to approve,
  an amber X to reject, and a rose trash to delete. Each has a tooltip —
  "Approve — publish to the student board", "Reject — keep hidden", "Delete
  report".

Include the empty state for a cleared queue: a check-circle illustration and
"Nothing awaiting review" — it should feel like a reward.

Also show the delete confirmation modal: "Permanently delete the report
"AirPods Pro"? This cannot be undone." with a ghost Cancel and a rose Delete.
```

### A3 — User management

```
Design the "Users" screen for the LF SYSTEM admin portal, using the design
system and the admin shell above.

A page header "User Management" with a search field and an "Add Administrator"
primary button.

A white 16px-radius table card with a 1px border:
- A #f8fafc header row with 11px ALL-CAPS muted column labels: USER, STUDENT
  ID, CONTACT, ROLE, STATUS, ACTIONS
- Each row: a 36px round avatar with a presence dot at its bottom-right —
  emerald when online, #cbd5e1 when offline — next to the name in bold; then
  student ID, email and phone stacked, a role pill ("USER" teal / "ADMIN"
  amber), a status cell reading Online or a relative "last seen", and row
  actions
- Row hover lifts to #f8fafc

A right-hand detail panel that slides in when a row is clicked: an 80px avatar
with a presence dot, the name, a role pill, contact details, counts of reports
filed and items recovered, and destructive actions at the bottom, visually
separated.

Include the confirmation modal: "Permanently delete the account for Sothun
Rachhy (rachhy712@gmail.com)? This cannot be undone."
```

---

## Follow-up prompts

Useful once a screen exists and you want variations:

```
Keep the layout and hierarchy, but make the density tighter — reduce vertical
padding by about a third, as if a staff member reviews 200 of these a day.
```

```
Show this same screen at 390px phone width. The two columns must stack, the
sidebar becomes a bottom tab bar, and no element may cause horizontal scroll.
```

```
Show every state of this screen: loading skeletons, empty, a single item, many
items, and an error.
```

```
Re-render all text in Khmer using Kantumruy Pro, keeping the layout intact, so
I can check that taller script does not break any row.
```

---

## Notes on bringing designs back into code

- Your styling is Tailwind 4, so ask Stitch for **Tailwind classes**, not raw
  CSS, when you export.
- The teal is `teal-700`, the borders are `slate-200`, the page is `slate-50` —
  Tailwind's default palette already matches the hex values above, so exported
  designs map cleanly onto existing classes.
- Both portals currently have **no router** — every screen is state-switched
  inside one page. If a Stitch design implies real URLs or a browser back
  button, that needs React Router first.
- Reuse `OnlineDot` for every presence dot rather than re-implementing it per
  screen.
