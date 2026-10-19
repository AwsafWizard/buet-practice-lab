# CE 311 Practice Lab

Interactive study dashboard for BUET **CE 311 — Structural Analysis** (term final, 31 Oct 2026).

- **13 topic tabs**, each with Overview → Approach (animated) → Lab (interactive) → Past Questions → My Problems:
  determinate frames, trusses, influence lines, floor beam & girder (+ truss ILDs), wheel loads, lateral loads
  (portal/cantilever), vertical loads, stability & determinacy, building code & live loads, wind (BNBC 2020),
  earthquake (BNBC 2020), virtual work, cables / suspension bridges / arches.
- **All 192 sub-questions of 13 term finals (2007-08 → 2023-24)** with redrawn figures, answer checks and worked
  solutions. Every number is computed by built-in solvers (2D stiffness solver, influence-line and moving-load
  engines, approximate methods, BNBC 2020 wind/EQ/live-load calculators), not typed by hand.
- **Customisable 12-day planner**, mock-exam mode with a timer, formula sheet, light XP / streak / mastery tracking.
  Progress lives in the browser (export/import JSON from the sidebar).

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

## Builds

| Command | Output | Use |
|---|---|---|
| `npm run build` | `dist/` | full site incl. scanned papers |
| `npm run build:single` | `dist-single/index.html` | one offline file — double-click to open, no server (scans hidden) |
| `npm run build:public` | `dist/` without `scans/` | for public hosting (scans removed, redrawn figures stay) |
| `npm test` | — | engine tests + every topic tab + every past question renders and computes |

The app uses relative paths and hash routing, so any static host works: GitHub Pages, Netlify (drag the `dist`
folder onto app.netlify.com/drop), Vercel, Cloudflare Pages, or a Render static site (build command
`npm run build:public`, publish directory `dist`).

**Before publishing publicly:** the past-paper question texts are BUET exam material, and the scans in `public/scans`
came from a compiled PDF (prokoushol.com watermark). `build:public` already drops the scans; decide whether you are
comfortable sharing the question texts too.

## Layout

- `src/engine/` — solvers (frame2d stiffness, ILD, moving loads, approximate methods, wind, EQ, LLR, VW, cables, determinacy)
- `src/kit/` — solution components and model builders used by past questions
- `src/topics/<id>/` — each topic tab (overview, approach, lab, own problems)
- `src/pyq/papers/` — one file per past paper; see `docs/AUTHORING.md`
- `src/pages/` — overview & planner, topic page, papers & mock mode, formulas
