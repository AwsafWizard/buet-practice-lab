# Publishing the Practice Lab (Vercel + Supabase)

The public site is the static build from `npm run build:public`: every scanned paper page (`scans`, `scans315`, `scans341`) and the seeded screen-time entries are left out; everything else (topics, labs, chart pane, solved past questions) is in. Without an account, progress stays in the visitor's browser. With an account, progress syncs across their devices.

The private phone Artifact is separate and keeps working as before.

## 1. Supabase (accounts + synced progress) — about 3 minutes

1. Go to supabase.com → **Sign in with GitHub** → **New project** (any name, free plan, pick a region near Dhaka, e.g. Singapore). Save the database password it shows; you won't need it here.
2. When the project is ready: **SQL Editor** → **New query** → paste the whole of `supabase/schema.sql` → **Run**. It creates the `progress` table, the row rules (each user can only touch their own rows) and live updates.
3. **Authentication → URL Configuration**: set **Site URL** to your Vercel address from step 2 below (e.g. `https://buet-practice-lab.vercel.app`) and add the same address under **Redirect URLs**. (Email sign-in links open this address.)
4. Copy two values, both safe to publish: the **Project URL** `https://<project-ref>.supabase.co` (the ref is the id in the dashboard address; also under **Connect** or **Settings → Data API**) and the **publishable key** `sb_publishable_…` from **Settings → API Keys** (older projects call it the *anon public* key, `eyJ…`; either works). Never use a secret / service_role key.

Email sign-in is on by default. Supabase's built-in mailer sends only a few emails per hour; for many users, add an SMTP provider later (Authentication → Emails → SMTP).

## 2. Vercel (hosting) — about 2 minutes

1. Go to vercel.com → **Continue with GitHub** → **Add New → Project** → import **buet-practice-lab**.
2. Settings are read from `vercel.json` (build `npm run build:public`, output `dist`); leave them.
3. **Environment Variables**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the two values from Supabase step 4.
4. **Deploy**. Every later push to the repo redeploys by itself.

## What happens in the app

- Sidebar footer: "Saved on this device · Sign in". Sign in → enter an email → click the link in the email → back on the site, signed in; the footer shows the email and "✓ Synced across devices".
- Each device writes only its own row (`progress`, keyed by user and device) and merges all of the user's rows, the same add-only merge the phone page uses (`runSync` in `src/sync.ts`, Supabase backend in `src/cloud.ts`). A device coming back with an old copy can't wipe newer work.
- If the two variables are missing, the site still works, with no sign-in button.

## Accounts, roles and Threads (added 15 Nov 2026)

One-time setup in Supabase, before (or right after) pushing this code:

1. **SQL Editor → New query** → paste the whole of `supabase/accounts.sql` → **Run** (done on 15 Nov 2026, including the `topics` column; re-run it after editing the file). It creates:
   - a sign-up rule: only `studentID@ce.buet.ac.bd` (7-digit ID) can make a new account. Accounts made earlier with other emails still work.
   - `profiles` (one row per signed-in student), `admins` (by email; seeded with 2204080 and 2204038), and the functions the Account page uses (`is_admin`, `add_admin`, `remove_admin`, `list_members`, `touch_profile`).
   - `threads` + `thread_posts`: anyone can read (no sign-in needed), only admins can write. The author is stamped by the database. `threads.topics` holds topic ids (`pc-law`, `ild`, …); a tagged thread also shows on those topic pages.
   - the public storage bucket `thread-files` (25 MB per file) for attachments; only admins can upload.
   Running it again is safe.
2. **Authentication → Emails → Templates**: in both **Magic Link** and **Confirm signup**, add a line such as `Or enter this code: {{ .Token }}`. The Account page accepts that 6-digit code, which is what makes sign-in work when the email is opened on a different device or app than the one that asked for it.
3. **SMTP**: Supabase's built-in mailer sends only a handful of emails per hour. Before telling classmates, add an SMTP provider under **Authentication → Emails → SMTP Settings** (for example Resend or Brevo, both have free tiers), or most sign-in emails will be refused.

In the app: every course's sidebar has **Threads** (with a count of new ones) and **Account**. Threads tagged with a topic show in that topic's **Overview** tab (CE 301 topics, which have no Overview, get a **💬 Threads** tab); untagged ones show at the top of the course overview. Admins can post from a topic page (pre-tagged) or from the Threads tab, picking any number of topics. The start page's **Sign in** opens `/#/account` in the start page's own colours. Admins see **＋ New thread**, edit / pin / move / delete, and an **Admin** section on the Account page to add or remove admins (by student ID, even before that person has signed in). Nobody can remove their own admin role. Everything still works without signing in.

## Local test with a real project

Put the two values in `.env.local` (git-ignored, see `.env.example`), run `npm run dev`, and add `http://localhost:5173` to Supabase's Redirect URLs.

## Before making it public

The public build still shows the BUET question texts (transcribed), teachers' slide examples and answers drawn from personal handnotes. Decide whether that is fine to share; if not, hide the past-paper pages in the public build.
