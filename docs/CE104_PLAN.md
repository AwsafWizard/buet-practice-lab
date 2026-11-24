# CE 104 — Practical Surveying: plan (24 Nov 2026)

The user asked (24 Nov, away, "do everything on your own"): a place to practise MCQ / knowledge questions and
short maths for the daily assessments and the quizzes, and — in place of labs — tools for the field:
data tables for each field work, live calculations and checks, and instructions for doing each job.
Theme chosen by Claude: **Gruvbox** (earthy field-book tones, hi-vis orange like a ranging rod; a
high-contrast light mode for reading in the sun).

## The course this term (Class program.pdf, lecture sheet 2026)
Field days 24 Nov → 3 Dec 2026, BUET playground. Marks (150): attendance 15, **quiz on instruments 15
(25 Nov)**, field works 30, drawings 30, **final quiz & oral 30 (3 Dec)**, practical 30.

| Date | Work |
|---|---|
| Tue 24 Nov | registration, instruments issued, handling of all instruments |
| Wed 25 Nov | **quiz on instruments**; chain survey & levelling |
| Thu 26 Nov | closed traverse & stadia; intro to EDM, total station, drone, TLS, RTK GPS |
| Fri 27 Nov | break |
| Sat 28 Nov | house setting, height & distance; total station simulator |
| Sun 29 Nov | curve setting; data collection with total station |
| Mon 30 Nov | contouring (groups 1–10) / route project (groups 11–20) |
| Tue 1 Dec | the other way round |
| Wed 2 Dec | total station + drone data processing, drawing preparation |
| Thu 3 Dec | **final quiz**, instrument collection, practical & oral (odd groups 8:30, even 10:30) |

## Build (`src/sv/`, route `/ce104`, ids `sv-`)
- **Topics** = the field works (+ instruments, + modern instruments). Each topic page: Learn (notes +
  step-by-step field procedure + submission checklist), Field book (the data sheet tool), Quiz (MCQs),
  Maths (generated short sums), Viva (flashcards).
- **Quiz arena**: every MCQ, by topic or mixed, timed quiz mode (instruments quiz / final quiz presets),
  wrong-answer review. Attempts go through `record()` (`sv-<topic>:mcq:<id>`).
- **Maths drills**: seeded generators (RL by rise & fall / HI, bearings WCB↔RB, included angles,
  lat/dep, closing error, area, stadia distance and constants, tower height, curve elements, contour
  interpolation, scales, tape corrections…), answer box with tolerance, worked steps on reveal.
- **Viva deck**: flashcards (Leitner, `cards` store, ids `sv:`) for the oral.
- **Field book**: one sheet per job, stored in `fieldbook` (synced; later `at` wins per sheet,
  deleted = tombstone). Level book (rise & fall + HI, arithmetic checks), traverse (angles → bearings
  → lat/dep → Bowditch → coordinates → area in acres + decimals), stadia (k, c from known distances; HD,
  RL, plot), height & distance (tower, aerial distance, space triangle), contour grid (RLs → contour
  map), chain survey field book (offsets → plot), house setting (centre-line trench layout + diagonals),
  curve setting (transition + circular deflection tables, super-elevation), route project (CL profile +
  cross-sections + alignment). Each sheet prints on white.
- Engines in `src/sv/engine/*` with vitest tests; worked examples use the 18-batch reports' numbers.

Sources digested into `CE-104 Practical Surveying/Claude digests/` (gitignored folder).

## Built 24 Nov 2026 (status)
- `src/sv/`: `SvApp.tsx` (shell), `registry.ts` (12 topics), `plan.ts` (schedule, marks, next test), `types.ts`.
- Content: `content/<short>.ts` each export `content` ({questions, cards}) and `learn`; loaded by `content/index.ts`
  (glob). 488 questions (MCQ / T-F / blank), 185 viva cards, Learn notes for every topic. Ids `q-<short>-N`, `v-<short>-N`.
  Attempts: `sv-<topic>:mcq:<qid>` (quiz), `sv-<topic>:drill:<gen>` (drills); viva cards in `cards` as `sv:<id>`.
- Field book: `field/*Sheet.tsx` + `field/kinds.tsx` (blank + worked example + editor); sheets live in the synced
  store `fieldbook` (`store.ts`, merged with `later()` in `sync.ts`; delete = tombstone). Grid editor `field/Grid.tsx`.
- Engines `engine/*` (angle, level, traverse, stadia, height, curve, contour) with tests that reproduce the 18-batch
  sheets: level book −0.394 check, traverse closing error ≈ 0.5 m, space triangle ≈ 17 324 m², curve R 455 / T 152.9.
- Class conventions kept: curve ratio = h/b, R to nearest 5 ft, odd length on the LAST chord, set to mid-curve so the
  check is ¼(Δ − 2Sₐ); E = R(sec Δ/2 − 1) (class form; the exact (R+S) form is shown beside it).
- Threads: `ce104` is a `Course` but is NOT in ThreadsPage's course list, because the live Supabase
  `threads_course_check` constraint doesn't allow 'ce104' yet (needs the one-line constraint change, like ce331).
