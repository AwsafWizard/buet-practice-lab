# BUET Practice Lab

Interactive study dashboard for BUET Civil Engineering **L-3/T-1 term finals**. One site, four courses, each with
its own colour theme, topic tabs, labs, solved past papers, planner and mock-exam mode.

**Live site:** https://tf-practice-dashboard.vercel.app

| Course | Route | Topics | Past papers |
|---|---|---|---|
| **CE 311** · Structural Analysis | `/ce311` | 13 | 13 term finals (2007-08 → 2023-24), 192 parts |
| **CE 315** · Design of Concrete Structures I | `/ce315` | 10 | 19 term finals (2002-03 → 2023-24), 427 parts |
| **CE 341** · Principles of Soil Mechanics | `/ce341` | 11 | 13 term finals (2007-08 → 2023-24), 330 parts |
| **CE 301** · Professional Practice & Communication | `/ce301` | 17 | 12 term finals (2011-12 → 2023-24), 262 parts |

## What's inside

- **Topic tabs** with Overview → Approach (animated walk-through) → Lab (interactive, every input selectable) →
  Past Questions → My Problems. CE 301 is a recall course, so its Lab is built for memorising instead:
  flashcards (Leitner boxes), keyword recall, ordering drills, cloze and blurt answers.
- **Every past-paper part** with redrawn figures, answer checks and worked solutions. Numbers come from built-in
  solvers, not typed by hand:
  - CE 311: 2D stiffness frame solver, influence lines and moving loads, portal/cantilever methods, BNBC 2020 wind,
    earthquake and live-load reduction, virtual work, cables and arches, stability/determinacy.
  - CE 315: USD/WSD flexure (singly, doubly, T-beams), shear stirrup design, torsion checks, bond, one- and two-way slabs.
  - CE 341: phase relations, classification, compaction, seepage with a flow-net (Laplace) simulator, effective
    stress, consolidation, stress distribution (Boussinesq, Newmark, Fadum), shear strength test bench, Rankine
    earth pressure.
  - CE 301: tender security / TDS and QCBS calculators; answers follow the class slides and notes.
- **Code pane** (right) with code tables and calculation steps; the topic sidebar collapses to an icon rail.
- **Planner, mock exams and progress:** customisable day planner per course, timed mock-exam mode, formula sheets,
  light XP / streak / mastery tracking and a study-time counter.
- **⋮ menu** on every problem and theory card: extract it as a PDF, open it on its own, or copy it.
- **Accounts (optional):** sign in with a BUET CE student mail (`<studentID>@ce.buet.ac.bd`) by email link or
  6-digit code. Progress then syncs across devices; without an account everything stays in the browser.
  Export / import of progress is on the Account page.
- **Threads:** admins post resources per course in Markdown (KaTeX maths, attachments) and tag them by topic.
  Tagged threads appear in that topic's Overview; anyone can read them without signing in.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

For sign-in and Threads locally, copy `.env.example` to `.env.local` and fill in the Supabase URL and publishable
key. Without them the site still works, just without accounts.

## Builds and tests

| Command | Output | Use |
|---|---|---|
| `npm run dev` | — | local dev server |
| `npm run build` | `dist/` | full site including scanned paper pages |
| `npm run build:public` | `dist/` without `scans*/` | what Vercel deploys |
| `npm run build:single` | `dist-single/index.html` | one offline file, no server needed (scans left out) |
| `npm run build:artifact` | single HTML for a private Claude Artifact | phone copy |
| `npm test` | — | engine tests, every topic tab, every past question renders and computes |
| `npm run typecheck` | — | TypeScript only |

The app uses hash routing (`/#/ce341/...`), so any static host works. Plain paths like `/ce301` are redirected
to the hash route.

## Deploy

Every push to `master` redeploys the site on Vercel (`vercel.json`: `npm run build:public` → `dist`).
Accounts, synced progress and Threads run on Supabase: `supabase/schema.sql` (progress sync) and
`supabase/accounts.sql` (BUET-mail sign-up rule, profiles, admin roles, threads, attachment bucket). Both are
safe to re-run. Full setup, email templates and SMTP notes: [docs/DEPLOY.md](docs/DEPLOY.md).

## Layout

```
src/
  App.tsx, main.tsx        course picker, header (theme toggle + account chip), routes
  store.ts, sync.ts, cloud.ts   progress store, add-only merge, Supabase backend
  account/                 sign-in, Account page, Threads, Markdown editor, topic tags
  components/              shared UI: course picker, rail sidebar, code drawer, structure/ILD views, PDF export
  engine/, kit/, topics/, pyq/, pages/   CE 311 (at the root for history)
  rc/                      CE 315   (ids `rc-`)
  soil/                    CE 341   (ids `sm-`)
  ppc/                     CE 301   (ids `pc-`; content is data in ppc/content/)
public/scans*/             scanned paper pages (left out of the public build)
supabase/                  SQL for progress sync and accounts
docs/                      authoring rules per course + deploy guide
```

Authoring rules for adding topics or papers: [AUTHORING.md](docs/AUTHORING.md) (CE 311 and shared rules),
[CE315_AUTHORING.md](docs/CE315_AUTHORING.md), [CE341_AUTHORING.md](docs/CE341_AUTHORING.md),
[CE301_AUTHORING.md](docs/CE301_AUTHORING.md).

## A note on the content

Past-paper question texts are transcribed from BUET term-final papers, and some worked answers draw on class
slides and students' notes. They are here as a study aid for BUET CE students. The scanned paper pages are kept
out of the public build.
