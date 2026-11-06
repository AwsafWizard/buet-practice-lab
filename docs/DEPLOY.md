# Publishing the Practice Lab (Vercel + Supabase)

The public site is the static build from `npm run build:public`: every scanned paper page (`scans`, `scans315`, `scans341`) and the seeded screen-time entries are left out; everything else (topics, labs, chart pane, solved past questions) is in. Without an account, progress stays in the visitor's browser. With an account, progress syncs across their devices.

The private phone Artifact is separate and keeps working as before.

## 1. Supabase (accounts + synced progress) — about 3 minutes

1. Go to supabase.com → **Sign in with GitHub** → **New project** (any name, free plan, pick a region near Dhaka, e.g. Singapore). Save the database password it shows; you won't need it here.
2. When the project is ready: **SQL Editor** → **New query** → paste the whole of `supabase/schema.sql` → **Run**. It creates the `progress` table, the row rules (each user can only touch their own rows) and live updates.
3. **Authentication → URL Configuration**: set **Site URL** to your Vercel address from step 2 below (e.g. `https://buet-practice-lab.vercel.app`) and add the same address under **Redirect URLs**. (Email sign-in links open this address.)
4. **Project Settings → API**: copy the **Project URL** and the **anon public** key. Both are safe to publish.

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

## Local test with a real project

Put the two values in `.env.local` (git-ignored, see `.env.example`), run `npm run dev`, and add `http://localhost:5173` to Supabase's Redirect URLs.

## Before making it public

The public build still shows the BUET question texts (transcribed), teachers' slide examples and answers drawn from personal handnotes. Decide whether that is fine to share; if not, hide the past-paper pages in the public build.
